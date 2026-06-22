
// Side effect hook for handling data or state updates.
import { useState, useEffect, useCallback } from 'react';
import AdminSideBar from './AdminSideBar';
import api, { API_ORIGIN } from '../services/api';
import './ExamenDossier2.css';

/* ── Icons ── */
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IconFile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const TYPE_SEJOUR_LABELS = {
  SSHN: 'Séjour scientifique de haut niveau (SSHN)',
  SPCTT: 'Stage de perfectionnement (SPCTT)',
};

// Function: typeSejourLabel.
function typeSejourLabel(code) {
  if (!code) return '—';
  return TYPE_SEJOUR_LABELS[code] || code;
}

// Function: normalizeList.
function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.results && Array.isArray(payload.results)) return payload.results;
  return [];
}

// Function: chercheurDisplayName.
function chercheurDisplayName(d) {
  const n = [d.chercheur_prenom, d.chercheur_nom].filter(Boolean).join(' ').trim();
  return n || 'Chercheur';
}

// Function: initialsFromDemande.
function initialsFromDemande(d) {
  const p = d.chercheur_prenom?.charAt(0) || '';
  const n = d.chercheur_nom?.charAt(0) || '';
// Render the component JSX.
  return (p + n).toUpperCase() || '?';
}

/** URL absolue pour un fichier renvoyé par l’API (FileField). */
// Function: fichierAbsoluteUrl.
function fichierAbsoluteUrl(fichier) {
  if (!fichier) return '#';
  const path = typeof fichier === 'string' ? fichier : '';
  if (!path) return '#';
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? `${API_ORIGIN}${path}` : `${API_ORIGIN}/media/${path}`;
}

