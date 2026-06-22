// Confirmation step

import { FaCheckCircle } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';
import { IoDocument, IoLocationSharp } from 'react-icons/io5';
// State management using React hooks.
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './NouvelleDemande.css';
import './Document.css';
import { useDemande } from './DemandeContext';
import { soumettreDemande } from '../api/demandes';

// Small UI icon used in the interface.
const ClipboardIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="15" y2="16" />
  </svg>
);

// Steps moved inside component for translation


// Function: Document.
function Document({ setActive }) {
  const { t } = useTranslation();
  const steps = [
    { num: 1, label: t('Informations personnelles') },
    { num: 2, label: t('Details du séjour') },
    { num: 3, label: t('Documents') },
    { num: 4, label: t('Informations additionnelles') },
    { num: 5, label: t('Confirmation') },
  ];
// State management using React hooks.
  const [isConfirmed, setIsConfirmed] = useState(false);
// State management using React hooks.
  const [currentStep] = useState(5);
// State management using React hooks.
  const [submitting, setSubmitting] = useState(false);
// State management using React hooks.
  const [error, setError] = useState('');
  const {
    personnel,
    sejour,
    documents,
    additionalInfo,
    currentDemandeId,
    resetDemande,
    setPersonnel,
    setSejour,
    setDocuments,
    setAdditionalInfo,
  } = useDemande();
  const navigate = useNavigate();

  const formatDate = (iso) => {
    if (!iso) return '-';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  const goToDemandes = () => {
    if (typeof setActive === 'function') {
      setActive('demandes');
    } else {
      navigate('/chercheur');
    }
  };

  const handleRetour = () => {
    if (typeof setActive === 'function') {
      setActive('additionalInfo');
    } else {
      navigate('/chercheur');
    }
  };

  const handleAnnulerEtape1 = () => {
  setPersonnel({});
  setActive('nouvelle');
};

const handleAnnulerEtape2 = () => {
  setSejour({});
  setActive('detailssejour');
};

const handleAnnulerEtape3 = () => {
  setDocuments({});
  setActive('documentDeposit');
};

const handleAnnulerEtape4 = () => {
  setAdditionalInfo({});
  setActive('additionalInfo');
};

const handleAnnulerTout = () => {
  resetDemande();
  setActive('demandes');
};

  const handleSoumettre = async () => {
    if (!currentDemandeId) {
      setError(t('Aucune demande en cours n a ete trouvée. Revenez à l étape précédente.'));
      return;
    }

    if (!isConfirmed) {
      setError(t('Veuillez confirmer l exactitude des informations avant de soumettre.'));
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await soumettreDemande(currentDemandeId);
      resetDemande();
      goToDemandes();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

// Render the component JSX.
  return (
    <main className="nd-page-body">
      <div className="nd-stepper">
        {steps.map(({ num, label }, index) => (
          <div key={num} className={`nd-step${num === currentStep ? ' nd-step--active' : num < currentStep ? ' nd-step--done' : ''}`}>
            <div className="nd-step-left">
              <div className="nd-step-circle">
                {num < currentStep ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : num}
              </div>
              {index < steps.length - 1 && <div className="nd-step-line" />}
            </div>
            <span className="nd-step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="validation">
        <div className="header">
          <FaCheckCircle />
          <h1>{t("Verification et confirmation")}</h1>
          <p>{t("Veuillez vérifier toutes les informations avant de soumettre votre demande")}</p>
        </div>
        
        

        


        

          {/* etape1 */}
        <div className="etape1">
          <h1><MdPerson /> {t("Informations personnelles")}
          <div className="etape-btn-group">
            <button type="button" className="btn-modifier" onClick={() => setActive('nouvelle')}> {t("Modifier")} </button>
            <button  type="button"  className="btn-annuler-etape"  onClick={handleAnnulerEtape1}> {t("Annuler l'étape")} </button>
         </div>
          </h1>

          <ul>
            <li><hr /></li>
            <li>
              <p>
                <span className="spann">{t("Nom complet")}</span><br />
                {personnel.nom || '-'} {personnel.prenom || ''}
              </p>
            </li>
            <li>
              <p>
                <span className="spann">{t("Grade")}</span><br />
                {personnel.grade || '-'}
              </p>
            </li>
            <li>
              <p>
                <span className="spann">{t("Email")}</span><br />
                {personnel.email || '-'}
              </p>
            </li>
            <li>
              <p>
                <span className="spann">{t("Téléphone")}</span><br />
                {personnel.telephone || '-'}
              </p>
            </li>
            <li>
              <p>
                <span className="spann">{t("Laboratoire")}</span><br />
                {personnel.equipe || '-'}
              </p>
            </li>
            <li><hr /></li>
          </ul>
        </div>

        {/* etape2 */}
        <div className="etape2">
          <h1><IoLocationSharp /> {t("Détails du séjour")}
          <div className="etape-btn-group">
            <button type="button" className="btn-modifier" onClick={() => setActive('detailssejour')}> {t("Modifier")} </button>
            <button  type="button"  className="btn-annuler-etape"  onClick={handleAnnulerEtape2}> {t("Annuler l'étape")} </button>
         </div> 
         </h1>

          <ul>
            <li><hr /></li>
            <li>
              <p>
                <span className="spann">{t("destination")}</span><br />
                {sejour.ville || '-'}{sejour.ville || sejour.pays ? ', ' : ''}{sejour.pays || ''}
              </p>
            </li>
            <li>
              <p>
                <span className="spann">{t("Institution d'accueil")}</span><br />
                {sejour.institution || '-'}
              </p>
            </li>
            <li>
              <p>
                <span className="spann">{t("Dates du sejour")}</span><br />
                {formatDate(sejour.dateDebut)} {'->'} {formatDate(sejour.dateFin)}
              </p>
            </li>
            <li>
              <p>
                <span className="spann">{t("Contact sur place")}</span><br />
                {sejour.superviseurNom || '-'}
              </p>
            </li>
            <li>
              <p>
                <span className="spann">{t("Objectifs")}</span><br />
                {sejour.objectifs || '-'}
              </p>
            </li>
            <li><hr /></li>
          </ul>
        </div>

        {/* etape3 */}
        <div className="etape3">
         <h1><IoDocument /> {t("Documents justificatifs")}
         <div className="etape-btn-group">
            <button type="button" className="btn-modifier" onClick={() => setActive('documentDeposit')}> {t("Modifier")} </button>
            <button  type="button"  className="btn-annuler-etape"  onClick={handleAnnulerEtape3}> {t("Annuler l'étape")} </button>
         </div> 
          </h1>

          <ul>
            
            <li>
              <span className={`check ${documents.invitation ? '' : 'check--missing'}`}></span>
              {t("Lettre d'invitation officielle")}
            </li>
            <li>
              <span className={`check ${documents.cv ? '' : 'check--missing'}`}></span>
              {t("Curriculum Vitae (CV)")}
            </li>
            <li>
              <span className={`check ${documents.programme ? '' : 'check--missing'}`}></span>
              {t("Programme detaille du séjour")}
            </li>
            
          </ul>
        </div>

        <div className="etape3">
          <h1>{t("Informations additionnelles")}
            <div className="etape-btn-group">
              <button type="button" className="btn-modifier" onClick={() => setActive('additionalInfo')}> {t("Modifier")} </button>
              <button type="button" className="btn-annuler-etape" onClick={handleAnnulerEtape4}> {t("Annuler l'étape")} </button>
            </div>
          </h1>
          <ul>
            {Object.keys(additionalInfo || {}).length === 0 ? (
              <li>{t("Aucune information additionnelle fournie.")}</li>
            ) : (
              Object.entries(additionalInfo).flatMap(([criterionId, values]) =>
                Object.entries(values || {}).map(([field, value]) => (
                  <li key={`${criterionId}-${field}`}>
                    <p>
                      <span className="spann">{field}</span><br />
                      {value || '-'}
                    </p>
                  </li>
                ))
              )
            )}
          </ul>
        </div>

        <div className="check-val">
          <label>
            <input type="checkbox" checked={isConfirmed} onChange={(event) => setIsConfirmed(event.target.checked)} />
            {t("Je certifie l exactitude des informations fournies")}
          </label>
          <p>
            {t("Je confirme que toutes les informations et documents fournis sont authentiques et exacts. Je comprends que toute fausse déclaration peut entrainer le rejet de ma demande et des sanctions disciplinaires.")}
          </p>
        </div>

        {error && (
          <p style={{ color: '#b91c1c', marginTop: '12px', marginBottom: '0' }}>
            {error}
          </p>
        )}

        <div className="alert">
          <h6>
            <span style={{ fontWeight: 800 }}><ClipboardIcon /> {t("Prochaines étapes")} :</span> {t("Après soumission, votre demande sera examinée par l'Assistant DPGR, puis par le Conseil Scientifique. Vous recevrez des notifications à chaque étape du processus.")}
          </h6>
        </div>

        <div className="button-section">
          <button type="button" onClick={handleRetour}>
            {t("Retour")} : {t("Informations additionnelles")}
          </button>
          <button className="btn-annuler-tout" type="button" onClick={handleAnnulerTout}>
            {t("Annuler tout")}
          </button>
          <button className="btn-secondary" type="button" onClick={goToDemandes}>
            {t("Enregistrer comme brouillon")}
          </button>
          <button className="btn-primary" type="button" onClick={handleSoumettre} disabled={submitting}>
           <FaCheckCircle />
           {submitting ? t('Soumission...') : t('Soumettre la demande')}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Document;
