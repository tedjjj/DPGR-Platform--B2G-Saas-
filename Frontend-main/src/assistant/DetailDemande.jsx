
// Side effect hook for handling data or state updates.
import React, { useEffect, useMemo, useState } from 'react';
import './DetailDemande.css';
import { API_ORIGIN, getDemande, getDemandeDocuments, validateDemandeDocuments } from '../api/assistant';

// Small UI icon used in the interface.
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);
// Small UI icon used in the interface.
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);
// Small UI icon used in the interface.
const ArchiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
  </svg>
);
// Small UI icon used in the interface.
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);
// Small UI icon used in the interface.
const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
  </svg>
);
const CheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#16a34a">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);
// Small UI icon used in the interface.
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
);

const steps = ['Brouillon', 'Soumise', 'Verification', 'CS', 'Approuvee', 'Terminee', 'Cloturee'];

const statusToStep = {
  Brouillon: 0,
  'En attente': 1,
  'A verifier': 2,
  'En CS': 3,
  Approuve: 4,
  Termine: 5,
  Cloture: 6,
  Annule: 6,
  Rejete: 2,
};

const statusMeta = {
  'A verifier': { bg: '#f59e0b', color: '#fff' },
  Approuve: { bg: '#16a34a', color: '#fff' },
  'En CS': { bg: '#3b82f6', color: '#fff' },
  'En attente': { bg: '#94a3b8', color: '#fff' },
  Brouillon: { bg: '#6b7280', color: '#fff' },
  Rejete: { bg: '#ef4444', color: '#fff' },
  Termine: { bg: '#0d9488', color: '#fff' },
  Cloture: { bg: '#374151', color: '#fff' },
  Annule: { bg: '#9ca3af', color: '#fff' },
};

