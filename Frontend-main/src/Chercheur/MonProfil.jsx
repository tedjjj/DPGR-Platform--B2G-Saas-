import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './MonProfil.css';
import ModifierProfil from './ModifierProfil';
import ChangerMotDePasse from './ChangerMotDePasse';
import { logoutUser } from '../auth';
import { getProfil } from '../api/chercheur';

const PROFILE_UPDATED_EVENT = 'chercheur-profile-updated';

const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconFile = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconKey = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const IconPlane = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
  </svg>
);

const IconReport = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);


const IconGrad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

function InfoRow({ label, value }) {
  return (
    <div className="mp-info-row">
      <span className="mp-info-label">{label}</span>
      <span className="mp-info-value">{value || 'Non defini'}</span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="mp-card">
      <h3 className="mp-card-title">{title}</h3>
      <div className="mp-card-divider" />
      {children}
    </div>
  );
}

const GRADE_MAP = {
  MCA: 'Maitre de Conferences - Classe A',
  MCB: 'Maitre de Conferences - Classe B',
  DOC: 'Doctorant',
};

const pickText = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return null;
};

const getGradeLabel = (user, profil) => {
  const gradeValue =
    user?.grade ||           
    profil?.grade ||        
    user?.profil?.grade ||  
    null;

  if (!gradeValue) return null;

  if (typeof gradeValue === 'string') return GRADE_MAP[gradeValue] || gradeValue;

  return pickText(
    gradeValue?.label,
    gradeValue?.libelle,
    gradeValue?.name,
    gradeValue?.nom,
    gradeValue?.code && (GRADE_MAP[gradeValue.code] || gradeValue.code)
  );
};

const getLaboratoireLabel = (user, profil) => {
  const laboratoire = profil?.laboratoire ?? user?.laboratoire;

  if (typeof laboratoire === 'string') return laboratoire;

  return pickText(
    user?.laboratoire,
    profil?.laboratory_name,
    profil?.laboratoire_name,
    laboratoire?.name,
    laboratoire?.nom,
    profil?.labo
  );
};

const getTelephoneLabel = (user, profil) => (
  pickText(user?.telephone, profil?.tel_mobile, profil?.tel_fixe, profil?.phone)
);

const getAncienneteLabel = (user, profil) => {
  const anciennete = profil?.anciennete ?? user?.anciennete;

  if (typeof anciennete === 'number') return `${anciennete} ans`;
  if (typeof anciennete === 'string' && anciennete.trim()) {
    return anciennete.includes('an') ? anciennete : `${anciennete} ans`;
  }
  return null;
};

const formatDate = (iso, t) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.getDate();
  const months = [
    t('Jan'), t('Fév'), t('Mar'), t('Avr'), t('Mai'), t('Juin'), 
    t('Juil'), t('Août'), t('Sep'), t('Oct'), t('Nov'), t('Déc')
  ];
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default function MonProfil() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showDocs, setShowDocs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [profil, setProfil] = useState(null);