// Main component exported: ExamenDossier.
export default function ExamenDossier({ onBack, onNavigate }) {
// State management using React hooks.
  const [step, setStep] = useState('list');

// State management using React hooks.
  const [list, setList] = useState([]);
// State management using React hooks.
  const [listLoading, setListLoading] = useState(true);
// State management using React hooks.
  const [listError, setListError] = useState(null);

// State management using React hooks.
  const [demande, setDemande] = useState(null);
// State management using React hooks.
  const [documents, setDocuments] = useState([]);
// State management using React hooks.
  const [notes, setNotes] = useState('');
// State management using React hooks.
  const [detailLoading, setDetailLoading] = useState(false);
// State management using React hooks.
  const [detailError, setDetailError] = useState(null);
// State management using React hooks.
  const [actionLoading, setActionLoading] = useState(false);

  const loadListe = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const raw = await api.demandes.list({ statut: 'SOUMISE' });
      setList(normalizeList(raw));
    } catch (e) {
      setListError(e.message || 'Impossible de charger les demandes.');
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, []);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    loadListe();
  }, [loadListe]);

  const openDetail = async (id) => {
    setStep('detail');
    setDemande(null);
    setDocuments([]);
    setNotes('');
    setDetailError(null);
    setDetailLoading(true);
    try {
      const [d, docsRaw] = await Promise.all([
        api.demandes.get(id),
        api.demandes.documents(id),
      ]);
      setDemande(d);
      setNotes(d.notes_internes || '');
      setDocuments(normalizeList(docsRaw));
    } catch (e) {
      setDetailError(e.message || 'Impossible de charger le dossier.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setStep('list');
    setDemande(null);
    setDocuments([]);
    setNotes('');
    loadListe();
  };

  const saveNotesIfNeeded = async (demandeId, text) => {
    await api.demandes.updateNotesInternes(demandeId, text);
  };

  const handleApprove = async () => {
    if (!demande?.id) return;
    setActionLoading(true);
    setDetailError(null);
    try {
      await saveNotesIfNeeded(demande.id, notes);
      await api.demandes.approve(demande.id);
      closeDetail();
    } catch (e) {
      setDetailError(e.message || 'Action impossible.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!demande?.id) return;
    const motif = notes.trim();
    if (!motif) {
      setDetailError('Veuillez indiquer un motif dans les notes avant de rejeter.');
      return;
    }
    setActionLoading(true);
    setDetailError(null);
    try {
      await saveNotesIfNeeded(demande.id, notes);
      await api.demandes.reject(demande.id, motif);
      closeDetail();
    } catch (e) {
      setDetailError(e.message || 'Action impossible.');
    } finally {
      setActionLoading(false);
    }
  };

// Render the component JSX.
  return (
    <div className="ed-shell">
      <AdminSideBar
        activePage="deliberation"
        onNavigate={(id) => {
          if (id === 'accueil') onBack();
          if (id === 'statistiques') onNavigate('statistiques');
        }}
      />

      <div className="ed-main">
        <header className="ed-header">
          <h1 className="ed-header-title">
            {step === 'list' ? 'Délibération CS — demandes à examiner' : 'Examen de dossier'}
          </h1>
          <div className="ed-header-right">
            <button type="button" className="ed-notif-btn" aria-label="Notifications">
              <IconBell />
            </button>
            <div className="ed-avatar">FA</div>
          </div>
        </header>

        <main className="ed-body">
          {step === 'list' && (
            <>
              {listLoading && <p className="ed-muted">Chargement…</p>}
              {listError && <p className="ed-error-banner">{listError}</p>}
              {!listLoading && !listError && list.length === 0 && (
                <div className="ed-card ed-empty">
                  <p className="ed-empty-title">Aucune demande en délibération</p>
                  <p className="ed-muted">Les dossiers au statut « Délibération CS » apparaîtront ici.</p>
                </div>
              )}
              {!listLoading && list.length > 0 && (
                <div className="ed-list">
                  {list.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className="ed-list-row"
                      onClick={() => openDetail(d.id)}
                    >
                      <div className="ed-list-avatar">{initialsFromDemande(d)}</div>
                      <div className="ed-list-main">
                        <p className="ed-list-name">{chercheurDisplayName(d)}</p>
                        <p className="ed-list-sub">
                          {d.destination || '—'} · {typeSejourLabel(d.type_sejour_code)}
                        </p>
                      </div>
                      <div
                        className={
                          d.eligible ? 'ed-badge ed-badge-eligible' : 'ed-badge ed-badge-ineligible'
                        }
                      >
                        {d.eligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'detail' && (
            <>
              <button type="button" className="ed-back-btn" onClick={closeDetail}>
                <IconArrowLeft /> Retour à la liste
              </button>

              {detailLoading && <p className="ed-muted">Chargement du dossier…</p>}
              {detailError && !detailLoading && <p className="ed-error-banner">{detailError}</p>}

              {!detailLoading && demande && (
                <>
                  <div className="ed-card">
                    <div className="ed-chercheur-top">
                      <div className="ed-chercheur-avatar">{initialsFromDemande(demande)}</div>
                      <div>
                        <p className="ed-chercheur-name">{chercheurDisplayName(demande)}</p>
                        <p className="ed-chercheur-sub">
                          {demande.chercheur_grade || '—'} · {demande.chercheur_laboratoire || '—'}
                        </p>
                      </div>
                      <div
                        className={
                          demande.eligible
                            ? 'ed-badge ed-badge-eligible ed-badge-float'
                            : 'ed-badge ed-badge-ineligible ed-badge-float'
                        }
                      >
                        {demande.eligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                      </div>
                    </div>
                    <div className="ed-chercheur-meta">
                      <div>
                        <p className="ed-meta-label">Type de séjour</p>
                        <p className="ed-meta-value">{typeSejourLabel(demande.type_sejour_code)}</p>
                      </div>
                      <div>
                        <p className="ed-meta-label">Destination</p>
                        <p className="ed-meta-value">
                          {[demande.ville_accueil, demande.pays].filter(Boolean).join(', ') ||
                            demande.destination ||
                            '—'}
                        </p>
                      </div>
                      <div>
                        <p className="ed-meta-label">Durée</p>
                        <p className="ed-meta-value">
                          {demande.duree_jours != null ? `${demande.duree_jours} jours` : '—'}
                        </p>
                      </div>
                    </div>
                    {demande.numero_demande && (
                      <p className="ed-numero">
                        Dossier <strong>{demande.numero_demande}</strong>
                      </p>
                    )}
                  </div>

                  <div className="ed-card">
                    <h3 className="ed-section-title">Score d&apos;évaluation</h3>
                    <div className="ed-score-row">
                      <div className="ed-score-circle">
                        {demande.score_total != null ? Math.round(demande.score_total) : '—'}
                      </div>
                      <div className="ed-score-bar-wrap">
                        <p className="ed-score-label">Score total sur 100</p>
                        <div className="ed-score-track">
                          <div
                            className="ed-score-fill"
                            style={{
                              width: `${demande.score_total != null ? Math.min(100, Math.max(0, demande.score_total)) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {demande.recommandation_auto && (
                      <p className="ed-reco">{demande.recommandation_auto}</p>
                    )}
                  </div>

                  <div className="ed-card">
                    <h3 className="ed-section-title">Documents</h3>
                    {documents.length === 0 ? (
                      <p className="ed-muted">Aucun document joint.</p>
                    ) : (
                      <div className="ed-docs-list">
                        {documents.map((doc) => (
                          <div key={doc.id} className="ed-doc-row">
                            <span className="ed-doc-icon">
                              <IconFile />
                            </span>
                            <span className="ed-doc-name">
                              {doc.type_document || 'Document'}
                              {doc.fichier ? '' : ' (fichier indisponible)'}
                            </span>
                            {doc.fichier ? (
                              <a
                                className="ed-doc-voir"
                                href={fichierAbsoluteUrl(doc.fichier)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Voir
                              </a>
                            ) : (
                              <span className="ed-doc-voir ed-doc-voir-disabled">—</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ed-card">
                    <h3 className="ed-section-title">Notes internes</h3>
                    <textarea
                      className="ed-notes"
                      placeholder="Ajoutez vos notes (le rejet utilise ce texte comme motif)…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={actionLoading}
                    />
                  </div>

                  <div className="ed-footer">
                    <button
                      type="button"
                      className="ed-approve-btn"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      <IconCheck /> Approuver
                    </button>
                    <button
                      type="button"
                      className="ed-reject-btn"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      <IconX /> Rejeter
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
