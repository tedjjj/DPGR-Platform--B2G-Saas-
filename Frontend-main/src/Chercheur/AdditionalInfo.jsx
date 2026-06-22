import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './NouvelleDemande.css';
import './AdditionalInfo.css';
import { useDemande } from './DemandeContext';
import { extractFormulaVariables, readEvaluationCriteria, fetchAndCacheEvaluationCriteria } from '../shared/evaluationCriteriaStorage';
import { authFetch } from '../api/jwtClient';

const ScoreDisplay = ({ score, details }) => {
  const { t } = useTranslation();
  return (
    <div className="score-display">
      <h3>{t("Score Calculé")}: {score}</h3>
      <div className="score-details">
        {details.map((detail, index) => (
          <div key={index} className={`score-item ${detail.validated ? 'validated' : 'not-validated'}`}>
            <span className="score-criterion">{detail.critere}</span>
            <span className="score-weight">{t("Poids")}: {detail.weight}</span>
            <span className="score-status">{detail.validated ? `✅ ${t('Validé')}` : `❌ ${t('Non validé')}`}</span>
            {detail.justification && (
              <span className="score-justification">{detail.justification}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Steps moved inside component for translation


const checkIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function AdditionalInfo({ setActive }) {
  const { t } = useTranslation();
  const steps = [
    { num: 1, label: t('Informations personnelles') },
    { num: 2, label: t('Détails du séjour') },
    { num: 3, label: t('Documents') },
    { num: 4, label: t('Informations additionnelles') },
    { num: 5, label: t('Confirmation') },
  ];
  const [error, setError] = useState('');
  const [criteriaLoading, setCriteriaLoading] = useState(true);
  const [apiCriteria, setApiCriteria] = useState([]);
  const [scoreResult, setScoreResult] = useState(null);
  const { currentDemandeId, additionalInfo, setAdditionalInfo } = useDemande();
  const currentStep = 4;

  const readDraftExtras = (demandeId) => {
    if (!demandeId) return {};
    try {
      const raw = localStorage.getItem(`demande-draft-extras:${demandeId}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const writeDraftExtras = (demandeId, value) => {
    if (!demandeId) return;
    try {
      localStorage.setItem(`demande-draft-extras:${demandeId}`, JSON.stringify(value || {}));
    } catch {
      // Ignore storage failures.
    }
  };

  useEffect(() => {
    const loadCriteria = async () => {
      try {
        const res = await authFetch('/parametres/sessions/?etat=OUVERTE');
        const json = await res.json();
        const sessions = Array.isArray(json) ? json : (json.results || []);
        if (sessions.length === 0) return;
        const sessionId = sessions[0].id;
        const criteria = await fetchAndCacheEvaluationCriteria(sessionId);
        console.log('Loaded criteria from API:', criteria);
        setApiCriteria(criteria);
      } catch (error) {
        console.error('Error loading criteria:', error);
        setApiCriteria(readEvaluationCriteria([]));
      } finally {
        setCriteriaLoading(false);
      }
    };
    loadCriteria();
  }, []);

  const criteriaWithFormulas = useMemo(() => {
    console.log('Filtering criteria from:', apiCriteria);
    const filtered = apiCriteria.filter(
      (item) => Array.isArray(item.donnees_necessaires) && item.donnees_necessaires.length > 0
    );
    console.log('Filtered criteria:', filtered);
    return filtered;
  }, [apiCriteria]);

  const updateValue = (criterionId, variable, value) => {
    const parsedValue = value === '' ? '' : Number(value);

    setAdditionalInfo((prev) => ({
       ...prev,
      [criterionId]: {
        ...(prev?.[criterionId] || {}),
        [variable]: parsedValue,
     },
   }));
 };

  const isStepDone = (num) => num < currentStep;

  const handleContinue = async () => {
    const missing = criteriaWithFormulas.some((criterion) =>
      criterion.donnees_necessaires.some((variable) => {
        const value = additionalInfo?.[criterion.id]?.[variable];
        return String(value || '').trim().length === 0;
      })
    );

    if (missing) {
      setError(t('Veuillez renseigner tous les champs requis pour permettre le calcul du score.'));
      return;
    }

    setError('');
    setScoreResult(null);

    try {
      // Submit each criterion response
      const submissionResults = [];
      for (const criterion of criteriaWithFormulas) {
        const donnees = additionalInfo?.[criterion.id] || {};
        const response = await authFetch(`/demandes/${currentDemandeId}/reponses-criteres/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ critere_id: criterion.id, donnees }),
        });
        
        if (!response.ok) {
          throw new Error(t(`Erreur lors de la soumission du critère`) + ` ${criterion.name}`);
        }
        
        const result = await response.json();
        submissionResults.push(result);
      }
      
      // Calculate total score after submitting all criteria
      const scoreResponse = await authFetch(`/demandes/${currentDemandeId}/score-criteres/`);
      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        setScoreResult(scoreData);
        console.log('Score calculation result:', scoreData);
      } else {
        throw new Error(t('Erreur lors du calcul du score'));
      }
    } catch (error) {
      console.error('Error in score calculation:', error);
      setError(error.message || t('Erreur lors de la soumission des données.'));
      return;
    }

    setActive('document');
  };

  useEffect(() => {
    if (!currentDemandeId) return;
    writeDraftExtras(currentDemandeId, {
      ...readDraftExtras(currentDemandeId),
      additionalInfo: additionalInfo || {},
    });
  }, [currentDemandeId, additionalInfo]);

  return (
    <main className="nd-page-body">
      <div className="nd-stepper">
        {steps.map(({ num, label }, i) => (
          <div key={num} className={`nd-step${num === currentStep ? ' nd-step--active' : isStepDone(num) ? ' nd-step--done' : ''}`}>
            <div className="nd-step-left">
              <div className="nd-step-circle">{isStepDone(num) ? checkIcon : num}</div>
              {i < steps.length - 1 && <div className="nd-step-line" />}
            </div>
            <span className="nd-step-label">{label}</span>
          </div>
        ))}
      </div>

      <section className="ai-card">
        <h2 className="ai-title">{t("Informations additionnelles")}</h2>
        <p className="ai-subtitle">
          {t("Renseignez les informations demandées par la grille d evaluation afin de calculer automatiquement le score.")}
        </p>

        {criteriaLoading ? (
          <p className="ai-empty">{t("Chargement des critères...")}</p>
        ) : criteriaWithFormulas.length === 0 ? (
          <div className="ai-empty">
            <strong>{t("Aucun critère actif")}</strong>
            <p>{t("Aucun critère ne nécessite d information additionnelle pour le moment.")}</p>
          </div>
        ) : (
          <div className="ai-list">
            {criteriaWithFormulas.map((criterion) => ( 
              <article key={criterion.id} className="ai-item">
                <h3>{criterion.name}</h3>
                <p className="ai-formula">{t("Poids")}: {criterion.weight}</p>
                <div className="ai-fields">
                  {criterion.donnees_necessaires.map((variable) => (
                    <label key={variable} className="ai-field">
                      <span>{criterion.description_donnees?.[variable] || variable}</span>
                      <input
                        type="number"
                        className="ai-input"
                        value={additionalInfo?.[criterion.id]?.[variable] || ''}
                        onChange={(event) => updateValue(criterion.id, variable, event.target.value)}
                        placeholder={`${t('Saisir')} ${criterion.description_donnees?.[variable] || variable}`}
                      />
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {error ? <p className="ai-error">{error}</p> : null}
        
        {scoreResult && (
          <ScoreDisplay score={scoreResult.score_total} details={scoreResult.details} />
        )}

        {error ? <p className="ai-error">{error}</p> : null}

        <div className="ai-footer">
          <button type="button" className="ai-btn ai-btn--ghost" onClick={() => setActive('documentDeposit')}>
            {t("Retour")} : {t("Documents")}
          </button>
          <button type="button" className="ai-btn ai-btn--primary" onClick={handleContinue}>
            {t("Suivant")} : {t("Confirmation")}
          </button>
        </div>
      </section>
    </main>
  );
}

export default AdditionalInfo;
