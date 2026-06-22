import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './DemandeDetails.css';
import { getDocumentsDemande } from '../api/chercheur';
const getAttestationUrl = (publicId) => {
  if (!publicId) return null;
  if (/^https?:\/\//i.test(publicId)) return publicId;
  return `https://res.cloudinary.com/dplaxtndw/raw/upload/${publicId}`;
};

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconDoc = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const generatePDFAttestation = (demandeData) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  doc.text('ATTESTATION DE MOBILITÉ ACADÉMIQUE', 105, 20, { align: 'center' });
  
  // Main content
  doc.setFontSize(12);
  const content = `Nous attestons que ${demandeData.chercheur_nom} ${demandeData.chercheur_prenom} 
a été autorisé(e) à effectuer un séjour de mobilité académique 
dans le cadre de la demande ${demandeData.ref}.

Pays de destination : ${demandeData.destination}
Institution d'accueil : ${demandeData.institution}
Type de séjour : ${demandeData.type}
Date de début : ${demandeData.dateDepart}
Date de fin : ${demandeData.dateRetour}
Durée : ${demandeData.duree}

Cette attestation est délivrée pour servir et valoir ce que de droit.`;
  
  const lines = doc.splitTextToSize(content, 170);
  doc.text(lines, 20, 40);
  
  doc.save(`attestation_${demandeData.ref}.pdf`);
};

const FALLBACK_DEMANDE = {
  title: 'Mission Courte Duree - Paris',
  submitted: '15 Janvier 2025',
  status: 'VERIFICATION_AUTOMATIQUE',
  statusLabel: 'Verification automatique',
  type: 'Mission Courte Duree',
  destination: 'Paris, France',
  dateDepart: '15 Mars 2025',
  dateRetour: '20 Mars 2025',
  duree: '5 jours',
  institution: 'Universite Paris-Saclay',
  objectifs:
    "Collaboration avec l'equipe de recherche du Prof. Martin sur les algorithmes d'apprentissage automatique pour la detection d'anomalies.",
  updatedAt: '17 Jan 2025, 14:30',
  attestation: null,
};

// Base steps moved inside buildSteps for translation support


function normalizeDemande(demande) {
  const data = {
    ...FALLBACK_DEMANDE,
    ...demande,
  };

  data.statusLabel = data.statusLabel || data.status;

  if (!demande?.dateDepart && typeof data.period === 'string') {
    const separator = data.period.includes('->') ? '->' : data.period.includes('â†’') ? 'â†’' : null;
    if (separator) {
      const [dateDepart, dateRetour] = data.period.split(separator).map((value) => value.trim());
      data.dateDepart = dateDepart || FALLBACK_DEMANDE.dateDepart;
      data.dateRetour = dateRetour || FALLBACK_DEMANDE.dateRetour;
    }
  }

  return data;
}

function getCurrentStep(status) {
  if (status === 'BROUILLON') return 'brouillon';
  if (status === 'SOUMISE') return 'soumise';
  if (status === 'VERIFICATION_AUTOMATIQUE') return 'verification';
  if (status === 'PREPARATION_CS' || status === 'DELIBERATION_CS' || status === 'DELIBERATION_CS_FIN') return 'cs';
  if (status === 'APPROUVEE') return 'approuvee';
  if (status === 'EN_ATTENTE') return 'attente';
  if (status === 'CLOTUREE' || status === 'TERMINEE') return 'cloturee';
  return 'verification';
}

function buildSteps(status, t) {
  const BASE_STEPS = [
    { id: 'brouillon', label: t('Brouillon') },
    { id: 'soumise', label: t('Soumise') },
    { id: 'verification', label: t('Verification') },
    { id: 'cs', label: t('CS') },
    { id: 'approuvee', label: t('Approuvee') },
    { id: 'attente', label: t('En attente') },
    { id: 'cloturee', label: t('Cloturee') },
  ];
  const currentStep = getCurrentStep(status);
  const currentIndex = BASE_STEPS.findIndex((step) => step.id === currentStep);

  return BASE_STEPS.map((step, index) => ({
    ...step,
    done: index < currentIndex,
    current: index === currentIndex,
  }));
}

function statusMessage(data, t) {
  if (data.status === 'BROUILLON') {
    return t('Votre demande est en brouillon, vous pouvez encore la modifier.');
  }

  if (['SOUMISE', 'VERIFICATION_AUTOMATIQUE', 'PREPARATION_CS'].includes(data.status)) {
    return t("Votre dossier est en cours de verification par l'assistant DPGR. Vous serez notifiee des qu'il avance.");
  }

  if (data.status === 'APPROUVEE') {
    return t('Votre demande a ete approuvee par le conseil scientifique.');
  }

  if (data.status === 'REJETEE') {
    return t("Votre demande a ete rejetee. Veuillez contacter l'assistant DPGR pour plus d'informations.");
  }

  if (data.status === 'EN_ATTENTE') {
    return t('Votre dossier est temporairement en attente de traitement.');
  }

  return t('Le statut de votre demande sera mis a jour automatiquement ici.');
}

