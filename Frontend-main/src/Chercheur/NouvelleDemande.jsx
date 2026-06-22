import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from './DatePicker';
import './NouvelleDemande.css';
import { getDemandeById, getDocumentsDemandeDetailed, getProfil } from '../api/chercheur';
import { useDemande } from './DemandeContext';

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// Steps moved inside component to support translation


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

const hasMeaningfulValues = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  return Object.values(obj).some((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return hasMeaningfulValues(value);
    return false;
  });
};

function Field({ label, children, full }) {
  return (
    <div className={`nd-field${full ? ' nd-field--full' : ''}`}>
      <label className="nd-label">{label}</label>
      {children}
    </div>
  );
}
function Input({ placeholder, value, onChange, readOnly = false }) {
  return (
    <input
      className={`nd-input${readOnly ? ' nd-input--readonly' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
}


export default function NouvelleDemandeForm({ setActive, editDemande }) {
  const { t } = useTranslation();
  const steps = [
    { num: 1, label: t('Informations personnelles') },
    { num: 2, label: t('Détails du séjour')         },
    { num: 3, label: t('Documents')                 },
    { num: 4, label: t('Informations additionnelles') },
    { num: 5, label: t('Confirmation')              },
  ];

  const [currentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [passportExpiry, setPassportExpiry] = useState('');
  const dateFieldRef = useRef(null);

  const [form, setForm] = useState({
    nom: '', prenom: '',
    email: '', telephone: '',
    grade: '', departement: '',
    specialite: '',
    equipe: '',
    directeur: '',
    adresse: '', passport: '',
    urgNom: '', urgLien: '', urgTel: '', urgEmail: '',
  });
  const {
    personnel,
    currentDemandeId,
    sejour,
    documents,
    setPersonnel,
    setCurrentDemandeId,
    setSejour,
    setDocuments,
    setAdditionalInfo,
  } = useDemande();
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // Pré-remplir depuis brouillon ou profil (ne pas vider le parent ici: ça remontait l’effet et écrasait le brouillon avec getProfil)
  useEffect(() => {
    let ignore = false;

    const loadNewDemandeDefaults = async () => {
      setCurrentDemandeId(null);
      setSejour({});
      setDocuments({});
      setAdditionalInfo({});

      const data = await getProfil();
      if (ignore) return;

      const nextPersonnel =  {
        nom: data.nom || '',
        prenom: data.prenom || '',
        email: data.email || '',
        telephone: data.telephone || '',
        grade: data.grade || '',
        specialite: data.profil?.domaine_principal || '',
        equipe: data.profil?.equipe_recherche || '',
        adresse: data.profil?.adresse || '',
      };

      setForm((f) => ({
        ...f,
        ...nextPersonnel,
        urgNom: '',
        urgLien: '',
        urgTel: '',
        urgEmail: '',
      }));
      setPersonnel(nextPersonnel);
    };

    const loadDraftForEdit = async () => {
      const draftId = editDemande.id;
      setCurrentDemandeId(draftId);

      const [profilData, demandeData, docs] = await Promise.all([
        getProfil(),
        getDemandeById(draftId),
        getDocumentsDemandeDetailed(draftId),
      ]);

      if (ignore) return;

      const cached = readDraftExtras(draftId);
      const nextPersonnel = {
        nom: profilData.nom || demandeData.chercheur_nom || '',
        prenom: profilData.prenom || demandeData.chercheur_prenom || '',
        email: profilData.email || '',
        telephone: cached.telephone || profilData.telephone || '',
        grade: profilData.grade || demandeData.chercheur_grade || '',
        specialite: cached.specialite || profilData.profil?.domaine_principal || '',
        equipe: cached.equipe || profilData.profil?.equipe_recherche || '',
        adresse: cached.adresse || profilData.profil?.adresse || '',
      };

      setForm((f) => ({
        ...f,
        ...nextPersonnel,
        urgNom: cached.urgNom || '',
        urgLien: cached.urgLien || '',
        urgTel: cached.urgTel || '',
        urgEmail: cached.urgEmail || '',
      }));
      setPersonnel(nextPersonnel);

      setSejour({
        paysId: demandeData.pays || null,
        pays: demandeData.destination || '',
        ville: demandeData.ville_accueil || '',
        institution: demandeData.institution_accueil || '',
        dateDebut: demandeData.date_debut || '',
        dateFin: demandeData.date_fin || '',
        typeSejourId: demandeData.type_sejour?.id || null,
        typeSejour: demandeData.type_sejour?.libelle || demandeData.type_sejour?.code || '',
        sessionId: demandeData.session || null,
        session: '',
        superviseurNom: cached.superviseurNom || '',
        superviseurTitre: cached.superviseurTitre || '',
        superviseurEmail: cached.superviseurEmail || '',
        superviseurTel: cached.superviseurTel || '',
        objectifs: demandeData.objectifs_scientifiques || '',
        intitule: cached.intitule || '',
      });

      const docsSummary = (Array.isArray(docs) ? docs : []).reduce((acc, doc) => {
        const key = String(doc.type_document || '').replace(/[\[\]"]/g, '').trim();
        if (!key) return acc;
        acc[key] = {
          id: doc.id,
          name: doc.fichier ? String(doc.fichier).split('/').pop() : key,
          sizeLabel: '',
        };
        return acc;
      }, {});
      setDocuments(docsSummary);
      setAdditionalInfo(cached.additionalInfo || {});
    };

    const run = async () => {
      try {
        if (editDemande && editDemande.status === 'BROUILLON') {
          await loadDraftForEdit();
          return;
        }

        const hasOngoingContext =
          Boolean(currentDemandeId) ||
          hasMeaningfulValues(personnel) ||
          hasMeaningfulValues(sejour) ||
          hasMeaningfulValues(documents);

        if (hasOngoingContext) {
          setForm((f) => ({
            ...f,
            nom: personnel.nom || f.nom,
            prenom: personnel.prenom || f.prenom,
            email: personnel.email || f.email,
            telephone: personnel.telephone || f.telephone,
            grade: personnel.grade || f.grade,
            specialite: personnel.specialite || f.specialite,
            equipe: personnel.equipe || f.equipe,
            adresse: personnel.adresse || f.adresse,
            urgNom: personnel.urgNom || f.urgNom,
            urgLien: personnel.urgLien || f.urgLien,
            urgTel: personnel.urgTel || f.urgTel,
            urgEmail: personnel.urgEmail || f.urgEmail,
          }));
          return;
        }

        await loadNewDemandeDefaults();
      } catch {
        // Keep the form usable even if prefill fails.
      }
    };

    run();
    return () => {
      ignore = true;
    };
  }, [
    editDemande,
    setPersonnel,
    setCurrentDemandeId,
    setSejour,
    setDocuments,
    setAdditionalInfo,
  ]);

  useEffect(() => {
    setPersonnel({
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone,
      grade: form.grade,
      specialite: form.specialite,
      equipe: form.equipe,
      adresse: form.adresse,
      urgNom: form.urgNom,
      urgLien: form.urgLien,
      urgTel: form.urgTel,
      urgEmail: form.urgEmail,
    });
  }, [form, setPersonnel]);

  useEffect(() => {
    const draftId = currentDemandeId || editDemande?.id;
    if (!draftId) return;
    writeDraftExtras(draftId, {
      ...readDraftExtras(draftId),
      telephone: form.telephone,
      specialite: form.specialite,
      equipe: form.equipe,
      adresse: form.adresse,
      urgNom: form.urgNom,
      urgLien: form.urgLien,
      urgTel: form.urgTel,
      urgEmail: form.urgEmail,
    });
  }, [
    currentDemandeId,
    editDemande,
    form.telephone,
    form.specialite,
    form.equipe,
    form.adresse,
    form.urgNom,
    form.urgLien,
    form.urgTel,
    form.urgEmail,
  ]);


  useEffect(() => {
    const handler = (e) => {
      if (dateFieldRef.current && !dateFieldRef.current.contains(e.target))
        setShowDatePicker(false);
    };
    if (showDatePicker) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDatePicker]);

  const formatDisplay = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <main className="nd-page-body">
      {/* Stepper */}
      <div className="nd-stepper">
        {steps.map(({ num, label }, i) => (
          <div key={num} className={`nd-step${num === currentStep ? ' nd-step--active' : num < currentStep ? ' nd-step--done' : ''}`}>
            <div className="nd-step-left">
              <div className="nd-step-circle">
                {num < currentStep ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : num}
              </div>
              {i < steps.length - 1 && <div className="nd-step-line" />}
            </div>
            <span className="nd-step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="nd-form-card">
        <h2 className="nd-section-title">{t("Informations Personnelles")}</h2>
        <p className="nd-section-sub">{t("Veuillez vérifier et compléter vos informations personnelles")}</p>

        <div className="nd-grid">
          <Field label={t("Nom")}><Input placeholder={t("Nom")} value={form.nom} readOnly /></Field>
          <Field label={t("Prénom")}><Input placeholder={t("Prénom")} value={form.prenom} readOnly /></Field>
          <Field label={t("Email institutionnel")}><Input placeholder={t("Email")} value={form.email} readOnly /></Field>
          <Field label={t("Téléphone")}><Input placeholder="+213 xxx xxx xxx" value={form.telephone} onChange={set('telephone')} /></Field>
          <Field label={t("Grade")}><Input placeholder={t("Grade")} value={form.grade} readOnly /></Field>
          <Field label={t("Spécialité de recherche")}><Input placeholder="Intelligence Artificielle, Machine Learning..." value={form.specialite} onChange={set('specialite')} /></Field>
          <Field label={t("Équipe de laboratoire")}><Input placeholder="LCSI - Laboratoire de Communication dans les Sy" value={form.equipe} onChange={set('equipe')} /></Field>
          <Field label={t("Adresse")} full>
            <textarea className="nd-input nd-textarea" placeholder="Ecole nationale Supérieure d'Informatique" value={form.adresse} onChange={set('adresse')} />
          </Field>
        </div>

        {/* Contact d'urgence */}
        <div className="nd-urgence"> 
          <h3 className="nd-urgence-title">{t("Contact d'urgence")}</h3>
          <div className="nd-grid">
            <Field label={t("Nom complet")}><Input placeholder={t("Nom et prénom du contact")} value={form.urgNom} onChange={set('urgNom')} /></Field>
            <Field label={t("Lien de parenté")}><Input placeholder={t("Époux(se), Parent, Frère/Sœur...")} value={form.urgLien} onChange={set('urgLien')} /></Field>
            <Field label={t("Téléphone")}><Input placeholder="+213 555 000 000" value={form.urgTel} onChange={set('urgTel')} /></Field>
            <Field label={t("Email")}><Input placeholder="contact@example.com" value={form.urgEmail} onChange={set('urgEmail')} /></Field>
          </div>
        </div>

        <div className="nd-form-footer">
          <button className="nd-btn-cancel" onClick={() => setActive('accueil')}>{t("Annuler")}</button>
          <button className="nd-btn-next" onClick={() => setActive('detailssejour')}>
            {t("Suivant")}&nbsp;: {t("Type de séjour")}&nbsp;<IconArrow />
          </button>
        </div>
      </div>
    </main>
  );
}
