
// Side effect hook for handling data or state updates.
import React, { useEffect, useState } from 'react';
import SideBarAdmin from './SideBarAdmin';
import './Basee.css';
import {
  createGrade,              
  createLaboratoire,
  createTypeSejour,
  deleteGrade,
  deleteLaboratoire,
  deleteTypeSejour,
  getGrades,
  getLaboratoires,
  getTypeSejours,
} from '../api/superAdmin';

const EMPTY_DRAFTS = { grades: [], laboratoires: [], typeSejours: [] };

// Function: Basee.
function Basee({ onNavigate }) {
// State management using React hooks.
  const [savedData, setSavedData] = useState({
    grades: [],
    laboratoires: [],
    typeSejours: [],
  });
// State management using React hooks.
  const [draftData, setDraftData] = useState(EMPTY_DRAFTS);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [saving, setSaving] = useState(false);
// State management using React hooks.
  const [error, setError] = useState('');
// State management using React hooks.
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [grades, laboratoires, typeSejours] = await Promise.all([
        getGrades(),
        getLaboratoires(),
        getTypeSejours(),
      ]);

      setSavedData({
        grades,
        laboratoires,
        typeSejours,
      });
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des listes de base.');
    } finally {
      setLoading(false);
    }
  };

// Side effect hook for handling data or state updates.
  useEffect(() => {
    loadData();
  }, []);

  const addDraft = (section) => {
    const id = Date.now() + Math.random();

    if (section === 'grades') {
      setDraftData((prev) => ({
        ...prev,
        grades: [...prev.grades, { id, nom: 'ENS' }],
      }));
      return;
    }

    if (section === 'laboratoires') {
      setDraftData((prev) => ({
        ...prev,
        laboratoires: [...prev.laboratoires, { id, code: '', name: '', directeur: '' }],
      }));
      return;
    }

    setDraftData((prev) => ({
      ...prev,
      typeSejours: [
        ...prev.typeSejours,
        { id, code: 'SSHN', duree_min_jours: '', duree_max_jours: '' },
      ],
    }));
  };

  const updateDraft = (section, id, field, value) => {
    setDraftData((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const saveAll = async () => {
    const gradePayloads = draftData.grades.filter((item) => item.nom);
    const laboratoirePayloads = draftData.laboratoires
      .map((item) => ({
        code: item.code.trim(),
        name: item.name.trim(),
        directeur: item.directeur.trim() || null,
        actif: true,
      }))
      .filter((item) => item.code && item.name);
    const typeSejourPayloads = draftData.typeSejours
      .map((item) => ({
        code: item.code,
        duree_min_jours: item.duree_min_jours === '' ? null : Number(item.duree_min_jours),
        duree_max_jours: item.duree_max_jours === '' ? null : Number(item.duree_max_jours),
      }))
      .filter(
        (item) =>
          item.code &&
          Number.isFinite(item.duree_min_jours) &&
          Number.isFinite(item.duree_max_jours)
      );

    if (!gradePayloads.length && !laboratoirePayloads.length && !typeSejourPayloads.length) {
      setError('Aucune entree valide a enregistrer.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');

      await Promise.all([
        ...gradePayloads.map((item) => createGrade({ nom: item.nom })),
        ...laboratoirePayloads.map((item) => createLaboratoire(item)),
        ...typeSejourPayloads.map((item) => createTypeSejour(item)),
      ]);

      setDraftData(EMPTY_DRAFTS);
      setStatusMessage('Listes de base synchronisees avec le backend.');
      await loadData();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement des listes.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBaseItem = async (section, itemId) => {
    const confirmed = window.confirm('Confirmer la suppression ?');
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');

      if (section === 'grades') await deleteGrade(itemId);
      if (section === 'laboratoires') await deleteLaboratoire(itemId);
      if (section === 'typeSejours') await deleteTypeSejour(itemId);

      setStatusMessage('Element supprime du backend.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setSaving(false);
    }
  };

// Render the component JSX.
  return (
    <SideBarAdmin title="Listes de Base" activeItem="listes" onNavigate={onNavigate}>
      <div className="basee-page">
        {error && <p className="basee-feedback basee-feedback--error">{error}</p>}
        {statusMessage && <p className="basee-feedback basee-feedback--success">{statusMessage}</p>}
        {loading && <p className="basee-feedback">Chargement des listes...</p>}

        <section className="basee-card">
          <div className="basee-head">
            <h2>Grades</h2>
            <button type="button" onClick={() => addDraft('grades')}>
              + Ajouter
            </button>
          </div>

          <div className="basee-list">
            {savedData.grades.map((item) => (
              <article key={item.id} className="basee-item">
                <span>{item.nom}</span>
                <button
                  type="button"
                  className="basee-delete-btn"
                  onClick={() => deleteBaseItem('grades', item.id)}
                  disabled={saving}
                >
                  Supprimer
                </button>
              </article>
            ))}
            {draftData.grades.map((item) => (
              <div key={item.id} className="basee-item is-draft">
                <select
                  className="basee-select"
                  value={item.nom}
                  onChange={(event) => updateDraft('grades', item.id, 'nom', event.target.value)}
                >
                  <option value="ENS">ENS</option>
                  <option value="DOC_NS">DOC_NS</option>
                  <option value="MC_B">MC_B</option>
                  <option value="MC_A">MC_A</option>
                  <option value="PROF">PROF</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        <section className="basee-card">
          <div className="basee-head">
            <h2>Laboratoires / Structures de recherche</h2>
            <button type="button" onClick={() => addDraft('laboratoires')}>
              + Ajouter
            </button>
          </div>

          <div className="basee-list">
            {savedData.laboratoires.map((item) => (
              <article key={item.id} className="basee-item basee-item--stack">
                <div className="basee-item-main">
                  <strong>{item.code} - {item.name}</strong>
                  <small>{item.directeur || 'Directeur non renseigne'}</small>
                </div>
                <button
                  type="button"
                  className="basee-delete-btn"
                  onClick={() => deleteBaseItem('laboratoires', item.id)}
                  disabled={saving}
                >
                  Supprimer
                </button>
              </article>
            ))}
            {draftData.laboratoires.map((item) => (
              <div key={item.id} className="basee-item is-draft basee-item--stack">
                <div className="basee-split-inputs">
                  <input
                    type="text"
                    placeholder="Code"
                    value={item.code}
                    onChange={(event) => updateDraft('laboratoires', item.id, 'code', event.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    value={item.name}
                    onChange={(event) => updateDraft('laboratoires', item.id, 'name', event.target.value)}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Directeur (optionnel)"
                  value={item.directeur}
                  onChange={(event) => updateDraft('laboratoires', item.id, 'directeur', event.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="basee-card">
          <div className="basee-head">
            <h2>Types de sejour</h2>
            <button type="button" onClick={() => addDraft('typeSejours')}>
              + Ajouter
            </button>
          </div>

          <div className="basee-list">
            {savedData.typeSejours.map((item) => (
              <article key={item.id} className="basee-item basee-item--stack">
                <div className="basee-item-main">
                  <strong>{item.code}</strong>
                  <small>
                    Duree: {item.duree_min_jours ?? '-'} a {item.duree_max_jours ?? '-'} jours
                  </small>
                </div>
                <button
                  type="button"
                  className="basee-delete-btn"
                  onClick={() => deleteBaseItem('typeSejours', item.id)}
                  disabled={saving}
                >
                  Supprimer
                </button>
              </article>
            ))}
            {draftData.typeSejours.map((item) => (
              <div key={item.id} className="basee-item is-draft basee-item--stack">
                <div className="basee-split-inputs">
                  <select
                    className="basee-select"
                    value={item.code}
                    onChange={(event) => updateDraft('typeSejours', item.id, 'code', event.target.value)}
                  >
                    <option value="SSHN">SSHN</option>
                    <option value="SPCTT">SPCTT</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="Duree min"
                    value={item.duree_min_jours}
                    onChange={(event) =>
                      updateDraft('typeSejours', item.id, 'duree_min_jours', event.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Duree max"
                    value={item.duree_max_jours}
                    onChange={(event) =>
                      updateDraft('typeSejours', item.id, 'duree_max_jours', event.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <button type="button" className="basee-save-btn" onClick={saveAll} disabled={saving || loading}>
          {saving ? 'Enregistrement...' : 'Enregistrer toutes les modifications'}
        </button>
      </div>
    </SideBarAdmin>
  );
}

export default Basee;
