
// Side effect hook for handling data or state updates.
import React, { useState, useEffect } from 'react';
import api, { API_ORIGIN } from '../api/AdminDPGR';
import './DetailRapportAdmin.css';

// Main component exported: DetailRapportAdmin.
export default function DetailRapportAdmin({ rapportId, onBack }) {
// State management using React hooks.
  const [demande, setDemande] = useState(null);
// State management using React hooks.
  const [rapport, setRapport] = useState(null);
// State management using React hooks.
  const [loading, setLoading] = useState(true);

// State management using React hooks.
  const [showValiderModal, setShowValiderModal] = useState(false);
// State management using React hooks.
  const [showRefuserModal, setShowRefuserModal] = useState(false);
// State management using React hooks.
  const [showInfoModal, setShowInfoModal] = useState(false);
// State management using React hooks.
  const [motifRefus, setMotifRefus] = useState('');

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (!rapportId) return;
    const fetchRapport = async () => {
      try {
        setLoading(true);
        const res = await api.demandes.get(rapportId);
        setDemande(res.data || res);
        try {
          const rapportRes = await api.rapports.getByDemande(rapportId);
          const rapportData = rapportRes.data || rapportRes;
          const rapportObj = Array.isArray(rapportData) ? rapportData[0] : rapportData;
          setRapport(rapportObj || null);
        } catch {
          console.warn('Pas de rapport trouvé pour cette demande');
        }
      } catch (err) {
        console.error('Erreur de chargement', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRapport();
  }, [rapportId]);

  const confirmValidation = async () => {
    try {
      await api.demandes.updateStatus(rapportId, 'RAPPORT_VALIDE');
      setShowValiderModal(false);
      onBack();
    } catch {
      alert('Erreur lors de la validation');
    }
  };

  const confirmRefus = async () => {
    if (!motifRefus.trim()) return alert('Le motif est obligatoire');
    try {
      await api.demandes.updateStatus(rapportId, 'RAPPORT_REFUSE', motifRefus);
      setShowRefuserModal(false);
      onBack();
    } catch {
      alert('Erreur lors du refus');
    }
  };

  if (loading) return <div className="detail-rapport-page">Chargement en cours...</div>;
  if (!demande) return null;

  const documentPath = rapport?.fichiers?.find(f => f.type_fichier === 'rapport')?.fichier || null;
  const attestationPath = rapport?.fichiers?.find(f => f.type_fichier === 'attestation')?.fichier || null;
  const documentUrl = documentPath?.startsWith('/') ? `${API_ORIGIN}${documentPath}` : documentPath;
  const attestationUrl = attestationPath?.startsWith('/') ? `${API_ORIGIN}${attestationPath}` : attestationPath;

  const objectifs = rapport ? [
    rapport.objectif_formation && 'Formation',
    rapport.objectif_collaboration && 'Collaboration',
    rapport.objectif_publication && 'Publication',
    rapport.objectif_presentation && 'Présentation',
    rapport.objectif_autre && (rapport.objectif_autre_text || 'Autre'),
  ].filter(Boolean) : [];

  const recommandeLabel = {
    oui_fortement: 'Oui, fortement',
    oui: 'Oui',
    non: 'Non',
    sans_avis: 'Sans avis',
  };

  const fmt = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('fr-FR') : '—';

// Render the component JSX.
  return (
    <div className="detail-rapport-page">

      {/* ── Bouton retour ── */}
      <button onClick={onBack} className="btn-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Retour au registre
      </button>

      {/* ── En-tête ── */}
      <div className="header-section">
        <h1 className="header-titlee">
          Examen du Rapport
          <span className="header-name">| {demande.chercheur_nom} {demande.chercheur_prenom}</span>
        </h1>
      </div>

      {/* ── Contenu principal ── */}
      <div className="detail-container">

        {/* Infos mobilité */}
        <div className="info-grid">
          <div>
            <label className="info-label">Lieu de mobilité</label>
            <div className="info-value info-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {demande.destination || 'Jijel'}
            </div>
          </div>
          <div>
            <label className="info-label">Période du stage</label>
            <div className="info-value info-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Du {fmt(demande.date_debut)} au {fmt(demande.date_fin)}
            </div>
          </div>
        </div>

        {/* Document */}
        <div className="document-section">
          <label className="info-label">Document soumis pour validation</label>
          <div className="document-box">
            <div className="file-info-wrapper">
              <div className="file-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="file-name">Rapport_Final_Stage.pdf</p>
                <p className="file-meta">Format PDF officiel • Prêt pour examen</p>
              </div>
            </div>

            <div className="document-actions">
              {/* Bouton Voir les informations — toujours visible, disabled si pas de rapport */}
              <button
                className="btn-voir"
                onClick={() => setShowInfoModal(true)}
                disabled={!rapport}
                title={!rapport ? 'Aucun rapport disponible' : 'Voir les informations du rapport'}
              >
                Voir les informations
              </button>

              {/* Lien Ouvrir le document */}
              {documentUrl ? (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ouvrir"
                >
                  Ouvrir le document
                </a>
              ) : (
                <span className="file-meta">Fichier non disponible</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions bas de page ── */}
      <div className="detail-actions">
        <button onClick={() => setShowRefuserModal(true)} className="btn-rejet">
          Demander corrections
        </button>
        <button onClick={() => setShowValiderModal(true)} className="btn-valider">
          Valider le rapport
        </button>
      </div>

      {/* ── Modale : Informations du rapport ── */}
      {showInfoModal && rapport && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="modal-title">Informations du Rapport</h2>

            <div className="modal-info-grid">
              <div>
                <p className="info-label">Date de départ réelle</p>
                <p className="info-value">{fmt(rapport.date_depart_reelle)}</p>
              </div>
              <div>
                <p className="info-label">Date de retour réelle</p>
                <p className="info-value">{fmt(rapport.date_retour_reelle)}</p>
              </div>
              <div>
                <p className="info-label">Signataire</p>
                <p className="info-value">{rapport.civilite} {rapport.nom_complet}</p>
              </div>
              <div>
                <p className="info-label">Date de signature</p>
                <p className="info-value">{fmt(rapport.date_signe)}</p>
              </div>
              <div>
                <p className="info-label">Note globale</p>
                <p className="info-value">{rapport.rating ? `${rapport.rating} / 5` : '—'}</p>
              </div>
              <div>
                <p className="info-label">Recommande le séjour</p>
                <p className="info-value">{recommandeLabel[rapport.recommande] || rapport.recommande || '—'}</p>
              </div>
            </div>

            {[
              { label: 'Objectifs', value: objectifs.length > 0 ? objectifs.join(', ') : '—' },
              { label: 'Description', value: rapport.description },
              { label: 'Résultats', value: rapport.resultats },
              { label: 'Publications', value: rapport.publications },
              { label: 'Collaborations', value: rapport.collaborations },
              { label: 'Impact', value: rapport.impact },
              { label: 'Points positifs', value: rapport.points_positifs },
              { label: 'Difficultés', value: rapport.difficultes },
            ].map(({ label, value }) => (
              <div className="modal-field" key={label}>
                <p className="info-label">{label}</p>
                <p className="info-value" style={{ whiteSpace: 'pre-wrap' }}>{value || '—'}</p>
              </div>
            ))}

            {attestationUrl && (
              <div className="modal-field">
                <p className="info-label">Attestation de présence</p>
                <a
                  href={attestationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ouvrir"
                  style={{ display: 'inline-block', marginTop: '6px' }}
                >
                  Ouvrir l'attestation
                </a>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowInfoModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale : Validation ── */}
      {showValiderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Confirmer la validation</h2>
            <p className="modal-text">
              Voulez-vous valider définitivement ce rapport ? Cette action notifiera le chercheur de la fin du processus.
            </p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowValiderModal(false)}>Annuler</button>
              <button className="btn-confirm-v" onClick={confirmValidation}>Valider le rapport</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modale : Corrections ── */}
      {showRefuserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Demander des corrections</h2>
            <p className="modal-text">
              Veuillez indiquer les modifications attendues de la part du chercheur :
            </p>
            <textarea
              className="modal-textarea"
              placeholder="Ex: Le chapitre sur la méthodologie manque de précision..."
              value={motifRefus}
              onChange={e => setMotifRefus(e.target.value)}
            />
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRefuserModal(false)}>Annuler</button>
              <button className="btn-confirm-r" onClick={confirmRefus}>Renvoyer le rapport</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
