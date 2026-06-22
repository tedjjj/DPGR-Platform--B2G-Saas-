import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from './DatePicker';
import FileUpload from './FileUpload';
import './SoumettreRapport.css';
import SignaturePad from './SignaturePad';
import {
  submitRapport,
} from '../api/chercheur';

const IconPen = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconClipboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconBulb = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
  </svg>
);

const IconBook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const IconMessage = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

function Field({ label, required, children, full, hint }) {
  return (
    <div className={`sr-field${full ? ' sr-field--full' : ''}`}>
      <label className="sr-label">
        {label}
        {required && <span className="sr-required"> *</span>}
      </label>
      {children}
      {hint && <span className="sr-hint">{hint}</span>}
    </div>
  );
}

function Input({ placeholder, value, onChange, readOnly }) {
  return (
    <input
      className={`sr-input${readOnly ? ' sr-input--readonly' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}

function calcDays(start, end) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

function DateField({ label, required, value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const fmt = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <Field label={label} required={required}>
      <div className="sr-date-field" ref={ref} onClick={() => setOpen((v) => !v)}>
        <span className="sr-date-icon"><IconCalendar /></span>
        <input className="sr-input sr-date-input" placeholder="jj/mm/aaaa" value={fmt(value)} readOnly />
        {open && (
          <div className="sr-dp-dropdown" onClick={(e) => e.stopPropagation()}>
            <DatePicker value={value} onChange={onChange} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </Field>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select className="sr-select" value={value} onChange={onChange}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionHeader({ num, title, color }) {
  return (
    <div className="sr-section-header">
      <span className={`sr-section-num sr-section-num--${color}`}>{num}</span>
      <h3 className="sr-section-title">{title}</h3>
    </div>
  );
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="sr-check-row">
      <input type="checkbox" className="sr-checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function countChars(str) {
  return str?.length || 0;
}

function hasAtLeastOneObjectif(objectifs) {
  return Object.entries(objectifs || {}).some(([key, value]) => key !== 'autreText' && Boolean(value));
}


const RAPPORT_DRAFT_PREFIX = 'chercheur-rapport-draft:';
const RAPPORT_DRAFT_DB = 'chercheur-rapport-drafts';
const RAPPORT_DRAFT_STORE = 'drafts';

const createInitialForm = () => ({
  reference: 'DPGR-2025-0087',
  typeSejour: 'Sejour Scientifique',
  dateDepart: '',
  dateRetour: '',
  pays: 'France',
  ville: 'Paris',
  institution: 'Universite Sorbonne - Laboratoire LIP6',
  description: '',
  objectifs: {
    formation: true,
    collaboration: true,
    publication: false,
    presentation: false,
    autre: false,
    autreText: '',
  },
  resultats: '',
  publications: '',
  collaborations: '',
  impact: '',
  rapportFile: null,
  attestationFile: null,
  justificatifsFile: null,
  photosFile: null,
  publicationsFile: null,
  rating: 4,
  pointsPositifs: '',
  difficultes: '',
  recommande: 'oui_fortement',
  civilite: '',
  nomComplet: '',
  dateSigne: '',
  signe: false,
});

const getDraftStorageKey = (demandeId) => `${RAPPORT_DRAFT_PREFIX}${demandeId || 'default'}`;

const openRapportDraftDb = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(RAPPORT_DRAFT_DB, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RAPPORT_DRAFT_STORE)) {
        db.createObjectStore(RAPPORT_DRAFT_STORE, { keyPath: 'key' });
      }
    };
  });

const readLegacyRapportDraft = (demandeId) => {
  if (typeof window === 'undefined' || !demandeId) return null;
  try {
    const raw = localStorage.getItem(getDraftStorageKey(demandeId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readRapportDraft = async (demandeId) => {
  if (!demandeId) return null;

  try {
    const db = await openRapportDraftDb();
    if (!db) return readLegacyRapportDraft(demandeId);

    const result = await new Promise((resolve, reject) => {
      const tx = db.transaction(RAPPORT_DRAFT_STORE, 'readonly');
      const store = tx.objectStore(RAPPORT_DRAFT_STORE);
      const request = store.get(getDraftStorageKey(demandeId));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.payload || null);
    });
    db.close();
    return result || readLegacyRapportDraft(demandeId);
  } catch {
    return readLegacyRapportDraft(demandeId);
  }
};

const saveRapportDraft = async (demandeId, form) => {
  if (!demandeId) return;

  const payload = {
    ...form,
    objectifs: { ...(form.objectifs || {}) },
  };

  const db = await openRapportDraftDb();
  if (db) {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RAPPORT_DRAFT_STORE, 'readwrite');
      const store = tx.objectStore(RAPPORT_DRAFT_STORE);
      const request = store.put({ key: getDraftStorageKey(demandeId), payload });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
    db.close();
  }

  localStorage.setItem(
    getDraftStorageKey(demandeId),
    JSON.stringify({
      ...payload,
      rapportFile: null,
      attestationFile: null,
      justificatifsFile: null,
      photosFile: null,
      publicationsFile: null,
    })
  );
};

const clearRapportDraft = async (demandeId) => {
  if (!demandeId) return;

  try {
    const db = await openRapportDraftDb();
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(RAPPORT_DRAFT_STORE, 'readwrite');
        const store = tx.objectStore(RAPPORT_DRAFT_STORE);
        const request = store.delete(getDraftStorageKey(demandeId));
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
      db.close();
    }
  } catch {}

  localStorage.removeItem(getDraftStorageKey(demandeId));
};

export default function SoumettreRapport({ onBack, demande, onSubmitted }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(createInitialForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);

  const RATING_LABELS = ['', t('Insuffisant'), t('Passable'), t('Satisfait'), t('Tres satisfait'), t('Excellent')];

  const set = (key) => (val) => {
    const value = val?.target ? val.target.value : val;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const days = calcDays(form.dateDepart, form.dateRetour);

  useEffect(() => {
    if (!demande) return;

    let cancelled = false;

    const loadDraft = async () => {
      setDraftLoading(true);
      const draft = await readRapportDraft(demande.demandeId);
      const initialForm = createInitialForm();

      if (cancelled) return;

      setForm({
        ...initialForm,
        ...(draft || {}),
        objectifs: {
          ...initialForm.objectifs,
          ...(draft?.objectifs || {}),
        },
        reference: demande.demandeId ? `DEM-${demande.demandeId}` : initialForm.reference,
        typeSejour: demande.typeSejour || initialForm.typeSejour,
        dateDepart: draft?.dateDepart || demande.dateDebut || initialForm.dateDepart,
        dateRetour: draft?.dateRetour || demande.dateFin || initialForm.dateRetour,
        pays: draft?.pays || demande.pays || initialForm.pays,
        ville: draft?.ville || demande.ville || initialForm.ville,
        institution: draft?.institution || demande.institution || initialForm.institution,
      });

      setSubmitError('');
      setDraftMessage(draft ? t('Brouillon charge pour cette demande.') : '');
      setDraftLoading(false);
    };

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [demande, t]);

  const toggleObj = (key) => setForm((f) => ({
    ...f,
    objectifs: { ...f.objectifs, [key]: !f.objectifs[key] },
  }));

  const chars = countChars(form.description);
  const minChars = 200;

  const filledFields = [
    form.dateDepart,
    form.dateRetour,
    form.description.trim(),
    form.resultats.trim(),
    form.publications,
    form.collaborations,
    form.rapportFile,
    form.attestationFile,
  ].filter(Boolean).length;

  const progress = Math.round((filledFields / 8) * 100);

  const handleSaveDraft = async () => {
    if (!demande?.demandeId) {
      setSubmitError(t('Demande introuvable pour sauvegarder le brouillon.'));
      return;
    }

    try {
      await saveRapportDraft(demande.demandeId, form);
      setSubmitError('');
      setDraftMessage(t('Brouillon sauvegarde localement pour cette demande, y compris les documents joints.'));
    } catch {
      setSubmitError(t('Impossible de sauvegarder le brouillon localement.'));
    }
  };

  const handleSubmitRapport = async () => {
    if (!demande?.demandeId) {
      setSubmitError(t('Demande introuvable pour la soumission du rapport.'));
      return;
    }

    if (!form.rapportFile) {
      setSubmitError(t('Veuillez joindre le rapport scientifique final (PDF).'));
      return;
    }

    if (!form.attestationFile) {
      setSubmitError(t("Veuillez joindre l'attestation de presence."));
      return;
    }

    if (!form.dateDepart || !form.dateRetour || !days) {
      setSubmitError(t('Veuillez verifier les dates reelles du sejour.'));
      return;
    }

    if (chars < minChars) {
      setSubmitError(t(`La description detaillee doit contenir au moins ${minChars} caracteres.`));
      return;
    }

    if (!hasAtLeastOneObjectif(form.objectifs)) {
      setSubmitError(t('Veuillez indiquer au moins un objectif atteint.'));
      return;
    }

    if (!form.resultats.trim()) {
      setSubmitError(t('Veuillez renseigner les principaux resultats obtenus.'));
      return;
    }

    if (!form.publications || !form.collaborations) {
      setSubmitError(t('Veuillez completer les champs publications prevues et collaborations futures.'));
      return;
    }

    if (!form.civilite || !form.nomComplet.trim() || !form.dateSigne) {
      setSubmitError(t('Veuillez completer la declaration finale avant la soumission.'));
      return;
    }

    if (!form.signe) {
      setSubmitError(t('Veuillez ajouter votre signature avant de soumettre le rapport.'));
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError('');
      setDraftMessage('');
      await submitRapport(demande.demandeId, form);
      await clearRapportDraft(demande.demandeId);

      if (onSubmitted) {
        await onSubmitted();
      } else {
        onBack?.();
      }
    } catch (err) {
      setSubmitError(err.message || t('Erreur lors de la soumission du rapport.'));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="main-content-rapp">
      <main className="sr-page-body">
        <div className="sr-top-row">
          <button type="button" className="sr-back-btn" onClick={onBack}>
            <IconArrowLeft /> {t("Retour aux rapports")}
          </button>
          <div className="sr-title-block">
            <h1 className="sr-main-title">{t("Rapport de fin de sejour")}</h1>
            <p className="sr-main-sub">{t("Sejour Scientifique")} - {demande?.ville || 'Paris'}, {demande?.pays || 'France'}</p>
          </div>
        </div>

        <div className="sr-info-banner">
          <span className="sr-info-icon"><IconClipboard /></span>
          <div>
            <p className="sr-info-title">{t("Informations importantes")}</p>
            <ul className="sr-info-list">
              <li>{t("Le rapport doit etre soumis")} <strong>{t("dans les 15 jours")}</strong> {t("suivant la fin du sejour")}</li>
              <li>{t("Tous les champs marques d'un asterisque (*) sont obligatoires")}</li>
              <li>{t("Le rapport final PDF doit contenir entre 3 et 10 pages")}</li>
              <li>{t("Vous pouvez sauvegarder votre brouillon a tout moment")}</li>
            </ul>
          </div>
        </div>

        <div className="sr-progress-card">
          <div className="sr-progress-header">
            <span className="sr-progress-label">{t("Progression")}</span>
            <span className="sr-progress-pct">{progress}%</span>
          </div>
          <div className="sr-progress-track">
            <div className="sr-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {draftLoading && (
          <p style={{ color: '#475569', marginBottom: '10px' }}>{t("Chargement du brouillon...")}</p>
        )}

        <div className="sr-section-card">
          <SectionHeader num={1} title={t("Informations Generales")} color="navy" />
          <div className="sr-grid">
            <Field label={t("Reference de la demande")}>
              <Input value={form.reference} readOnly />
            </Field>
            <Field label={t("Type de sejour")}>
              <Input value={form.typeSejour} readOnly />
            </Field>
            <DateField label={t("Date de depart reelle")} required value={form.dateDepart} onChange={set('dateDepart')} t={t} />
            <DateField label={t("Date de retour reelle")} required value={form.dateRetour} onChange={set('dateRetour')} t={t} />

            <div className="sr-field--full">
              {days !== null && days > 0 && (
                <div className="sr-duration">
                  <span>{t("Duree totale estimee")} : <strong>{days} {t("jours")}</strong></span>
                </div>
              )}
              {form.dateDepart && form.dateRetour && !days && (
                <div className="sr-duration sr-duration--error">
                  <span>{t("La date de retour doit etre apres la date de depart")}</span>
                </div>
              )}
              {(!form.dateDepart || !form.dateRetour) && (
                <div className="sr-duration sr-duration--empty">
                  <span>{t("Duree totale estimee")} : <strong>-</strong></span>
                </div>
              )}
            </div>

            <Field label={t("Pays visite")}>
              <Input value={form.pays} readOnly />
            </Field>
            <Field label={t("Ville")}>
              <Input value={form.ville} readOnly />
            </Field>
            <Field label={t("Institution d'accueil")} full>
              <Input value={form.institution} readOnly />
            </Field>
          </div>
        </div>

        <div className="sr-section-card sr-section-card--gold">
          <SectionHeader num={2} title={t("Activites Realisees")} color="gold" />
          <Field label={t("Description detaillee des activites")} required full>
            <textarea
              className="sr-input sr-textarea"
              placeholder={t("Decrivez les activites de recherche, formations suivies, collaborations etablies...")}
              value={form.description}
              onChange={set('description')}
            />
            <span className={`sr-word-count${chars < minChars ? ' sr-word-count--warn' : ' sr-word-count--ok'}`}>
              {chars} / {minChars} {t("caracteres minimum")}
            </span>
          </Field>

          <div className="sr-check-group">
            <label className="sr-label">{t("Objectifs atteints")} <span className="sr-required">*</span></label>
            <CheckRow label={t("Formation aux nouvelles techniques de recherche")} checked={form.objectifs.formation} onChange={() => toggleObj('formation')} />
            <CheckRow label={t("Collaboration internationale etablie")} checked={form.objectifs.collaboration} onChange={() => toggleObj('collaboration')} />
            <CheckRow label={t("Publication scientifique en cours")} checked={form.objectifs.publication} onChange={() => toggleObj('publication')} />
            <CheckRow label={t("Presentation de mes travaux")} checked={form.objectifs.presentation} onChange={() => toggleObj('presentation')} />
            <CheckRow label={t("Autre (preciser)")} checked={form.objectifs.autre} onChange={() => toggleObj('autre')} />
            {form.objectifs.autre && (
              <input
                className="sr-input"
                placeholder={t("Precisez...")}
                value={form.objectifs.autreText}
                onChange={(e) => setForm((f) => ({ ...f, objectifs: { ...f.objectifs, autreText: e.target.value } }))}
              />
            )}
          </div>
        </div>

        <div className="sr-section-card sr-section-card--green">
          <SectionHeader num={3} title={t("Resultats et Impact Scientifique")} color="green" />
          <Field label={t("Principaux resultats obtenus")} required full>
            <textarea
              className="sr-input sr-textarea"
              placeholder={t("Decrivez les resultats concrets, decouvertes, competences acquises...")}
              value={form.resultats}
              onChange={set('resultats')}
            />
          </Field>
          <div className="sr-grid">
            <Field label={t("Publications prevues")} required>
              <Select
                value={form.publications}
                onChange={set('publications')}
                placeholder={t("Selectionner...")}
                options={[t('Oui, article en preparation'), t('Oui, article soumis'), t('Non, pas de publication prevue')]}
              />
            </Field>
            <Field label={t("Collaborations futures")} required>
              <Select
                value={form.collaborations}
                onChange={set('collaborations')}
                placeholder={t("Selectionner...")}
                options={[t('Oui, projet commun envisage'), t('Oui, echanges reguliers'), t('Non')]}
              />
            </Field>
            <Field label={t("Impact pour l'ESI et votre laboratoire")} full>
              <textarea
                className="sr-input sr-textarea sr-textarea--sm"
                placeholder={t("Comment ce sejour beneficie-t-il a l'ESI, votre equipe de recherche...")}
                value={form.impact}
                onChange={set('impact')}
              />
            </Field>
          </div>
        </div>

        <div className="sr-section-card sr-section-card--orange">
          <SectionHeader num={4} title={t("Documents Justificatifs")} color="orange" />
          <FileUpload
            label={t("Rapport scientifique final (PDF)")}
            required
            hint={t("Format PDF, 3-10 pages, max 5MB")}
            value={form.rapportFile}
            onChange={(f) => setForm((p) => ({ ...p, rapportFile: f }))}
          />
          <FileUpload
            label={t("Attestation de presence")}
            required
            subHint={t("Signee par l'institution d'accueil")}
            value={form.attestationFile}
            onChange={(f) => setForm((p) => ({ ...p, attestationFile: f }))}
          />
          <FileUpload
            label={t("Justificatifs de transport")}
            required
            hint={t("Billets d'avion, train, etc.")}
            value={form.justificatifsFile}
            onChange={(f) => setForm((p) => ({ ...p, justificatifsFile: f }))}
          />
          <FileUpload
            label={t("Photos/Visuels (optionnel)")}
            hint={t("Photos du sejour, conferences, collaborations (max 10MB)")}
            value={form.photosFile}
            onChange={(f) => setForm((p) => ({ ...p, photosFile: f }))}
          />
          <FileUpload
            label={t("Publications/Presentations (optionnel)")}
            hint={t("Articles, slides de presentation, posters...")}
            value={form.publicationsFile}
            onChange={(f) => setForm((p) => ({ ...p, publicationsFile: f }))}
          />
        </div>

        <div className="sr-section-card sr-section-card--purple">
          <SectionHeader num={5} title={t("Evaluation et Recommandations")} color="purple" />

          <Field label={t("Evaluation globale du sejour")} required>
            <div className="sr-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`sr-star${star <= form.rating ? ' sr-star--active' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, rating: star }))}
                >
                  *
                </button>
              ))}
              <span className="sr-rating-label">{form.rating}/5 - {RATING_LABELS[form.rating]}</span>
            </div>
          </Field>

          <Field label={t("Points positifs")} full>
            <textarea
              className="sr-input sr-textarea sr-textarea--sm"
              placeholder={t("Aspects particulierement benefiques du sejour...")}
              value={form.pointsPositifs}
              onChange={set('pointsPositifs')}
            />
          </Field>

          <Field label={t("Difficultes rencontrees")} full>
            <textarea
              className="sr-input sr-textarea sr-textarea--sm"
              placeholder={t("Obstacles, defis, ameliorations suggerees...")}
              value={form.difficultes}
              onChange={set('difficultes')}
            />
          </Field>

          <Field label={t("Recommanderiez-vous cette institution a d'autres chercheurs ?")} required>
            <div className="sr-radio-row">
              {[
                { value: 'oui_fortement', label: t('Oui, fortement') },
                { value: 'oui', label: t('Oui') },
                { value: 'neutre', label: t('Neutre') },
                { value: 'non', label: t('Non') },
              ].map((opt) => (
                <label key={opt.value} className="sr-radio-label">
                  <input
                    type="radio"
                    className="sr-radio"
                    name="recommande"
                    value={opt.value}
                    checked={form.recommande === opt.value}
                    onChange={set('recommande')}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div className="sr-section-card sr-section-card--dark">
          <SectionHeader num={6} title={t("Declaration et Signature")} color="dark" />

          <div className="sr-declaration-box">
            <p className="sr-declaration-text">
              {t("Je certifie que les informations fournies dans ce rapport sont exactes et completes.")}
              {t("Je comprends que toute fausse declaration peut entrainer des sanctions.")} *
            </p>
          </div>

          <div className="sr-grid">
            <Field label={t("Civilite")} required>
              <Select
                value={form.civilite}
                onChange={set('civilite')}
                placeholder={t("Selectionner...")}
                options={['Dr', 'Prof', 'M.', 'Mme', 'Mlle']}
              />
            </Field>
            <div />
            <Field label={t("Nom complet")} required>
              <Input placeholder={t("Votre nom complet")} value={form.nomComplet} onChange={set('nomComplet')} />
            </Field>
            <DateField label={t("Date")} required value={form.dateSigne} onChange={set('dateSigne')} t={t} />
          </div>

          <SignaturePad
            signed={form.signe}
            onSign={() => setForm((f) => ({ ...f, signe: true }))}
            onClear={() => setForm((f) => ({ ...f, signe: false }))}
          />
        </div>

        <div className="sr-footer">
          <button type="button" className="sr-footer-save" onClick={handleSaveDraft}>
            <IconSave /> {t("Sauvegarder brouillon")}
          </button>
          <div className="sr-footer-right">
            <button type="button" className="sr-footer-cancel" onClick={onBack}>{t("Annuler")}</button>
            <button
              type="button"
              className="sr-footer-submit"
              onClick={handleSubmitRapport}
              disabled={submitLoading}
            >
              <IconSend /> {submitLoading ? t('Soumission...') : t('Soumettre le rapport')}
            </button>
          </div>
        </div>

        {draftMessage && (
          <p style={{ color: '#166534', marginTop: '10px' }}>{draftMessage}</p>
        )}
        {submitError && (
          <p style={{ color: '#b91c1c', marginTop: '10px' }}>{submitError}</p>
        )}

        <div className="sr-help-banner">
          <span className="sr-help-icon"><IconBulb /></span>
          <div>
            <p className="sr-help-title">{t("Besoin d'aide ?")}</p>
            <p className="sr-help-sub">{t("Consultez notre guide de redaction ou contactez le service DPGR")}</p>
            <div className="sr-help-btns">
              <button type="button" className="sr-help-btn"><IconBook /> {t("Guide de redaction")}</button>
              <button type="button" className="sr-help-btn"><IconMessage /> {t("Contacter DPGR")}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
