import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from './DatePicker';
import './DetailsSejour.css';
import {
  creerDemande,
  getCitiesByCountry,
  getPays,
  getSessions,
  getTypesSejour,
  mettreAJourDemande,
} from '../api/demandes';
import { useDemande } from './DemandeContext';

const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconPerson = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Steps moved inside component to support translation


const CURRENT_STEP = 2;

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

function getCurrentAcademicYearLabel() {
  const today = new Date();
  const year = today.getFullYear();
  const startYear = today.getMonth() >= 8 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

function inferTypeCodeFromGrade(grade) {
  if (!grade) return null;
  return ['DOC_NS', 'ENS'].includes(grade) ? 'SPCTT' : 'SSHN';
}

function Field({ label, children, full, hint }) {
  return (
    <div className={`ds-field${full ? ' ds-field--full' : ''}`}>
      <label className="ds-label">{label}</label>
      {children}
      {hint && <span className="ds-hint">{hint}</span>}
    </div>
  );
}

function Input({ placeholder, value, onChange }) {
  return (
    <div className="ds-input-wrap">
      <input className="ds-input" placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
}

function DateField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const formatDisplay = (iso) => {
    if (!iso) return '';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <Field label={label}>
      <div className="ds-date-field" ref={ref} onClick={() => setOpen((value) => !value)}>
        <span className="ds-date-icon"><IconCalendar /></span>
        <input className="ds-input ds-date-input" placeholder="jj/mm/aaaa" value={formatDisplay(value)} readOnly />
        {open && (
          <div className="ds-dp-dropdown" onClick={(event) => event.stopPropagation()}>
            <DatePicker value={value} onChange={onChange} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </Field>
  );
}

function calcDays(start, end) {
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

  return diff > 0 ? diff : null;
}

export default function DetailsSejour({ setActive }) {
  const { t } = useTranslation();
  const steps = [
    { num: 1, label: t('Informations personnelles') },
    { num: 2, label: t('Details du sejour') },
    { num: 3, label: t('Documents') },
    { num: 4, label: t('Informations additionnelles') },
    { num: 5, label: t('Confirmation') },
  ];
  const [form, setForm] = useState({
    pays: '',
    ville: '',
    institution: '',
    dateDebut: '',
    dateFin: '',
    typeSejour: '',
    session: '',
    superviseurNom: '',
    superviseurTitre: '',
    superviseurEmail: '',
    superviseurTel: '',
    objectifs: '',
    intitule: '',
  });
  const [paysList, setPaysList] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);
  const [typesList, setTypesList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityError, setCityError] = useState('');
  const { currentDemandeId, setCurrentDemandeId, personnel, sejour, setSejour } = useDemande();

  useEffect(() => {
    Promise.all([getPays(), getSessions(), getTypesSejour()])
      .then(([pays, sessions, types]) => {
        setPaysList(pays || []);
        setSessionsList(sessions || []);
        setTypesList(types || []);
      })
      .catch(() => setError(t('Erreur lors du chargement des donnees')));
  }, []);

  useEffect(() => {
    if (!sessionsList.length) return;

    setForm((prev) => {
      if (prev.session) return prev;

      const currentAcademicYear = getCurrentAcademicYearLabel();
      const preferredSession =
        sessionsList.find((session) => session.etat === 'OUVERTE') ||
        sessionsList.find((session) => session.annee_academique === currentAcademicYear) ||
        sessionsList[0];

      return preferredSession
        ? { ...prev, session: String(preferredSession.id) }
        : prev;
    });
  }, [sessionsList]);

  useEffect(() => {
    if (!typesList.length) return;

    setForm((prev) => {
      if (prev.typeSejour) return prev;

      const expectedTypeCode = inferTypeCodeFromGrade(personnel?.grade);
      const preferredType =
        typesList.find((type) => type.code === expectedTypeCode) ||
        typesList[0];

      return preferredType
        ? { ...prev, typeSejour: String(preferredType.id) }
        : prev;
    });
  }, [typesList, personnel]);

  useEffect(() => {
    if (!sejour || Object.keys(sejour).length === 0) return;

    setForm((prev) => {
      const next = {
        ...prev,
        pays: sejour.paysId ? String(sejour.paysId) : prev.pays,
        ville: sejour.ville || prev.ville,
        institution: sejour.institution || prev.institution,
        dateDebut: sejour.dateDebut || prev.dateDebut,
        dateFin: sejour.dateFin || prev.dateFin,
        typeSejour: sejour.typeSejourId ? String(sejour.typeSejourId) : prev.typeSejour,
        session: sejour.sessionId ? String(sejour.sessionId) : prev.session,
        superviseurNom: sejour.superviseurNom || prev.superviseurNom,
        superviseurTitre: sejour.superviseurTitre || prev.superviseurTitre,
        superviseurEmail: sejour.superviseurEmail || prev.superviseurEmail,
        superviseurTel: sejour.superviseurTel || prev.superviseurTel,
        objectifs: sejour.objectifs || prev.objectifs,
        intitule: sejour.intitule || prev.intitule,
      };
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [sejour]);

  useEffect(() => {
    const selectedPays = paysList.find((item) => item.id === parseInt(form.pays, 10));

    if (!selectedPays) {
      setCityList([]);
      setCityError('');
      return;
    }

    let ignore = false;
    setCityLoading(true);
    setCityError('');

    const backendCities = Array.isArray(selectedPays.cities) ? selectedPays.cities : [];

    const applyCities = (cities) => {
      const uniqueCities = [...new Set((cities || []).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      setCityList(uniqueCities);
      setForm((prev) => ({
        ...prev,
        ville: uniqueCities.includes(prev.ville) ? prev.ville : '',
      }));
    };

    if (backendCities.length) {
      applyCities(backendCities);
      setCityLoading(false);
      return;
    }

    getCitiesByCountry(selectedPays.name)
      .then((cities) => {
        if (ignore) return;
        applyCities(cities);
      })
      .catch((err) => {
        if (ignore) return;
        setCityList([]);
        setCityError(err.message || 'Erreur lors du chargement des villes. Saisissez la ville manuellement.');
        setForm((prev) => ({ ...prev, ville: '' }));
      })
      .finally(() => {
        if (!ignore) {
          setCityLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [form.pays, paysList]);

  const setValue = (key) => (value) => {
    const nextValue = value?.target ? value.target.value : value;
    setForm((prev) => ({ ...prev, [key]: nextValue }));
  };

  const days = calcDays(form.dateDebut, form.dateFin);

  const persistSejourInContext = () => {
    const paysId = form.pays ? parseInt(form.pays, 10) : null;
    const typeSejourId = form.typeSejour ? parseInt(form.typeSejour, 10) : null;
    const sessionId = form.session ? parseInt(form.session, 10) : null;
    const selectedPays = paysList.find((item) => item.id === paysId);
    const selectedType = typesList.find((item) => item.id === typeSejourId);
    const selectedSession = sessionsList.find((item) => item.id === sessionId);

    setSejour({
      paysId,
      pays: selectedPays?.name || '',
      ville: form.ville,
      institution: form.institution,
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
      typeSejourId,
      typeSejour: selectedType?.libelle || selectedType?.code || '',
      sessionId,
      session: selectedSession?.annee_academique || '',
      superviseurNom: form.superviseurNom,
      superviseurTitre: form.superviseurTitre,
      superviseurEmail: form.superviseurEmail,
      superviseurTel: form.superviseurTel,
      objectifs: form.objectifs,
      intitule: form.intitule,
    });
  };

  const handleRetourInformations = () => {
    persistSejourInContext();
    setActive('nouvelle');
  };

  const handleSuivant = async () => {
    if (
      !form.pays ||
      !form.dateDebut ||
      !form.dateFin ||
      !form.typeSejour ||
      !form.session ||
      !form.objectifs ||
      !form.ville ||
      !form.institution
    ) {
      setError(t('Veuillez remplir tous les champs obligatoires.'));
      return;
    }

    setError('');
    setLoading(true);

    const selectedPays = paysList.find((item) => item.id === parseInt(form.pays, 10));
    const selectedType = typesList.find((item) => item.id === parseInt(form.typeSejour, 10));
    const selectedSession = sessionsList.find((item) => item.id === parseInt(form.session, 10));

    const payload = {
      type_sejour: parseInt(form.typeSejour, 10),
      session: parseInt(form.session, 10),
      pays: parseInt(form.pays, 10),
      date_debut: form.dateDebut,
      date_fin: form.dateFin,
      destination: selectedPays?.name || '',
      institution_accueil: form.institution,
      ville_accueil: form.ville,
      objectifs_scientifiques: form.objectifs,
    };

    try {
      const savedDemande = currentDemandeId
        ? await mettreAJourDemande(currentDemandeId, payload)
        : await creerDemande(payload);

      setCurrentDemandeId(savedDemande.id);
      writeDraftExtras(savedDemande.id, {
        ...readDraftExtras(savedDemande.id),
        superviseurNom: form.superviseurNom,
        superviseurTitre: form.superviseurTitre,
        superviseurEmail: form.superviseurEmail,
        superviseurTel: form.superviseurTel,
        intitule: form.intitule,
        objectifs: form.objectifs,
        ville: form.ville,
        institution: form.institution,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        paysId: parseInt(form.pays, 10),
      });
      persistSejourInContext();
      setActive('documentDeposit');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ds-page-body">
      <div className="ds-stepper">
        {steps.map(({ num, label }, index) => (
          <div
            key={num}
            className={`ds-step${num === CURRENT_STEP ? ' ds-step--active' : num < CURRENT_STEP ? ' ds-step--done' : ''}`}
          >
            <div className="ds-step-left">
              <div className="ds-step-circle">
                {num < CURRENT_STEP ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : num}
              </div>
              {index < steps.length - 1 && <div className="ds-step-line" />}
            </div>
            <span className="ds-step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="ds-form-card">
        <h2 className="ds-section-title">{t("Details du sejour scientifique")}</h2>
        <p className="ds-section-sub">{t("Precisez les informations concernant votre sejour")}</p>

        {error && <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}

        <div className="ds-grid">
          <Field label={t("Intitule du projet de recherche")} full>
            <Input
              placeholder={t("Titre complet de votre projet ou thématique de recherche")}
              value={form.intitule}
              onChange={setValue('intitule')}
            />
          </Field>
          <Field label={t("Type de sejour")} hint={t("Attribue automatiquement selon votre grade")}>
            <select className="ds-input" value={form.typeSejour} onChange={setValue('typeSejour')} disabled>
              <option value="">{t("Chargement...")}</option>
              {typesList.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.libelle || type.code}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Session academique")} hint={t("Session ouverte ou année académique en cours")}>
            <select className="ds-input" value={form.session} onChange={setValue('session')} disabled>
              <option value="">{t("Chargement...")}</option>
              {sessionsList.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.annee_academique}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="ds-grid">
          <Field label={t("Pays de destination")}>
            <select className="ds-input" value={form.pays} onChange={setValue('pays')}>
              <option value="">{t("Selectionner...")}</option>
              {paysList.map((pays) => (
                <option key={pays.id} value={pays.id}>
                  {pays.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Ville de destination")}>
            <Input
              placeholder={t("Saisir la ville")}
              value={form.ville}
              onChange={setValue('ville')}
            />
          </Field>
          <Field label={t("Institution d'accueil")} full>
            <Input placeholder="Universite de Paris..." value={form.institution} onChange={setValue('institution')} />
          </Field>
        </div>

        <div className="ds-grid ds-grid--dates">
          <DateField label={t("Date de debut")} value={form.dateDebut} onChange={setValue('dateDebut')} />
          <DateField label={t("Date de fin")} value={form.dateFin} onChange={setValue('dateFin')} />
        </div>

        {days !== null && days > 0 && (
          <div className="ds-duration">
            <span>{t("Duree totale estimee")} : <strong>{days} {t("jours")}</strong></span>
          </div>
        )}
        {form.dateDebut && form.dateFin && !days && (
          <div className="ds-duration ds-duration--error">
            <span>{t("La date de fin doit etre apres la date de debut")}</span>
          </div>
        )}
        {(!form.dateDebut || !form.dateFin) && (
          <div className="ds-duration ds-duration--empty">
            <span>{t("Duree totale estimee")} : <strong>-</strong></span>
          </div>
        )}

        <div className="ds-contact-section">
          <div className="ds-section-divider">
            <span className="ds-section-icon"><IconPerson /></span>
            <span className="ds-section-sub-title">{t("Contact sur place (Superviseur / Responsable)")}</span>
          </div>
          <div className="ds-grid">
            <Field label={t("Nom et prenom")}>
              <Input placeholder="Pr. Jean DUPONT" value={form.superviseurNom} onChange={setValue('superviseurNom')} />
            </Field>
            <Field label={t("Titre/Grade")}>
              <Input placeholder={t("Professeur, Directeur de recherche...")} value={form.superviseurTitre} onChange={setValue('superviseurTitre')} />
            </Field>
            <Field label={t("Email")}>
              <Input placeholder="j.dupont@university.fr" value={form.superviseurEmail} onChange={setValue('superviseurEmail')} />
            </Field>
            <Field label={t("Telephone")}>
              <Input placeholder="+33 1 23 45 67 89" value={form.superviseurTel} onChange={setValue('superviseurTel')} />
            </Field>
          </div>
        </div>

        <div className="ds-grid">
          <Field label={t("Objectifs principaux du sejour")} full hint={t("Minimum 200 caracteres recommandes")}>
            <textarea
              className="ds-input ds-textarea"
              placeholder={t("Decrivez les objectifs scientifiques, activites prevues, resultats attendus...")}
              value={form.objectifs}
              onChange={setValue('objectifs')}
            />
          </Field>
        </div>

        <div className="ds-form-footer">
          <button className="ds-btn-back" onClick={handleRetourInformations}>
            <IconArrowLeft /> {t("Retour")} : {t("Informations personnelles")}
          </button>
          <button className="ds-btn-next" onClick={handleSuivant} disabled={loading}>
            {loading ? t('Envoi...') : <>{t("Suivant")} : {t("Documents")} <IconArrowRight /></>}
          </button>
        </div>
      </div>
    </main>
  );
}
