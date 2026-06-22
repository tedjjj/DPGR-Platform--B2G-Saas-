import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './NouvelleDemande.css';
import './documentDeposit.css';
import { useDemande } from './DemandeContext';
import { getDocumentsDemande, supprimerDocumentDemande, uploadDocumentDemande } from '../api/demandes';

// Steps moved inside component for translation


const checkIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Initial docs moved inside component for translation


function DocumentDeposit({ setActive }) {
  const { t } = useTranslation();
  const steps = [
    { num: 1, label: t('Informations personnelles') },
    { num: 2, label: t('Détails du séjour') },
    { num: 3, label: t('Documents') },
    { num: 4, label: t('Informations additionnelles') },
    { num: 5, label: t('Confirmation') },
  ];

  const initialDocs = [
    {
      id: 'invitation',
      title: t("Lettre d'invitation officielle"),
      desc: t("Document officiel de l’institution d’accueil avec signature et cachet."),
      required: true,
    },
    {
      id: 'cv',
      title: t('Curriculum Vitae (CV)'),
      desc: t('CV académique complet et à jour.'),
      required: true,
    },
    {
      id: 'programme',
      title: t('Programme détaillé du séjour'),
      desc: t('Planning des activités, séminaires et formations prévues.'),
      required: true,
    },
    {
      id: 'demande',
      title: t('Demande manuscrite signée'),
      desc: t("Lettre de demande adressée au Directeur de l’ESI."),
      required: false,
    },
    {
      id: 'autres',
      title: t('Autres documents justificatifs'),
      desc: t('Convention, attestation de bourse, assurance voyage…'),
      required: false,
    },
  ];

  const [currentStep] = useState(3);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const { currentDemandeId, documents: savedDocuments, setDocuments } = useDemande();
  const [docs, setDocs] = useState(() =>
    initialDocs.map((d) => ({
      ...d,
      file: savedDocuments?.[d.id] || null,
    }))
  );
  const [uploadingById, setUploadingById] = useState({});
  const fileInputsRef = useRef({});

  useEffect(() => {
    if (!currentDemandeId) return;

    let cancelled = false;
    const loadExistingDocuments = async () => {
      try {
        const existing = await getDocumentsDemande(currentDemandeId);
        if (cancelled) return;

        const byType = new Map(existing.map((doc) => [doc.type_document, doc]));
        setDocs((prev) =>
          prev.map((doc) => {
            const existingDoc = byType.get(doc.id);
            if (!existingDoc) return doc;

            return {
              ...doc,
              file: {
                id: existingDoc.id,
                name: existingDoc.nom_original || existingDoc.nom_fichier || `${doc.id}.pdf`,
                sizeLabel: '',
                fileUrl: existingDoc.fileUrl || null,
              },
            };
          })
        );
      } catch {
        // Keep current state if existing docs cannot be loaded.
      }
    };

    loadExistingDocuments();
    return () => {
      cancelled = true;
    };
  }, [currentDemandeId]);

  const isStepDone = (num) => {
    if (num === 2) return false; 
    return num < currentStep;
  };

  const handleOpenFileDialog = (id) => {
    const input = fileInputsRef.current[id];
    if (input) {
      input.click();
    }
  };

  const handleFileSelected = async (id, file) => {
    if (!file) return;
    if (!currentDemandeId) {
      setErrorMsg(t('Veuillez d abord completer et sauvegarder les details du sejour.'));
      return;
    }

    let sizeLabel;
    const sizeKo = Math.round(file.size / 1024);
    if (sizeKo >= 1024) {
      sizeLabel = `${(file.size / (1024 * 1024)).toFixed(1)} Mo`;
    } else {
      sizeLabel = `${sizeKo} Ko`;
    }

    try {
      setUploadingById((prev) => ({ ...prev, [id]: true }));
      const created = await uploadDocumentDemande(currentDemandeId, {
        fichier: file,
        type_document: id,
        est_obligatoire: docs.find((d) => d.id === id)?.required ?? false,
      });

      setDocs((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? {
              ...doc,
              file: {
                id: created.id,
                name: file.name,
                sizeLabel,
                fileUrl: created?.fileUrl || null,
              },
            }
            : doc
        )
      );
    } catch (err) {
      setErrorMsg(err.message || t('Erreur lors du televersement du document.'));
    } finally {
      setUploadingById((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteFile = async (id) => {
    const currentDoc = docs.find((doc) => doc.id === id);
    if (!currentDoc) return;

    try {
      if (currentDemandeId && currentDoc.file?.id) {
        await supprimerDocumentDemande(currentDemandeId, currentDoc.file.id);
      }
      setDocs((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, file: null } : doc
        )
      );
    } catch (err) {
      setErrorMsg(err.message || t('Erreur lors de la suppression du document.'));
    }
  };

  const totalRequired = docs.filter((d) => d.required).length;
  const uploadedRequired = docs.filter((d) => d.required && d.file).length;

  const handleNext = () => {
    if (uploadedRequired !== totalRequired) {
      setErrorMsg(t('Veuillez televerser tous les documents obligatoires avant de continuer.'));
      return;
    }

    const summary = docs.reduce((acc, d) => {
      acc[d.id] = d.file ? { id: d.file.id, name: d.file.name, sizeLabel: d.file.sizeLabel } : null;
      return acc;
    }, {});
    setDocuments(summary);
    if (typeof setActive === 'function') {
      setActive('additionalInfo');
    } else {
      navigate('/chercheur');
    }
  };

  return (
        <main className="nd-page-body">
          {/* Stepper */}
          <div className="nd-stepper">
            {steps.map(({ num, label }, i) => (
              <div
                key={num}
                className={`nd-step${
                  num === currentStep ? ' nd-step--active' : isStepDone(num) ? ' nd-step--done' : ''
                }`}
              >
                <div className="nd-step-left">
                  <div className="nd-step-circle">
                    {isStepDone(num) ? checkIcon : num}
                  </div>
                  {i < steps.length - 1 && <div className="nd-step-line" />}
                </div>
                <span className="nd-step-label">{label}</span>
              </div>
            ))}
          </div>

          {/* Documents content */}
          <section className="dd-documents">
            <h2 className="dd-title">{t("Documents Justificatifs")}</h2>
            <p className="dd-subtitle">
              {t("Téléchargez tous les documents requis pour compléter votre demande.")}
            </p>

            <div className="dd-alert dd-alert--formats">
              <span className="dd-alert-label">{t("Formats acceptés")}</span>
              <span className="dd-alert-text">
                {t("PDF, JPEG, PNG • Taille maximale : 5 Mo par fichier")}
              </span>
            </div>

            <div className="dd-list">
              {docs.map((doc) => (
                <article key={doc.id} className="dd-card">
                  <div className="dd-card-header">
                    <div>
                      <h3 className="dd-card-title">{doc.title}</h3>
                      <p className="dd-card-desc">{doc.desc}</p>
                    </div>
                    <span
                      className={
                        'dd-badge ' +
                        (doc.required ? 'dd-badge--required' : 'dd-badge--optional')
                      }
                    >
                      {doc.required ? t('Obligatoire') : t('Optionnel')}
                    </span>
                  </div>

                  {doc.file ? (
                    <div className="dd-file dd-file--filled dd-file--success">
                      <div className="dd-file-left">
                        <div className="dd-file-icon">
                          <span>PDF</span>
                        </div>
                        <div>
                          <p className="dd-file-name">{doc.file.name}</p>
                          <p className="dd-file-meta">{doc.file.sizeLabel || ''}</p>
                        </div>
                      </div>
                      <div className="dd-file-actions">
                        <button
                          type="button"
                          className="dd-icon-btn"
                          aria-label="Télécharger"
                          onClick={() => doc.file?.fileUrl && window.open(doc.file.fileUrl, '_blank', 'noopener,noreferrer')}
                          disabled={!doc.file?.fileUrl}
                        >
                          ⬇
                        </button>
                        <button
                          type="button"
                          className="dd-icon-btn dd-icon-btn--danger"
                          aria-label="Supprimer"
                          onClick={() => handleDeleteFile(doc.id)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="dd-dropzone"
                      onClick={() => handleOpenFileDialog(doc.id)}
                    >
                      <div className="dd-dropzone-icon">{uploadingById[doc.id] ? '…' : '⬆'}</div>
                      <p className="dd-dropzone-text">
                        {uploadingById[doc.id] ? t('Téléversement en cours...') : t('Cliquez pour téléverser ou glissez-déposez')}
                      </p>
                      <p className="dd-dropzone-hint">
                        {t("PDF, JPEG, PNG (max. 5 Mo)")}
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpeg,.jpg,.png"
                        style={{ display: 'none' }}
                        ref={(el) => {
                          fileInputsRef.current[doc.id] = el;
                        }}
                        disabled={Boolean(uploadingById[doc.id])}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          handleFileSelected(doc.id, file);
                          setErrorMsg('');
                          e.target.value = '';
                        }}
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="dd-summary">
              <span className="dd-summary-icon">✔</span>
              <p className="dd-summary-text">
                {uploadedRequired} {t("documents sur")} {totalRequired} {t("documents obligatoires téléversés")}
              </p>
            </div>
            {errorMsg && (
              <p style={{ color: '#b91c1c', marginTop: '8px', marginBottom: '0' }}>
                {errorMsg}
              </p>
            )}

            <div className="dd-footer">
              <button
                type="button"
                className="dd-btn dd-btn--ghost"
                onClick={() => (typeof setActive === 'function' ? setActive('detailssejour') : navigate('/chercheur'))}
              >
                ← {t("Retour")} : {t("Détails du séjour")}
              </button>
              <button
                type="button"
                className="dd-btn dd-btn--primary"
                onClick={handleNext}
              >
                {t("Suivant")} : {t("Informations additionnelles")} →
              </button>
            </div>
          </section>
        </main>
  );
}

export default DocumentDeposit;

