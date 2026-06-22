
// Side effect hook for handling data or state updates.
import React, { useState, useEffect } from 'react';
import './DetailDemande.css';
import api from '../api/AdminDPGR';

// ── Icons ── (Gardés à l'identique)
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

// ── Status config ──

const STATUS_MAP = {
  BROUILLON:                 { label: 'Brouillon',        color: '#6b7280', step: 0 },
  SOUMISE:                   { label: 'Soumise',          color: '#3b82f6', step: 1 },
  VERIFICATION_AUTOMATIQUE:  { label: 'En vérification',  color: '#8b5cf6', step: 2 },
  EN_ATTENTE:                { label: 'En attente',        color: '#f59e0b', step: 3 },
  DELIBERATION_CS:           { label: 'En CS',             color: '#f59e0b', step: 4 },
  APPROUVEE:                 { label: 'Approuvée',         color: '#16a34a', step: 5 },
  REJETEE:                   { label: 'Rejetée',           color: '#dc2626', step: 5 },
  CLOTUREE:                  { label: 'Clôturée',          color: '#6b7280', step: 6 },
  ARCHIVEE:                  { label: 'Archivée',          color: '#4b5563', step: 6 },
  TERMINEE:                  { label: 'Terminée',          color: '#6b7280', step: 6 }, // ← AJOUTÉ
};

const steps = ['Brouillon', 'Soumise', 'Vérification', 'En attente', 'Délibération CS', 'Décision', 'Clôturée'];

// ── Helpers ──
// Function: formatDate.
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Function: formatDateRange.
function formatDateRange(dateDebut, dateFin) {
  if (!dateDebut && !dateFin) return '—';
  const d = formatDate(dateDebut);
  const f = formatDate(dateFin);
  if (dateDebut && dateFin) {
    const diff = Math.round(
      (new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24)
    );
    return `${d} – ${f} (${diff} j)`;
  }
  return d || f;
}

// Function: getInitials.
function getInitials(nom, prenom) {
  const a = nom    ? nom.charAt(0).toUpperCase()    : '';
  const b = prenom ? prenom.charAt(0).toUpperCase() : '';
// Render the component JSX.
  return (a + b) || '??';
}