const loadProfile = useCallback(async (payload = null) => {
  try {
    const data = payload || await getProfil();
    setUser(data || null);
    setProfil(data?.profil || null);
    return data;
  } catch (error) {
    console.error('Erreur chargement profil:', error);
    return null;
  }
}, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const handleProfileUpdated = (event) => {
      loadProfile(event.detail || null);
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
  }, [loadProfile]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  const fullName = [user?.nom, user?.prenom].filter(Boolean).join(' ').trim();
  const gradeLabel = getGradeLabel(user, profil);
  const laboratoireLabel = getLaboratoireLabel(user, profil);
  const telephoneLabel = getTelephoneLabel(user, profil);
  const ancienneteLabel = getAncienneteLabel(user, profil);
  const emailPersonnel = pickText(profil?.email_personnel, user?.email);
  const nationalite = pickText(profil?.nationalite);
  const equipeRecherche = pickText(profil?.equipe_recherche);
  const bureau = pickText(profil?.bureau);
  const adresse = pickText(profil?.adresse);
  const domainePrincipal = pickText(profil?.domaine_principal);
  const nombreSejours = profil?.nombre_sejours_effectues ?? user?.nombre_sejours_effectues ?? 0;
  const totalJoursSejour = profil?.total_jours_sejour ?? user?.total_jours_sejour ?? 0;
  const dernierSejour = formatDate(profil?.dernier_sejour, t);

  const stats = [
    { icon: <IconPlane />, label: t('Sejours effectues'), value: nombreSejours, color: 'blue' },
    { icon: <IconReport />, label: t('Total jours sejour'), value: totalJoursSejour, color: 'green' },
    { icon: <IconGrad />, label: t('Anciennete'), value: ancienneteLabel || t('0 ans'), color: 'purple' },
  ];

  const initiales = user?.nom && user?.prenom ? `${user.nom[0]}${user.prenom[0]}` : '..';

  if (changingPassword) return <ChangerMotDePasse onBack={() => setChangingPassword(false)} />;
  if (editing) {
    return (
      <ModifierProfil
        onBack={() => setEditing(false)}
        onSaved={(updatedData) => {
          if (updatedData) {
            setUser(updatedData);
            setProfil(updatedData.profil || null);
          } else {
            loadProfile();
          }
          setEditing(false);
        }}
      />
    );
  }

  return (
    <main className="mp-page-body">
      <div className="mp-hero">
        <div className="mp-hero-left">
          <div className="mp-avatar-wrap">
            <div className="mp-avatar">{initiales}</div>
          </div>
          <div className="mp-hero-info">
            <h2 className="mp-hero-name">{fullName || '...'}</h2>
            <p className="mp-hero-title">{gradeLabel || t('Portail Chercheur')}</p>
            <div className="mp-hero-contacts">
              <span className="mp-hero-contact"><IconMail /> {user?.email || '...'}</span>
            </div>
          </div>
        </div>

        <div className="mp-hero-actions">
          <button className="mp-edit-btn" onClick={() => setEditing(true)}>
            <IconEdit /> {t("Modifier le profil")}
          </button>
          <button className="mp-logout-btn" onClick={handleLogout}>
            <IconLogout /> {t("Se déconnecter")}
          </button>
        </div>
      </div>

      <div className="mp-layout">
        <div className="mp-left">
          <Card title={t("Informations personnelles")}>
            <InfoRow label={t("Nom complet")} value={fullName || '...'} />
            <InfoRow label={t("Email")} value={user?.email} />
            <InfoRow label={t("Email personnel")} value={emailPersonnel} />
            <InfoRow label={t("Téléphone mobile")} value={telephoneLabel} />
            <InfoRow label={t("Nationalité")} value={nationalite} />
          </Card>

          <Card title={t("Informations professionnelles")}>
            <InfoRow label={t("Grade")} value={gradeLabel} />
            <InfoRow label={t("Laboratoire")} value={laboratoireLabel} />
            <InfoRow label={t("Equipe de recherche")} value={equipeRecherche} />
            <InfoRow label={t("Bureau")} value={bureau} />
            <InfoRow label={t("Adresse")} value={adresse} />
            <InfoRow label={t("Domaine principal")} value={domainePrincipal} />
            <InfoRow label={t("Anciennete")} value={ancienneteLabel} />
          </Card>
          
          <Card title={t("Historique des séjours")}>
            <InfoRow label={t("Nombre séjours effectués")} value={String(nombreSejours)} />
            <InfoRow label={t("Date du dernier séjour")} value={dernierSejour} />
          </Card>
          
        </div>

        <div className="mp-right">
          <div className="mp-card">
            <h3 className="mp-card-title">{t("Statistiques")}</h3>
            <div className="mp-stats">
              {stats.map(({ icon, label, value, color }) => (
                <div key={label} className="mp-stat-row">
                  <span className={`mp-stat-icon mp-stat-icon--${color}`}>{icon}</span>
                  <span className="mp-stat-label">{label}</span>
                  <span className="mp-stat-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mp-card">
            <h3 className="mp-card-title">{t("Documents")}</h3>
            <div className="mp-docs">
              {showDocs.map((doc, i) => (
                <div key={i} className="mp-doc-row">
                  <span className="mp-doc-icon"><IconFile /></span>
                  <span className="mp-doc-name">{doc.name}</span>
                </div>
              ))}
              <input
                type="file"
                id="mp-file-input"
                hidden
                multiple
                onChange={(e) => setShowDocs((prev) => [...prev, ...Array.from(e.target.files)])}
              />
              <button className="mp-add-doc-btn" onClick={() => document.getElementById('mp-file-input').click()}>
                <IconPlus /> {t("Ajouter un document")}
              </button>
            </div>
          </div>

          <div className="mp-compte-card">
            <h3 className="mp-compte-title">{t("Compte")}</h3>
            <div className="mp-compte-rows">
              <div className="mp-compte-row">
                <span className="mp-compte-label">{t("Date d'inscription")}:</span>
                <span className="mp-compte-value">{formatDate(user?.date_joined, t) || t('Non defini')}</span>
              </div>
              <div className="mp-compte-row">
                <span className="mp-compte-label">{t("statut")}:</span>
                <span className="mp-compte-statut">{user?.is_active ? `● ${t('Actif')}` : `● ${t('Inactif')}`}</span>
              </div>
            </div>
            <button className="mp-pwd-btn" onClick={() => setChangingPassword(true)}>
              <IconKey /> {t("Changer mot de passe")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
