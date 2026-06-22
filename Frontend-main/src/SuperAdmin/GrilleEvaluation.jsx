
// Side effect hook for handling data or state updates.
import React, { useEffect, useMemo, useState } from 'react';
import SideBarAdmin from './SideBarAdmin';
import './GrilleEvaluation.css';
import { 
  createCritereSession, 
  deleteCritereSession, 
  getCriteresSession,
  getSessions,
  getGrilleSession,
  createGrilleSession
} from '../api/superadmin';

// Function: GrilleEvaluation.
function GrilleEvaluation({ onNavigate }) {
// State management using React hooks.
  const [sessionId, setSessionId] = useState(null);
// State management using React hooks.
  const [grilleId, setGrilleId] = useState(null);
// State management using React hooks.
  const [savedCriteria, setSavedCriteria] = useState([]);
// State management using React hooks.
  const [draftCriteria, setDraftCriteria] = useState([]);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [saving, setSaving] = useState(false);
// State management using React hooks.
  const [error, setError] = useState('');
// State management using React hooks.
  const [statusMessage, setStatusMessage] = useState('');
// State management using React hooks.
  const [showModal, setShowModal] = useState(false);
// State management using React hooks.
  const [currentEditingId, setCurrentEditingId] = useState(null);
// State management using React hooks.
  const [modalData, setModalData] = useState({
    donnees: '',
    logique: '',
    description: ''
  });

  const totalPoints = useMemo(
    () => savedCriteria.reduce((sum, item) => sum + Number(item.points || 0), 0),
    [savedCriteria]
  );

  const loadGrille = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Récupérer les sessions
      const sessions = await getSessions();
      if (!sessions || sessions.length === 0) {
        setError('Aucune session trouvée');
        return;
      }
      
      // Prendre la première session (ou la session active)
      const session = sessions[0];
      setSessionId(session.id);
      
      // Récupérer la grille de cette session
      const grille = await getGrilleSession(session.id);
      setGrilleId(grille.id);
      
      // Récupérer les critères de cette session
      const criteres = await getCriteresSession(session.id);
      setSavedCriteria(
        criteres.map((item) => ({
          id: item.id,
          critere: item.name,
          points: item.weight,
          donnees_necessaires: item.donnees_necessaires || [],
          logique_verification: item.logique_verification || '',
          description_donnees: item.description_donnees || {},
          type_critere: item.type_critere || 'MANUEL'
        }))
      );
    } catch (err) {
      setError(err.message || "Erreur lors du chargement de la grille d'evaluation.");
    } finally {
      setLoading(false);
    }
  };