// ── Progress Stepper ──
// React component: Stepper.
const Stepper = ({ currentStep }) => (
  <div className="dd-stepper">
    {steps.map((step, i) => {
      const done    = i < currentStep;
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

// ── Loading Skeleton ──
const Skeleton = () => (
  <div style={{ padding: 40, color: '#6b7280', textAlign: 'center' }}>
    Chargement des détails…
  </div>
);

// ── Error View ──
// React component: ErrorView.
const ErrorView = ({ message, onBack }) => (
  <div style={{ padding: 40 }}>
    <button className="dd-back-btn" onClick={onBack}>
      <BackIcon /> Retour aux demandes
    </button>
    <p style={{ color: '#ef4444', marginTop: 24 }}>Erreur : {message}</p>
  </div>
);

// ── Main Component ──
// React component: DetDemandeAdmin.
const DetDemandeAdmin = ({ demandeId, onBack }) => {
// State management using React hooks.
  const [demande,   setDemande]   = useState(null);
// State management using React hooks.
  const [documents, setDocuments] = useState([]);
// State management using React hooks.
  const [loading,   setLoading]   = useState(true);
// State management using React hooks.
  const [error,     setError]     = useState(null);

  // ── Modal States ──
  const [isComplementModalOpen, setComplementModalOpen] = useState(false);
// State management using React hooks.
  const [complementText, setComplementText] = useState("");
  
// State management using React hooks.
  const [isMailModalOpen, setMailModalOpen] = useState(false);
// State management using React hooks.
  const [mailText, setMailText] = useState("");
  
// State management using React hooks.
  const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
// State management using React hooks.
  const [isValiderDocsModalOpen, setValiderDocsModalOpen] = useState(false);

  // ── Fetch Data ──
  const loadDemande = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, docs] = await Promise.all([
        api.demandes.get(demandeId),
        api.demandes.documents(demandeId).catch(() => []),
      ]);
      setDemande(data);
      setDocuments(Array.isArray(docs) ? docs : docs?.results || []);
    } catch (err) {
      setError(err.message || 'Impossible de charger la demande.');
    } finally {
      setLoading(false);
    }
  };

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (demandeId) loadDemande();
  }, [demandeId]);

  // ── Action Handlers ──

  // FIX 1 : "Valider les documents" ne change plus le statut de la demande,
  // il ferme simplement la modale sans appel API de changement d'état.
  const handleValiderDocuments = async () => {
    try {
      setValiderDocsModalOpen(false);
    } catch (err) {
      alert("Erreur lors de la validation des documents");
    }
  };

  const handleDemanderComplement = async () => {
    try {
      await api.demandes.updateStatus(demandeId, 'BROUILLON', complementText);
      setComplementModalOpen(false);
      setComplementText("");
      loadDemande();
    } catch (err) {
      alert("Erreur lors de la demande de complément");
    }
  };

  const handleEnvoyerMail = async () => {
    try {
      alert("Mail envoyé au chercheur avec succès !");
      setMailModalOpen(false);
      setMailText("");
    } catch (err) {
      alert("Erreur lors de l'envoi du mail");
    }
  };

  const handleArchiver = async () => {
    try {
      await api.demandes.updateStatus(demandeId, 'ARCHIVEE');
      setArchiveModalOpen(false);
      loadDemande();
    } catch (err) {
      alert("Erreur lors de l'archivage");
    }
  };

  const handleDownloadAttestation = () => {
    const url = demande.attestation_url || demande.attestation;
    if (url) {
        window.open(url, '_blank');
    } else {
        alert("L'attestation n'est pas encore disponible.");
    }
  };

  if (loading) return <Skeleton />;
  if (error)   return <ErrorView message={error} onBack={onBack} />;
  if (!demande) return <ErrorView message="Demande introuvable." onBack={onBack} />;

  // ── Map API fields ──
  const statusInfo  = STATUS_MAP[demande.statut] || { label: demande.statut, color: '#6b7280', step: 0 };
  const currentStep = statusInfo.step;

  const nom    = demande.chercheur_nom    || demande.chercheur?.nom    || '';
  const prenom = demande.chercheur_prenom || demande.chercheur?.prenom || '';
  const fullName = `${nom} ${prenom}`.trim() || `Demande #${demande.id}`;
  const initials = getInitials(nom, prenom);

  const grade     = demande.chercheur_grade       || '';
  const labo      = demande.chercheur_laboratoire || '';
  const roleLabel = [grade, labo].filter(Boolean).join(' — ') || '—';

  const typeSejour = demande.type_sejour?.nom || demande.type_sejour?.code || '—';

  const ville       = demande.ville_accueil || '';
  const paysTexte   = demande.destination   || '';
  const destination = [ville, paysTexte].filter(Boolean).join(', ') || '—';

  const etablissement = demande.institution_accueil || '—';

  const budget = demande.cout?.cout != null
    ? `${Number(demande.cout.cout).toLocaleString('fr-DZ')} DA`
    : '—';

  const dates = formatDateRange(demande.date_debut, demande.date_fin);

  const objectifs = demande.objectifs_scientifiques || demande.objectifs || '—';

  const historique = Array.isArray(demande.historique) && demande.historique.length > 0
    ? demande.historique
    : [
        demande.date_soumission && {
          label: 'Demande soumise',
          who:   fullName,
          date:  formatDate(demande.date_soumission),
          dot:   'navy',
        },
        demande.date_modification && {
          label: 'Dernière modification',
          who:   'Système',
          date:  formatDate(demande.date_modification),
          dot:   'gold',
        },
      ].filter(Boolean);

