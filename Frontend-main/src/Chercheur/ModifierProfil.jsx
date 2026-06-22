import { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from './DatePicker';
import './ModifierProfil.css';
import ChangerMotDePasse from './ChangerMotDePasse';
import SessionsActives from './SessionsActives';
import { getProfil, updateProfil, uploadPhotoProfil } from '../api/chercheur';

const PROFILE_UPDATED_EVENT = 'chercheur-profile-updated';

/* ── Icons ── */
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.94 6.94l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const IconLocation = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconFile = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const IconLinkedin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const IconGithub = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconMonitor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ── Reusable Field ── */
function Field({ label, required, children, full, hint }) {
  return (
    <div className={`mp-field${full ? ' mp-field--full' : ''}`}>
      <label className="mp-label">{label}{required && <span className="mp-required"> *</span>}</label>
      {children}
      {hint && <span className="mp-hint">{hint}</span>}
    </div>
  );
}

function Input({ placeholder, value, onChange, icon, readOnly }) {
  return (
    <div className={`mp-input-wrap${icon ? ' mp-input-wrap--icon' : ''}`}>
      {icon && <span className="mp-input-icon">{icon}</span>}
      <input
        className={`mp-input${readOnly ? ' mp-input--readonly' : ''}`}
        placeholder={placeholder} value={value}
        onChange={onChange} readOnly={readOnly}
      />
    </div>
  );
}

function Select({ value, onChange, options, placeholder, t }) {
  return (
    <select className="mp-select" value={value} onChange={onChange}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function DateField({ label, required, value, onChange, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const fmt = (iso) => { if (!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
  return (
    <Field label={label} required={required}>
      <div className="mp-date-field" ref={ref} onClick={() => setOpen(v => !v)}>
        <span className="mp-date-icon"><IconCalendar /></span>
        <input className="mp-input mp-date-input" placeholder="jj/mm/aaaa" value={fmt(value)} readOnly />
        {open && (
          <div className="mp-dp-dropdown" onClick={e => e.stopPropagation()}>
            <DatePicker value={value} onChange={onChange} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </Field>
  );
}

function SectionHeader({ num, title, color }) {
  return (
    <div className="mp-section-header">
      <span className={`mp-section-num mp-section-num--${color}`}>{num}</span>
      <h3 className="mp-section-title">{title}</h3>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div className={`mp-toggle${checked ? ' mp-toggle--on' : ''}`} onClick={onChange}>
      <div className="mp-toggle-thumb" />
    </div>
  );
}


function SecurityRow({ icon, title, sub, onClick }) {
  return (
    <div className="mp-security-row" onClick={onClick}>
      <span className="mp-security-icon">{icon}</span>
      <div className="mp-security-info">
        <p className="mp-security-title">{title}</p>
        <p className="mp-security-sub">{sub}</p>
      </div>
      <span className="mp-security-arrow"><IconArrowRight /></span>
    </div>
  );
}


const EMPTY_FORM = {
  civilite: '', nomComplet: '', prenom: '',
  dateNaissance: '', emailPerso: '',
  telMobile: '', telFixe: '',
  nationalite: '', adresse: '',
  grade: '', departement: '',
  labo: '', equipe: '',
  matricule: '', dateRecrutement: '',
  emailPro: '', bureau: '',
  domaine: '', motsCles: '',
  biographie: '',
  scholar: '', researchgate: '',
  orcid: '', linkedin: '',
  github: '', website: '',
};

export default function ModifierProfil({ onBack, onSaved }) {
  const { t } = useTranslation();
  const photoRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const set = (key) => (val) => {
    const value = val?.target ? val.target.value : val;
    setForm(f => ({ ...f, [key]: value }));
  };

  const [notifs, setNotifs] = useState({
    email: true, demande: true, rappels: true, newsletter: false, mobile: false,
  });
  const toggleNotif = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }));

  const [changingPassword, setChangingPassword] = useState(false);
  const [viewingSessions, setViewingSessions] = useState(false);

  // Charger le profil au démarrage
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfil();
        const p = data.profil;
        setForm({
          civilite: p.civilite || '',
          nomComplet: data.nom || '',
          prenom: data.prenom || '',
          dateNaissance: p.date_naissance || '',
          emailPerso: p.email_personnel || '',
          telMobile: p.tel_mobile || '',
          telFixe: p.tel_fixe || '',
          nationalite: p.nationalite || '',
          adresse: p.adresse || '',
          grade: p.grade || '',
          departement: p.departement || '',
          labo: p.laboratory_name || '',
          equipe: p.equipe_recherche || '',
          matricule: p.matricule_esi || '',
          dateRecrutement: p.date_recrutement || '',
          emailPro: p.email_professionnel || '',
          bureau: p.bureau || '',
          domaine: p.domaine_principal || '',
          motsCles: p.mots_cles || '',
          biographie: p.biographie || '',
          scholar: p.google_scholar || '',
          researchgate: p.researchgate || '',
          orcid: p.orcid || '',
          linkedin: p.linkedin || '',
          github: p.github || '',
          website: p.website_personnel || '',
        });
        if (p.photo_profil) setPhoto(p.photo_profil);
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      }
    };
    load();
  }, []);

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setPhoto(null);
    setPhotoError('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError('');
      await updateProfil(null, {
        civilite: form.civilite || null,
        date_naissance: form.dateNaissance || null,
        email_personnel: form.emailPerso || null,
        tel_mobile: form.telMobile || null,
        tel_fixe: form.telFixe || null,
        nationalite: form.nationalite || null,
        adresse: form.adresse || null,
        departement: form.departement || null,
        equipe_recherche: form.equipe || null,
        bureau: form.bureau || null,
        domaine_principal: form.domaine || null,
        mots_cles: form.motsCles || null,
        biographie: form.biographie || null,
        google_scholar: form.scholar || null,
        researchgate: form.researchgate || null,
        orcid: form.orcid || null,
        linkedin: form.linkedin || null,
        github: form.github || null,
        website_personnel: form.website || null,
      });
      const updatedData = await getProfil();
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: updatedData }));
      if (onSaved) {
        onSaved(updatedData);
      } else {
        onBack();
      }
    } catch (err) {
      setSaveError(t('Erreur lors de la sauvegarde.'));
    } finally {
      setSaving(false);
    }
  };

  const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setPhotoError(t('Type de fichier non supporté. JPG, PNG, GIF ou WEBP uniquement.'));
      setPhoto(null);
      return;
    }
    setPhotoError('');
    setPhoto(URL.createObjectURL(file));
    try {
      await uploadPhotoProfil(null, file);
      const updatedData = await getProfil();
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: updatedData }));
    } catch (err) {
      setPhotoError(t('Erreur upload: ') + err.message);
    }
  };

  if (changingPassword) return <ChangerMotDePasse onBack={() => setChangingPassword(false)} />;
  if (viewingSessions) return <SessionsActives onBack={() => setViewingSessions(false)} />;

  const bioChars = form.biographie.length;
  const maxBio = 500;

  return (
    <div className="mp-edit-main">
      <main className="mpe-page-body">

        <div className="mpe-top-row">
          <button className="mpe-back-btn" onClick={onBack}><IconArrowLeft /> {t("Retour au profil")}</button>
          <div className="mpe-title-block">
            <h1 className="mpe-main-title">{t("Modifier mes informations")}</h1>
            <p className="mpe-main-sub">{t("Mettez à jour vos informations personnelles et professionnelles")}</p>
          </div>
        </div>

        <div className="mpe-info-banner">
          <span className="mpe-info-icon"><IconInfo /></span>
          <div>
            <p className="mpe-info-title">{t("Information importante")}</p>
            <p className="mpe-info-sub">{t("Les modifications apportées à votre profil seront visibles par les administrateurs DPGR et le Conseil Scientifique.")}</p>
          </div>
        </div>

        {/* Photo */}
        <div className="mpe-card">
          <h3 className="mpe-card-title">{t("Photo de profil")}</h3>
          <div className="mpe-photo-row">
            <div className="mpe-photo-avatar-wrap" onClick={() => photoRef.current.click()}>
              {photo
                ? <img src={photo} alt="profil" className="mpe-photo-img" />
                : <div className="mpe-photo-avatar">{form.nomComplet[0]}{form.prenom[0]}</div>
              }
              <button className="mpe-photo-cam" type="button"><IconCamera /></button>
            </div>
            <div className="mpe-photo-info">
              <p className="mpe-photo-label">{t("Changer la photo de profil")}</p>
              <p className="mpe-photo-hint">{t("JPG, PNG ou GIF. Taille maximale : 2MB. Résolution recommandée : 400×400px")}</p>
              {photoError && <p className="mpe-photo-error">{photoError}</p>}
              <div className="mpe-photo-btns">
                <input ref={photoRef} type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                <button className="mpe-upload-btn" onClick={() => photoRef.current.click()}>{t("Télécharger une photo")}</button>
                <button className="mpe-delete-btn" onClick={() => { setPhoto(null); setPhotoError(''); }}>{t("Supprimer")}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1 */}
        <div className="mpe-section-card mpe-section-card--navy">
          <SectionHeader num={1} title={t("Informations Personnelles")} color="navy" />
          <div className="mpe-grid">
            <Field label={t("Civilité")} required>
              <Select value={form.civilite} onChange={set('civilite')} placeholder={t("Sélectionner...")} options={['Dr','Prof','M.','Mme','Mlle']} t={t} />
            </Field>
            <Field label={t("Nom complet")} required>
              <Input placeholder={t("Nom")} value={form.nomComplet} readOnly />
            </Field>
            <Field label={t("Prénom")} required>
              <Input placeholder={t("Prénom")} value={form.prenom} readOnly />
            </Field>
            <DateField label={t("Date de naissance")} value={form.dateNaissance} onChange={set('dateNaissance')} t={t} />
            <Field label={t("Email personnel")}>
              <Input placeholder="email@gmail.com" value={form.emailPerso} readOnly icon={<IconMail />} />
            </Field>
            <Field label={t("Téléphone mobile")} required>
              <Input placeholder="+213 555 000 000" value={form.telMobile} onChange={set('telMobile')} icon={<IconPhone />} />
            </Field>
            <Field label={t("Téléphone fixe")}>
              <Input placeholder="+213 21 000 000" value={form.telFixe} onChange={set('telFixe')} icon={<IconPhone />} />
            </Field>
            <Field label={t("Nationalité")}>
              <Input placeholder={t("Nationalité")} value={form.nationalite} onChange={set('nationalite')} />
            </Field>
            
          </div>
        </div>

        {/* Section 2 */}
        <div className="mpe-section-card mpe-section-card--green">
          <SectionHeader num={2} title={t("Informations Professionnelles")} color="green" />
          <div className="mpe-grid">
            <Field label={t("Grade")}>
              <Input placeholder={t("Grade")} value={form.grade} onChange={set('grade')} readOnly />
            </Field>
            <Field label={t("Équipe de laboratoire")}>
              <Input placeholder={t("Équipe")} value={form.equipe} onChange={set('equipe')} />
            </Field>
            <Field label={t("Matricule ESI")}>
              <Input placeholder="ESI-XXXX-XXXX" value={form.matricule} onChange={set('matricule')} icon={<IconFile />} readOnly />
            </Field>
            <DateField label={t("Date de recrutement")} value={form.dateRecrutement} onChange={set('dateRecrutement')} t={t} />
            <Field label={t("Email professionnel")}>
              <Input placeholder="email@esi.dz" value={form.emailPro} onChange={set('emailPro')} icon={<IconMail />} readOnly />
            </Field>
            <Field label={t("Bureau")}>
              <Input placeholder={t("Bureau")} value={form.bureau} onChange={set('bureau')} />
            </Field>
            <Field label={t("Adresse")} full>
              <Input placeholder={t("Adresse")} value={form.adresse} onChange={set('adresse')} icon={<IconLocation />} />
            </Field>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mpe-section-card mpe-section-card--purple">
          <SectionHeader num={3} title={t("Domaines de Recherche & Expertise")} color="purple" />
          <div className="mpe-grid">
            <Field label={t("Domaine principal de recherche")} required full>
              <Select value={form.domaine} onChange={set('domaine')} placeholder={t("Sélectionner...")} options={[t('Intelligence Artificielle'),t('Machine Learning'),t('Computer Vision'),t('Traitement du Langage Naturel'),t('Cybersécurité'),t('Réseaux et Télécommunications'),t('Science des Données')]} t={t} />
            </Field>
            <Field label={t("Mots-clés de recherche")} hint={t("(séparés par des virgules)")} full>
              <Input placeholder="Machine Learning, Deep Learning..." value={form.motsCles} onChange={set('motsCles')} />
            </Field>
            <Field label={<>{t("Biographie / Présentation")} <span className="mp-label-hint">({t("max")} {maxBio} {t("caractères")})</span></>} full>
              <textarea
                className="mp-input mp-textarea"
                placeholder={t("Décrivez votre parcours, vos intérêts de recherche, vos objectifs...")}
                value={form.biographie}
                onChange={set('biographie')}
                maxLength={maxBio}
              />
              <span className={`mp-char-count${bioChars >= maxBio ? ' mp-char-count--max' : bioChars > maxBio * 0.9 ? ' mp-char-count--warn' : ''}`}>
                {bioChars} / {maxBio} {t("caractères")}
              </span>
            </Field>
          </div>
        </div>

        <div className="mpe-section-card mpe-section-card--blue">
          <SectionHeader num={5} title={t("Liens & Réseaux Professionnels")} color="blue" />
          <div className="mpe-grid">
            <Field label="Google Scholar">
              <Input placeholder="https://scholar.google.com/..." value={form.scholar} onChange={set('scholar')} icon={<IconGlobe />} />
            </Field>
            <Field label="ResearchGate">
              <Input placeholder="https://www.researchgate.net/..." value={form.researchgate} onChange={set('researchgate')} icon={<IconGlobe />} />
            </Field>
            <Field label="ORCID">
              <Input placeholder="0000-0000-0000-0000" value={form.orcid} onChange={set('orcid')} icon={<IconGlobe />} />
            </Field>
            <Field label="LinkedIn">
              <Input placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={set('linkedin')} icon={<IconLinkedin />} />
            </Field>
            <Field label="GitHub">
              <Input placeholder="https://github.com/..." value={form.github} onChange={set('github')} icon={<IconGithub />} />
            </Field>
            <Field label={t("Site web personnel")}>
              <Input placeholder="https://..." value={form.website} onChange={set('website')} icon={<IconGlobe />} />
            </Field>
          </div>
        </div>

        {/* Section 6 */}
        <div className="mpe-section-card mpe-section-card--red">
          <SectionHeader num={6} title={t("Préférences de Notification")} color="red" />
          <div className="mpe-notif-list">
            {[
              { key: 'email',      title: t('Notifications par email'),  sub: t('Recevoir des emails pour les mises à jour importantes') },
              { key: 'demande',    title: t('Notifications de demande'), sub: t('Être notifié des changements de statut de mes demandes') },
              { key: 'rappels',    title: t("Rappels d'échéances"),       sub: t('Recevoir des rappels pour les rapports à soumettre') },
              { key: 'newsletter', title: t('Newsletter DPGR'),           sub: t('Recevoir les actualités et opportunités de la DPGR') },
              { key: 'mobile',     title: t('Notifications mobiles'),     sub: t('Activer les notifications push sur mobile') },
            ].map(({ key, title, sub }) => (
              <div key={key} className="mpe-notif-row">
                <div>
                  <p className="mpe-notif-title">{title}</p>
                  <p className="mpe-notif-sub">{sub}</p>
                </div>
                <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 7 */}
        <div className="mpe-section-card mpe-section-card--dark">
          <SectionHeader num={7} title={t("Sécurité & Mot de passe")} color="dark" />
          <div className="mpe-security-list">
            <SecurityRow
              icon={<IconLock />}
              title={t("Changer le mot de passe")}
              sub={t("Modifier votre mot de passe")}
              onClick={() => setChangingPassword(true)}
            />
            <SecurityRow
              icon={<IconMonitor />}
              title={t("Sessions actives")}
              sub={t("Gérer les appareils connectés")}
              onClick={() => setViewingSessions(true)}
            />
          </div>
        </div>

        {/* Footer */}
        {saveError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{saveError}</p>}
        <div className="mpe-footer">
          <button className="mpe-footer-cancel" onClick={onBack}>
            <IconX /> {t("Annuler les modifications")}
          </button>
          <button className="mpe-footer-reset" onClick={handleReset}>
            {t("Réinitialiser")}
          </button>
          <button className="mpe-footer-save" onClick={handleSave} disabled={saving}>
            <IconSave /> {saving ? t('Enregistrement...') : t('Enregistrer les modifications')}
          </button>
        </div>

      </main>
    </div>
  );
}