// Side effect hook for handling data or state updates.
  useEffect(() => {
    loadGrille();
  }, []);

  const addDraftCritere = () => {
    setDraftCriteria((prev) => [
      ...prev,
      { 
        id: Date.now() + Math.random(), 
        critere: '', 
        points: '', 
        donnees_necessaires: [], 
        logique_verification: '', 
        description_donnees: {},
        type_critere: 'MANUEL'
      }
    ]);
  };

  const updateDraft = (id, field, value) => {
    setDraftCriteria((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const openAdvanced = (id, isDraft) => {
    const item = isDraft 
      ? draftCriteria.find(c => c.id === id) 
      : savedCriteria.find(c => c.id === id);
    if (!item) return;

    setCurrentEditingId(id);
    setModalData({
      donnees: (item.donnees_necessaires || []).join(','),
      logique: item.logique_verification || '',
      description: JSON.stringify(item.description_donnees || {}, null, 2)
    });
    setShowModal(true);
  };

  const saveModal = () => {
    setDraftCriteria(prev => prev.map(item => {
      if (item.id === currentEditingId) {
        return {
          ...item,
          donnees_necessaires: modalData.donnees.split(',').map(s => s.trim()).filter(Boolean),
          logique_verification: modalData.logique,
          description_donnees: JSON.parse(modalData.description || '{}'),
          type_critere: modalData.logique.trim() ? 'AUTO' : 'MANUEL'
        };
      }
      return item;
    }));
    setShowModal(false);
  };

  const saveGrille = async () => {
    if (!sessionId) {
      setError('Aucune session trouvée');
      return;
    }

    const validDrafts = draftCriteria
      .map((item) => ({
        name: item.critere.trim(),
        weight: Number(item.points),
        donnees_necessaires: item.donnees_necessaires,
        logique_verification: item.logique_verification,
        description_donnees: item.description_donnees,
        type_critere: item.type_critere,
        is_active: true
      }))
      .filter((item) => item.name.length > 0 && Number.isFinite(item.weight) && item.weight > 0);

    if (validDrafts.length === 0) {
      setError('Aucun critere valide a enregistrer.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');

      // Créer les critères pour cette session
      await Promise.all(
        validDrafts.map((item) =>
          createCritereSession(sessionId, item)
        )
      );

      setDraftCriteria([]);
      setStatusMessage('Grille synchronisee avec le backend.');
      await loadGrille();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement de la grille.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCritere = async (critereId) => {
    if (!sessionId) {
      setError('Aucune session trouvée');
      return;
    }

    const confirmed = window.confirm('Supprimer ce critere ?');
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');
      await deleteCritereSession(sessionId, critereId);
      setStatusMessage('Critere supprime du backend.');
      await loadGrille();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du critere.');
    } finally {
      setSaving(false);
    }
  };

// Render the component JSX.
  return (
    <SideBarAdmin title="Grille d'Evaluation" activeItem="grille" onNavigate={onNavigate}>
      <div className="grille-page">
        <section className="grille-total-card">
          <span>Total des points</span>
          <strong>{totalPoints}</strong>
        </section>

        <section className="grille-criteria-card">
          <h2>Criteres d'evaluation</h2>
          {error && <p className="grille-feedback grille-feedback--error">{error}</p>}
          {statusMessage && <p className="grille-feedback grille-feedback--success">{statusMessage}</p>}
          {loading && <p className="grille-feedback">Chargement de la grille...</p>}

          <div className="grille-criteria-list">
            {savedCriteria.map((item) => (
              <article key={item.id} className="grille-criteria-row">
                <div className="grille-row-main">
                  <span>{item.critere}</span>
                  {item.type_critere === 'AUTO' && <span className="auto-badge">Auto</span>}
                  {item.logique_verification && (
                    <small className="formula-tag">Logique: {item.logique_verification}</small>
                  )}
                </div>
                <div className="grille-row-actions">
                  <div className="points-pill">
                    <strong>{item.points}</strong>
                    <small>pts</small>
                  </div>
                  <button
                    type="button"
                    className="delete-critere-btn"
                    onClick={() => handleDeleteCritere(item.id)}
                    disabled={saving}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}

            {draftCriteria.map((item) => (
              <article key={item.id} className="grille-criteria-row is-draft">
                <div className="grille-row-main">
                  <input
                    type="text"
                    placeholder="Nom du critere"
                    value={item.critere}
                    onChange={(event) => updateDraft(item.id, 'critere', event.target.value)}
                  />
                  <button 
                    type="button" 
                    className="advanced-btn"
                    onClick={() => openAdvanced(item.id, true)}
                  >
                    ⚙️ Configurer
                  </button>
                </div>
                <div className="points-pill is-input">
                  <input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={item.points}
                    onChange={(event) => updateDraft(item.id, 'points', event.target.value)}
                  />
                  <small>pts</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <button type="button" className="add-critere-btn" onClick={addDraftCritere} disabled={saving || loading}>
          + Ajouter un critere
        </button>

        <button type="button" className="save-grille-btn" onClick={saveGrille} disabled={saving || loading}>
          {saving ? 'Enregistrement...' : 'Enregistrer la grille'}
        </button>

        {showModal && (
          <div className="grille-modal-overlay">
            <div className="grille-modal">
              <h3>Configuration Avancée</h3>
              <div className="modal-field">
                <label>Données nécessaires (séparées par des virgules)</label>
                <input 
                  type="text" 
                  placeholder="ex: experience_years, publications_count"
                  value={modalData.donnees}
                  onChange={e => setModalData({...modalData, donnees: e.target.value})}
                />
              </div>
              <div className="modal-field">
                <label>Description des données (JSON format)</label>
                <textarea 
                  placeholder='ex: {"experience_years": "Nombre d années d expérience"}'
                  value={modalData.description}
                  onChange={e => setModalData({...modalData, description: e.target.value})}
                />
              </div>
              <div className="modal-field">
                <label>Logique de vérification (Python expression)</label>
                <textarea 
                  placeholder="ex: experience_years > 5 and publications_count >= 3"
                  value={modalData.logique}
                  onChange={e => setModalData({...modalData, logique: e.target.value})}
                />
                <small>Laissez vide pour une vérification manuelle.</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-modal" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="button" className="save-modal" onClick={saveModal}>Appliquer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SideBarAdmin>
  );
}

export default GrilleEvaluation;