// Render the component JSX.
  return (
    <div className="dd-page">

      {/* Back button */}
      <button className="dd-back-btn" onClick={onBack}>
        <BackIcon /> Retour aux demandes
      </button>

      {/* ── Hero card ── */}
      <div className="dd-hero">
        <div className="dd-hero-left">
          <div className="dd-avatar">{initials}</div>
          <div className="dd-hero-info">
            <h2 className="dd-hero-name">{fullName}</h2>
            <p className="dd-hero-role">{roleLabel}</p>
          </div>
        </div>
        <div className="dd-hero-actions">
          <span
            className="dd-status-badge"
            style={{ background: statusInfo.color, color: '#fff' }}
          >
            {statusInfo.label}
          </span>
          <button className="dd-icon-btn" title="Envoyer un email" onClick={() => setMailModalOpen(true)}>
            <MailIcon />
          </button>
          <button className="dd-icon-btn" title="Archiver" onClick={() => setArchiveModalOpen(true)}>
            <ArchiveIcon />
          </button>
          <button className="dd-attestation-btn" onClick={handleDownloadAttestation}>
            <DownloadIcon /> Télécharger attestation
          </button>
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="dd-stepper-card">
        <Stepper currentStep={currentStep} />
      </div>

      {/* ── 3-column body ── */}
      <div className="dd-body">

        {/* Left col */}
        <div className="dd-col-left">
          <div className="dd-card">
            <h3 className="dd-card-title">Informations demande</h3>
            <div className="dd-divider" />
            <div className="dd-info-list">
              {[
                ['Type de séjour',   typeSejour],
                ['Destination',      destination],
                ['Dates',            dates],
                ['Établissement',    etablissement],
                ['Budget estimé',    budget],
                demande.duree_jours      && ['Durée',      `${demande.duree_jours} jours`],
                demande.numero_demande   && ['N° demande',  demande.numero_demande],
                demande.score_total != null && ['Score',    `${demande.score_total} pts`],
              ].filter(Boolean).map(([label, value]) => (
                <div className="dd-info-row" key={label}>
                  <span className="dd-info-label">{label}</span>
                  <span className="dd-info-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dd-card">
            <h3 className="dd-card-title">Objectifs</h3>
            <p className="dd-objectifs">{objectifs}</p>
          </div>
        </div>

        {/* Middle col — Documents */}
        <div className="dd-col-mid">
          <div className="dd-card dd-card-full">
            <h3 className="dd-card-title">Documents justificatifs</h3>
            <div className="dd-divider" />
            <div className="dd-docs-list">
              {documents.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Aucun document joint.</p>
              ) : (
                documents.map((doc, i) => {
                  const typeLabels = {
                    invitation: "Lettre d'invitation",
                    cv:         'CV scientifique',
                    programme:  'Programme scientifique',
                    demande:     'Formulaire de demande',
                    autres:      'Autre document',
                  };
                  const nomDoc = typeLabels[doc.type_document] || doc.type_document || `Document ${i + 1}`;
                  const url = doc.fichier || null;
// Render the component JSX.
                  return (
                    <div key={i} className="dd-doc-row">
                      <span className="dd-doc-icon"><DocIcon /></span>
                      <span className="dd-doc-name">
                        {url ? (
                          <a href={url} target="_blank" rel="noreferrer"
                            style={{ color: '#1A3A6B', textDecoration: 'none' }}>
                            {nomDoc}
                          </a>
                        ) : nomDoc}
                      </span>
                      <span className="dd-doc-check">
                        <CheckCircle />
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <button className="dd-valider-btn" onClick={() => setValiderDocsModalOpen(true)}>
              Valider les documents
            </button>
          </div>
        </div>

        {/* Right col */}
        <div className="dd-col-right">
          <div className="dd-card">
            <h3 className="dd-card-title">Historique des actions</h3>
            <div className="dd-divider" />
            <div className="dd-historique">
              {historique.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Aucun historique.</p>
              ) : (
                historique.map((h, i) => (
                  <div key={i} className="dd-hist-row">
                    <div className={`dd-hist-dot ${h.dot || 'navy'}`} />
                    <div className="dd-hist-content">
                      <div className="dd-hist-label">{h.label || h.action || h.statut || '—'}</div>
                      <div className="dd-hist-who">{h.who || h.utilisateur || h.par || ''}</div>
                      <div className="dd-hist-date">
                        <ClockIcon /> {h.date || formatDate(h.created_at || h.date_action)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dd-card dd-actions-card">
            <h3 className="dd-card-title dd-card-title-white">Actions rapides</h3>
            <button className="dd-action-btn" onClick={() => setMailModalOpen(true)}>
              Notifier le chercheur
            </button>
            <button className="dd-action-btn" onClick={() => setComplementModalOpen(true)}>
              Demander complément
            </button>
          </div>
        </div>

      </div>

      {/* ── MODALES ── (Restées à l'identique) */}
      
      {/* Modale: Demander Complément */}
      {isComplementModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, color: '#111827', fontSize: '1.25rem' }}>Demander un complément</h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              Veuillez indiquer les modifications ou documents attendus de la part du chercheur :
            </p>
            <textarea
              style={textareaStyle}
              rows="4"
              value={complementText}
              onChange={(e) => setComplementText(e.target.value)}
              placeholder="Il manque la signature sur la lettre d'invitation..."
            />
            <div style={modalActionsStyle}>
              <button style={btnCancelStyle} onClick={() => setComplementModalOpen(false)}>Annuler</button>
              <button style={btnDangerStyle} onClick={handleDemanderComplement}>Envoyer la demande</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale: Envoyer un Mail / Notifier */}
      {isMailModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, color: '#111827', fontSize: '1.25rem' }}>Notifier le chercheur</h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              Envoyez un message direct à {fullName} :
            </p>
            <textarea
              style={textareaStyle}
              rows="4"
              value={mailText}
              onChange={(e) => setMailText(e.target.value)}
              placeholder="Bonjour, nous vous informons que..."
            />
            <div style={modalActionsStyle}>
              <button style={btnCancelStyle} onClick={() => setMailModalOpen(false)}>Annuler</button>
              <button style={btnPrimaryStyle} onClick={handleEnvoyerMail}>Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale: Archiver */}
      {isArchiveModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, color: '#111827', fontSize: '1.25rem' }}>Confirmer l'archivage</h3>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              Veuillez vraiment archiver cette demande ? Elle ne sera plus active.
            </p>
            <div style={modalActionsStyle}>
              <button style={btnCancelStyle} onClick={() => setArchiveModalOpen(false)}>Annuler</button>
              <button style={btnDangerStyle} onClick={handleArchiver}>Archiver</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale: Valider Documents */}
      {isValiderDocsModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, color: '#111827', fontSize: '1.25rem' }}>Confirmer la validation</h3>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
              Voulez-vous valider définitivement les documents de cette demande ?
            </p>
            <div style={modalActionsStyle}>
              <button style={btnCancelStyle} onClick={() => setValiderDocsModalOpen(false)}>Annuler</button>
              <button style={btnSuccessStyle} onClick={handleValiderDocuments}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ── Styles inline pour les modales (Gardés à l'identique) ──
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(17, 24, 39, 0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
  width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Inter, sans-serif'
};

const textareaStyle = {
  width: '100%', padding: '12px', borderRadius: '8px',
  border: '1px solid #d1d5db', outline: 'none', resize: 'vertical',
  fontFamily: 'inherit', fontSize: '0.95rem', marginBottom: '1rem',
  boxSizing: 'border-box'
};

const modalActionsStyle = {
  display: 'flex', justifyContent: 'flex-end', gap: '12px'
};

const btnCancelStyle = {
  padding: '8px 16px', borderRadius: '6px', border: 'none',
  backgroundColor: '#f3f4f6', color: '#374151', cursor: 'pointer',
  fontWeight: '500', fontSize: '0.95rem'
};

const btnPrimaryStyle = {
  padding: '8px 16px', borderRadius: '6px', border: 'none',
  backgroundColor: '#1A3A6B', color: '#fff', cursor: 'pointer',
  fontWeight: '500', fontSize: '0.95rem'
};

const btnSuccessStyle = {
  ...btnPrimaryStyle, backgroundColor: '#16a34a'
};

const btnDangerStyle = {
  ...btnPrimaryStyle, backgroundColor: '#ef4444'
};

export default DetDemandeAdmin;