// React component: Stepper.
const Stepper = ({ currentStep }) => (
  <div className="dd-stepper">
    {steps.map((step, i) => {
      const done = i < currentStep;
      const current = i === currentStep;
// Render the component JSX.
      return (
        <React.Fragment key={step}>
          <div className="dd-step">
            <div className={`dd-step-dot ${done ? 'done' : current ? 'current' : 'pending'}`} />
            <span className={`dd-step-label ${current ? 'current' : ''}`}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`dd-step-line ${done ? 'done' : current ? 'half' : 'pending'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatAmount = (value) => {
  if (value == null || value === '') return '-';
  const number = Number(value);
  if (Number.isNaN(number)) return `${value} DA`;
  return `${new Intl.NumberFormat('fr-FR').format(number)} DA`;
};

const buildFileUrl = (fileField) => {
  if (!fileField) return '#';
  if (typeof fileField === 'object') {
    const objectUrl = fileField.secure_url || fileField.url || fileField.resource_url || fileField.public_id;
    return buildFileUrl(objectUrl);
  }
  if (fileField.startsWith('http://') || fileField.startsWith('https://')) return fileField;
  return fileField.startsWith('/') ? `${API_ORIGIN}${fileField}` : `${API_ORIGIN}/media/${fileField}`;
};

const buildHistorique = (demande) => {
  if (!demande) return [];
  const history = [];

  

  if (demande.date_soumission) {
    history.push({
      dot: 'navy',
      label: 'Demande soumise',
      who: demande.name || 'Chercheur',
      date: formatDateTime(demande.date_soumission),
    });
  }

  history.push({
    dot: 'gold',
    label: `Statut actuel: ${demande.status}`,
    who: 'Systeme',
    date: formatDateTime(demande.date_soumission || demande.date_fin || demande.date_debut),
  });

  return history;
};

const initialsFromName = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

// React component: DetailDemande.
const DetailDemande = ({ demandeId, onBack }) => {
// State management using React hooks.
  const [demande, setDemande] = useState(null);
// State management using React hooks.
  const [documents, setDocuments] = useState([]);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState('');
// State management using React hooks.
  const [validatingDocuments, setValidatingDocuments] = useState(false);
// State management using React hooks.
  const [validationMessage, setValidationMessage] = useState('');

// Side effect hook for handling data or state updates.
  useEffect(() => {
    let cancelled = false;

    const loadDetail = async () => {
      if (!demandeId) {
        setDemande(null);
        setDocuments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setValidationMessage('');
      try {
        const [demandeData, documentData] = await Promise.all([
          getDemande(demandeId),
          getDemandeDocuments(demandeId),
        ]);
        if (!cancelled) {
          setDemande(demandeData);
          setDocuments(documentData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement du dossier');
          setDemande(null);
          setDocuments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDetail();
// Render the component JSX.
    return () => {
      cancelled = true;
    };
  }, [demandeId]);

  const rawStatus = demande?.statut;
  const hasAllDocuments = documents.length > 0 && documents.every((doc) => Boolean(doc.fichier));
  const isValidationAvailable = ['VERIFICATION_AUTOMATIQUE', 'SOUMISE'].includes(rawStatus) && hasAllDocuments;
  const areDocumentsAlreadyValidated = ['PREPARATION_CS', 'DELIBERATION_CS', 'EN_ATTENTE', 'APPROUVEE', 'REJETEE', 'TERMINEE', 'CLOTUREE', 'DEMANDE_ANNULATION', 'DELIBERATION_CS_FIN'].includes(rawStatus);


 

 

  const detail = useMemo(() => {
    if (!demande) return null;

    const destination = [demande.ville_accueil, demande.destination].filter(Boolean).join(', ') || '-';
    const budgetValue = demande.cout?.cout ?? demande.montant_indemnite;
    const roleParts = [demande.chercheur_grade, demande.chercheur_laboratoire].filter(Boolean);

    return {
      avatar: initialsFromName(demande.name),
      title: demande.name || 'Demande',
      role: roleParts.join(' - ') || 'Chercheur',
      status: demande.status,
      stepIndex: statusToStep[demande.status] ?? 0,
      type: demande.type || '-',
      destination,
      dates: `${formatDate(demande.date_debut)} - ${formatDate(demande.date_fin)}${demande.duree_jours != null ? ` (${demande.duree_jours} jours)` : ''}`,
      etablissement: demande.institution_accueil || '-',
      budget: formatAmount(budgetValue),
      objectifs: demande.objectifs_scientifiques || 'Aucun objectif scientifique fourni.',
      numero: demande.numero_demande,
      historique: buildHistorique(demande),
    };
  }, [demande]);

  const statusStyle = statusMeta[detail?.status] || { bg: '#94a3b8', color: '#fff' };

// Render the component JSX.
  return (
    <div className="dd-page">
      <button className="dd-back-btn" onClick={onBack}>
        <BackIcon /> Retour aux demandes
      </button>

      {loading && <div className="tld-empty">Chargement...</div>}

      {!loading && error && (
        <div className="tld-empty" style={{ color: '#ef4444' }}>
          {error}
        </div>
      )}

      {!loading && !error && !detail && (
        <div className="tld-empty">Aucune demande selectionnee.</div>
      )}

      {!loading && !error && detail && (
        <>
          <div className="dd-hero">
            <div className="dd-hero-left">
              <div className="dd-avatar">{detail.avatar}</div>
              <div className="dd-hero-info">
                <h2 className="dd-hero-name">{detail.title}</h2>
                <p className="dd-hero-role">{detail.role}</p>
                {detail.numero && <p className="dd-hero-role">Dossier {detail.numero}</p>}
              </div>
            </div>
            <div className="dd-hero-actions">
              <span className="dd-status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {detail.status}
              </span>
              <button className="dd-icon-btn" title="Action non disponible" disabled>
                <MailIcon />
              </button>
              
            </div>
          </div>

          <div className="dd-stepper-card">
            <Stepper currentStep={detail.stepIndex} />
          </div>

          <div className="dd-body">
            <div className="dd-col-left">
              <div className="dd-card">
                <h3 className="dd-card-title">Informations demande</h3>
                <div className="dd-divider" />
                <div className="dd-info-list">
                  <div className="dd-info-row">
                    <span className="dd-info-label">Type de sejour</span>
                    <span className="dd-info-value">{detail.type}</span>
                  </div>
                  <div className="dd-info-row">
                    <span className="dd-info-label">Destination</span>
                    <span className="dd-info-value">{detail.destination}</span>
                  </div>
                  <div className="dd-info-row">
                    <span className="dd-info-label">Dates</span>
                    <span className="dd-info-value">{detail.dates}</span>
                  </div>
                  <div className="dd-info-row">
                    <span className="dd-info-label">Etablissement</span>
                    <span className="dd-info-value">{detail.etablissement}</span>
                  </div>
                  <div className="dd-info-row">
                    <span className="dd-info-label">Budget estime</span>
                    <span className="dd-info-value">{detail.budget}</span>
                  </div>
                </div>
              </div>

              <div className="dd-card">
                <h3 className="dd-card-title">Objectifs</h3>
                <p className="dd-objectifs">{detail.objectifs}</p>
              </div>
            </div>

            <div className="dd-col-mid">
              <div className="dd-card dd-card-full">
                <h3 className="dd-card-title">Documents justificatifs</h3>
                <div className="dd-divider" />
                {documents.length === 0 ? (
                  <p className="dd-objectifs">Aucun document joint pour cette demande.</p>
                ) : (
                  <>
                    <div className="dd-docs-list">
                      {documents.map((doc) => (
                        <div key={doc.id} className="dd-doc-row">
                          <span className="dd-doc-icon"><DocIcon /></span>
                          <span className="dd-doc-name">{doc.type_document || 'Document'}</span>
                          <span className="dd-doc-check">
                            {doc.fichier ? <CheckCircle /> : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                              </svg>
                            )}
                          </span>
                          {doc.fichier && (
                            <a
                              className="dd-doc-open-btn"
                              href={buildFileUrl(doc.fichier)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ouvrir
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    
                  </>
                )}
              </div>
            </div>

            <div className="dd-col-right">
              <div className="dd-card">
                <h3 className="dd-card-title">Historique des actions</h3>
                <div className="dd-divider" />
                <div className="dd-historique">
                  {detail.historique.map((h, i) => (
                    <div key={`${h.label}-${i}`} className="dd-hist-row">
                      <div className={`dd-hist-dot ${h.dot}`} />
                      <div className="dd-hist-content">
                        <div className="dd-hist-label">{h.label}</div>
                        <div className="dd-hist-who">{h.who}</div>
                        <div className="dd-hist-date"><ClockIcon /> {h.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dd-card dd-actions-card">
                <h3 className="dd-card-title dd-card-title-white">Resume</h3>
                <button className="dd-action-btn" disabled>Statut: {detail.status}</button>
                <button className="dd-action-btn" disabled>Eligibilite: {demande?.eligible == null ? 'Non calculee' : (demande.eligible ? 'Eligible' : 'Ineligible')}</button>
                <button className="dd-action-btn" disabled>Score: {demande?.score_total ?? '-'}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DetailDemande;