export default function DemandeDetails({ demande, setActive }) {
  const { t } = useTranslation();
  const data = normalizeDemande(demande);
  console.log('demande prop:', demande); 
  console.log('data.attestation:', data.attestation); 
  const steps = buildSteps(data.status, t);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (!demande?.id) return;

    getDocumentsDemande(demande.id)
      .then((docs) => setDocuments(docs))
      .catch(() => setDocuments([]));
  }, [demande]);

  return (
    <main className="dd-page">
      <div className="dd-content">
        <section className="dd-hero-card">
          <div className="dd-hero-head">
            <div className="dd-hero-copy">
              <h2 className="dd-title">{data.title}</h2>
              <p className="dd-subtitle">{t("Demande soumise le")} {data.submitted}</p>
            </div>
            <span className="dd-status-pill">{t(data.statusLabel) || data.statusLabel}</span>
          </div>

          <div className="dd-stepper">
            {steps.map((step, index) => (
              <div className="dd-step-item" key={step.id}>
                <div className="dd-step-top">
                  <div
                    className={`dd-step-circle ${step.done ? 'dd-step-circle--done' : ''} ${
                      step.current ? 'dd-step-circle--current' : ''
                    }`}
                  >
                    {step.done ? <IconCheck /> : null}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`dd-step-connector ${step.done ? 'dd-step-connector--done' : ''}`} />
                  )}
                </div>
                <span className={`dd-step-label ${step.current ? 'dd-step-label--current' : ''}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="dd-grid">
          <section className="dd-card dd-card-large">
            <h3 className="dd-card-title">{t("Details de la demande")}</h3>
            <div className="dd-card-divider" />

            <div className="dd-detail-list">
              <div className="dd-detail-row">
                <span className="dd-label">{t("Type de sejour")}</span>
                <span className="dd-value">{data.type}</span>
              </div>
              <div className="dd-detail-row">
                <span className="dd-label">{t("destination")}</span>
                <span className="dd-value">{data.destination}</span>
              </div>
              <div className="dd-detail-row">
                <span className="dd-label">{t("Date de depart")}</span>
                <span className="dd-value">{data.dateDepart}</span>
              </div>
              <div className="dd-detail-row">
                <span className="dd-label">{t("Date de retour")}</span>
                <span className="dd-value">{data.dateRetour}</span>
              </div>
              <div className="dd-detail-row">
                <span className="dd-label">{t("Duree")}</span>
                <span className="dd-value">{data.duree}</span>
              </div>
              <div className="dd-detail-row">
                <span className="dd-label">{t("Etablissement d'accueil")}</span>
                <span className="dd-value">{data.institution}</span>
              </div>
            </div>
            <br></br>
            <br></br>
            <br></br>
            {data.status === 'APPROUVEE' && (
  <button
    type="button"
    className="dd-attestation-btn"
    onClick={() => {
  const url = data.attestation
    ? getAttestationUrl(data.attestation)
    : null;
  if (url) {
    window.open(url, '_blank');
  } else {
    generatePDFAttestation(data);
  }
}}
  >
    <IconDoc /> {t("Télécharger l'attestation")}
  </button>
)}
          </section>

          <section className="dd-side-col">
            <section className="dd-card">
              <h3 className="dd-card-title">{t("Documents justificatifs")}</h3>
              <div className="dd-doc-list">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div key={doc} className="dd-doc-item">
                      <span className="dd-doc-left">
                        <IconDoc />
                        {doc}
                      </span>
                      <span className="dd-doc-check">
                        <IconCheck />
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#888' }}>{t("Aucun document.")}</p>
                )}
              </div>
            </section>

            <section className="dd-status-card">
              <h3 className="dd-status-title">{t("Statut actuel")}</h3>
              <p className="dd-status-text">{statusMessage(data, t)}</p>
              <p className="dd-status-time">{t("Derniere mise a jour")} : {data.updatedAt}</p>
            </section>
          </section>
        </div>

        <section className="dd-card dd-objectifs-card">
          <h3 className="dd-card-title">{t("Objectifs scientifiques")}</h3>
          <p className="dd-objectifs-text">{data.objectifs}</p>
        </section>

        <div className="dd-actions">
  <button className="dd-back-btn-ch" type="button" onClick={() => setActive('demandes')}>
    <IconArrowLeft /> {t("Retour aux demandes")}
  </button>

</div>
      </div>
    </main>
  );
}
