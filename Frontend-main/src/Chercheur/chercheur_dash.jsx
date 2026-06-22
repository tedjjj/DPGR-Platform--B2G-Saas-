import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './chercheur_dash.css';
import SideBarDash from './SideBarDash';
import MesDemandes from './MesDemandes';
import NouvelleDemande from './NouvelleDemande';
import DetailsSejour from './DetailsSejour';
import MesRapports from './MesRapports';
import MonProfil from './MonProfil';
import DemandeDetails from './DemandeDetails';
import DocumentDeposit from './documentDeposit';
import AdditionalInfo from './AdditionalInfo';
import Document from './Document';
import Notifications from './Notifications';
import Messagerie from './Messagerie';
import { DemandeProvider, useDemande } from './DemandeContext';
import { 
  getProfil, 
  getStatistiquesDemandes, 
  getDemandesRecentes, 
  getNotifications, 
  getEcheancesProcheaines,
  getMesRapports
} from '../api/chercheur';
import { saveUserFeedback } from '../LandingPage/Data';

// Main dashboard page for the researcher, with quick actions, notifications, and a feedback form.

// Small UI icons used throughout the dashboard interface.
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const PlaneIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

const CalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const FileTextIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

const BarChartIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const HourglassIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12" />
    <path d="M6 22h12" />
    <path d="M8 2v6a4 4 0 0 0 2 3.46L12 13l2-1.54A4 4 0 0 0 16 8V2" />
    <path d="M16 22v-6a4 4 0 0 0-2-3.46L12 11l-2 1.54A4 4 0 0 0 8 16v6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9A9 9 0 0 1 21 6l2 4" />
    <path d="M20.49 15A9 9 0 0 1 3 18l-2-4" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Header section with the page title, language options, notifications button, and user avatar.
const Header = ({ onMenuOpen, title, setActive, userInitials, notifications }) => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    console.log('Language change to:', lng);
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="header-hamburger" onClick={onMenuOpen} aria-label="Open menu">
          <MenuIcon />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-actions">
        <div className="language-switcher">
          <button 
            className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`} 
            onClick={() => changeLanguage('en')}
          >
            ENG
          </button>
          <button 
            className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`} 
            onClick={() => changeLanguage('fr')}
          >
            FR
          </button>
          <button 
            className={`lang-btn ${i18n.language === 'ar' ? 'active' : ''}`} 
            onClick={() => changeLanguage('ar')}
          >
            ARA
          </button>
        </div>
        <button type="button" className="notif-btn" onClick={() => setActive('notifications')}>
          <BellIcon />
          <span className="notif-badge">{notifications.length}</span>
        </button>
        <button
          type="button"
          className="avatar avatar-btn"
          onClick={() => setActive('profil')}
        >
          {userInitials || 'DA'}
        </button>
      </div>
    </header>
  );
};


// Reusable title row for each dashboard section, optionally with an action button.
const SectionTitle = ({ children, action }) => (
  <div className="section-title-row">
    <div className="section-title-left">
      <span className="section-bar" />
      <h2 className="section-title">{children}</h2>
    </div>
    {action && (
      typeof action === 'string'
        ? <a href="#" className="section-action">{action} ›</a>
        : action
    )}
  </div>
);

// Helper for turning counts into human-readable labels, like "1 demande" or "2 demandes".
const formatCountLabel = (count, singular, plural = `${singular}s`) =>
  `${count} ${count > 1 ? plural : singular}`;

// Quick action cards that give the researcher fast access to important pages and totals.
const ActionsRapides = ({
  setActive,
  setSelectedDemande,
  demandeCount,
  pendingReportsCount,
  loading,
}) => {
  const { t } = useTranslation();
  return (
    <section>
      <SectionTitle>{t("Actions Rapides")}</SectionTitle>
      <div className="actions-grid">
        <ActionsRapidesNouvelleCard setActive={setActive} setSelectedDemande={setSelectedDemande} />
        <div className="action-card dark" onClick={() => setActive('demandes')} style={{ cursor: 'pointer' }}>
          <div className="action-icon"><FileTextIcon size={28} /></div>
          <div className="action-label">{t("Mes Demandes")}</div>
          <div className="action-sub highlight">
            {loading ? t('Chargement...') : formatCountLabel(demandeCount, t('demande'), t('demandes'))}
          </div>
        </div>
        <div className="action-card bordered-gold" onClick={() => setActive('rapports')} style={{ cursor: 'pointer' }}>
          <div className="action-icon"><BarChartIcon size={28} /></div>
          <div className="action-label">{t("Mes Rapports")}</div>
          <div className="action-sub warning">
            {loading ? t('Chargement...') : `${formatCountLabel(pendingReportsCount, t('rapport'), t('rapports'))} ${t('en attente')}`}
          </div>
        </div>
      </div>
    </section>
  );
};

// Special quick action card for creating a new request and resetting the current form state.
const ActionsRapidesNouvelleCard = ({ setActive, setSelectedDemande }) => {
  const { resetDemande } = useDemande();
  const { t } = useTranslation();

  return (
    <div
        className="action-card bordered-navy"
        onClick={() => {
          resetDemande();
          if (setSelectedDemande) setSelectedDemande(null);
          setActive('nouvelle');
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="action-icon"><PlusCircleIcon /></div>
        <div className="action-label">{t("Nouvelle Demande")}</div>
        <div className="action-sub">{t("Démarrer une demande de séjour")}</div>
      </div>
  );
};

// Stat card used in the dashboard overview section to display counts like pending or approved requests.
const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card" style={{ background: color }}>
    <div className="stat-top">
      <span className="stat-label">{label}</span>
      <span className="stat-bg-icon">{icon}</span>
    </div>
    <div className="stat-value">{value}</div>
  </div>
);

// Overview section summarizing request statuses in a compact tile layout.
const VueEnsemble = ({ stats, loading }) => {
  const { t } = useTranslation();
  return (
    <section>
      <SectionTitle>{t("Vue d'Ensemble")}</SectionTitle>
      <div className="stats-grid">
    <StatCard
    label={t("En attente")}
    value={loading ? '...' : stats.enAttente}
    color="linear-gradient(135deg, #D97706 0%, #F59E0B 100%)"
    icon={<HourglassIcon />}
  />
  <StatCard
    label={t("Approuvées")}
    value={loading ? '...' : stats.approuvees}
    color="linear-gradient(135deg, #16A34A 0%, #22C55E 100%)"
    icon={<CheckCircleIcon />}
  />
  <StatCard
    label={t("En cours")}
    value={loading ? '...' : stats.enCours}
    color="linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 100%)"
    icon={<RefreshIcon />}
  />
  <StatCard
    label={t("Total")}
    value={loading ? '...' : stats.total}
    color="linear-gradient(135deg, #64748B 0%, #475569 100%)"
    icon={<ClipboardIcon />}
  />
  
      </div>
    </section>
  );
};

// Recent requests section showing the latest demands with status badges and quick access.
const DemandesRecentes = ({ setActive, demandes, loading }) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <section>
        <SectionTitle>{t("Mes Demandes Récentes")}</SectionTitle>
        <p>{t("Chargement...")}</p>
      </section>
    );
  }

  if (!demandes || demandes.length === 0) {
    return (
      <section>
        <SectionTitle>{t("Mes Demandes Récentes")}</SectionTitle>
        <p>{t("Aucune demande trouvée")}</p>
      </section>
    );
  }

  const getStatutClass = (statut) => {
    if (statut === 'Approuvée' || statut === 'APPROUVEE') return 'approuvee';
    if (statut === 'Brouillon' || statut === 'BROUILLON') return 'brouillon';
    if (statut === 'En cours de vérification' || statut === 'VERIFICATION_AUTOMATIQUE' || statut === 'SOUMISE') return 'en-cours';
    if (statut === 'Rejetée' || statut === 'REJETE') return 'rejete';
    return 'en-cours';
  };

  const featured = demandes[0];
  const others = demandes.slice(1, 3);

  return (
    <section>
      <SectionTitle
        action={
          <button
            type="button"
            className="section-action-btn"
            onClick={() => setActive('demandes')}
          >
            {t("Voir toutes")} ›
          </button>
        }
      >
        {t("Mes Demandes Récentes")}
      </SectionTitle>
      <div className="demandes-grid">
        <div className="demande-featured">
          <span className={`badge-status ${getStatutClass(featured.statut)}`}>{featured.statut}</span>
          <div className="demande-icon-wrap"><PlaneIcon /></div>
          <h3 className="demande-title">{featured.destination} — {featured.ville}</h3>
          <p className="demande-meta">{featured.ville}, {featured.destination} • {featured.duree} {t("jours")}</p>
          <div className="demande-tags">
            <span className="dtag"><FileTextIcon /> {featured.duree} j</span>
            <span className="dtag"><HourglassIcon /> {featured.statut}</span>
          </div>
          <div className="demande-footer">
            <button className="btn-voir" onClick={() => setActive('demandes')}>{t("Voir détails")}</button>
          </div>
        </div>

        <div className="demandes-small">
          {others.map((demande) => (
            <div key={demande.id} className="demande-small-card">
              <div className="small-card-top">
                <span className="small-card-flag"><GlobeIcon /></span>
                <span className={`badge-status ${getStatutClass(demande.statut)}`}>{demande.statut}</span>
              </div>
              <div className="small-card-title">{demande.destination} — {demande.ville}</div>
              <div className="small-card-meta">{demande.dateDebut} → {demande.dateFin}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Bottom row of the dashboard with upcoming deadlines and latest notifications.
const BottomRow = ({ echeances, notifications, loading, setActive }) => {
  const { t } = useTranslation();
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const months = [
      t('Jan'), t('Fév'), t('Mar'), t('Avr'), t('Mai'), t('Juin'), 
      t('Juil'), t('Août'), t('Sep'), t('Oct'), t('Nov'), t('Déc')
    ];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  };

  const getColorDot = (color) => {
    // Map the backend color values to the small dot styles shown in the deadline list.
    const colorMap = {
      'green': 'green',
      'orange': 'orange',
      'blue': 'blue',
      'red': 'red'
    };
    return colorMap[color] || 'blue';
  };

  return (
    <div className="bottom-row">
      <div className="echeances-card">
        <div className="echeances-header">
          <h3>{t("Prochaines Échéances")}</h3>
          <CalIcon />
        </div>
        <ul className="echeances-list">
          {loading ? (
            <li><span className="dot blue" /><div>{t("Chargement...")}</div></li>
          ) : echeances && echeances.length > 0 ? (
            echeances.map((ech) => (
              <li key={ech.id}>
                <span className={`dot ${getColorDot(ech.color)}`} />
                <div>
                  <div className="ech-date">{formatDate(ech.date)}</div>
                  <div className="ech-label">{ech.label}</div>
                  {ech.type === 'rapport' && <div className="ech-urgent"><AlertTriangleIcon /> {t("Urgent")}</div>}
                </div>
              </li>
            ))
          ) : (
            <li><span className="dot blue" /><div>{t("Aucune échéance")}</div></li>
          )}
        </ul>
      </div>

      <div className="notifs-card">
        <div className="notifs-header">
          <h3>{t("Notifications")}</h3>
          <span className="notif-count">{notifications?.length || 0}</span>
        </div>
        {loading ? (
          <div className="notif-item"><div className="notif-msg">{t("Chargement...")}</div></div>
        ) : notifications && notifications.length > 0 ? (
        <>
            {notifications.slice(0, 3).map((notif) => (                
     <div key={notif.id} className="notif-item">
    <span className="notif-time">{notif.time || t('Récent')}</span>
    <div className="notif-icon-chip">
      {notif.icon === 'file'  && <FileTextIcon />}
      {notif.icon === 'alert' && <AlertTriangleIcon />}
      {notif.icon === 'check' && <CheckCircleIcon />}
      {(!notif.icon || notif.icon === 'plane') && <PlaneIcon />}
    </div>
    <span className="notif-msg">{notif.message}</span>
  </div>
))}
            {notifications.length > 3 && (
              <button className="btn-voir-toutes" onClick={() => setActive('notifications')}>
                  {t("Voir toutes")} →
              </button>
            )}
          </>
        ) : (
          <div className="notif-item"><div className="notif-msg">{t("Aucune notification")}</div></div>
        )}
      </div>
    </div>
  );
};

// Motivational banner encouraging researchers with summary stats and inspirational text.
const MotivationBanner = () => {
  const { t } = useTranslation();
  return (
    <div className="motivation-banner">
      <div className="motivation-content">
        <h3>{t("Votre mobilité scientifique compte!")}</h3>
        <p>{t("Chaque séjour est une opportunité d'apprendre, de collaborer et de faire rayonner l'ESI à l'international.")}</p>
        <div className="motivation-tags">
          <span><CalIcon /> 12 {t("séjours cette année")}</span>
          <span><GlobeIcon /> 8 {t("pays visités")}</span>
        </div>
      </div>
    </div>
  );
};

// Dashboard home page content that assembles the main cards, recent activity, deadlines, notifications, and feedback form.
const AccueilPage = ({
  setActive,
  setSelectedDemande,
  user,
  stats,
  demandes,
  echeances,
  notifications,
  pendingReportsCount,
  loading,
}) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = () => {
    // Only send feedback if the user typed something meaningful.
    if (feedback.trim()) {
      const stars = '★'.repeat(rating || 5) + '☆'.repeat(5 - (rating || 5));
      saveUserFeedback(feedback, {
        name: `${user?.prenom || ''} ${user?.nom || ''}`.trim(),
        grade: user?.profil?.grade?.nom
          || (typeof user?.profil?.grade === 'string' ? user.profil.grade : null)
          || user?.grade
          || 'Chercheur',
        univ: 'ESI',
        star: stars,
      });
      setSent(true);
      setFeedback('');
      setRating(0);
      setTimeout(() => setSent(false), 3000);
    }
  };

  return (
    <>
      <ActionsRapides
        setActive={setActive}
        setSelectedDemande={setSelectedDemande}
        demandeCount={stats.total}
        pendingReportsCount={pendingReportsCount}
        loading={loading}
      />
      <VueEnsemble stats={stats} loading={loading} />
      <DemandesRecentes setActive={setActive} demandes={demandes} loading={loading} />
      <BottomRow echeances={echeances} notifications={notifications} loading={loading} setActive={setActive} />
      <MotivationBanner />

      <div className="feedback-section">
        <div className="section-title-row">
          <div className="section-title-left">
            <span className="section-bar" />
            <h2 className="section-title feedback-title-with-icon">
              <MessageIcon /> {t("Votre Avis Nous Intéresse")}
            </h2>
          </div>
        </div>
        <p className="feedback-sub">
          {t("Aidez-nous à améliorer la plateforme DPGR ESI en partageant votre expérience")}
        </p>

        <div className="feedback-stars-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`feedback-star ${star <= (hovered || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          className="feedback-textarea"
          placeholder={t("Partagez vos suggestions, remarques ou problèmes rencontrés...")}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={5}
        />
        {sent && (
          <p className="feedback-success">
            <CheckCircleIcon /> {t("Merci pour votre retour !")}
          </p>
        )}
        <button className="feedback-btn" onClick={handleSubmit}>
          {t("Envoyer le feedback")}
        </button>
      </div>
    </>
  );
};

// Main dashboard component that manages page state, data loading, and navigation between sections.
const Dashboard = () => {
  const PROFILE_UPDATED_EVENT = 'chercheur-profile-updated';
  const { t } = useTranslation();
  const [active, setActive] = useState('accueil');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ enAttente: 0, approuvees: 0, enCours: 0, total: 0 });
  const [demandes, setDemandes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [echeances, setEcheances] = useState([]);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  const pageTitles = {
    accueil: t('Tableau de bord'),
    demandes: t('Mes Demandes'),
    nouvelle: t('Nouvelle Demande'),
    detailssejour: t('Détails du séjour'),
    documentDeposit: t('Dépôt de documents'),
    additionalInfo: t('Informations additionnelles'),
    document: t('Confirmation finale'),
    rapports: t('Mes Rapports'),
    profil: t('Mon Profil'),
    demandeDetails: t('Suivi de Demande'),
    notifications: t('Notifications'),
    messagerie: t('Messagerie'),
  };

  useEffect(() => {
    // Load all dashboard data once when the component mounts.
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profilData, statsData, demandesData, notifData, echeancesData, rapportsData] = await Promise.all([
          getProfil(),
          getStatistiquesDemandes(),
          getDemandesRecentes(),
          getNotifications(),
          getEcheancesProcheaines(),
          getMesRapports()
        ]);

        setUser(profilData);
        setStats(statsData);
        setDemandes(demandesData);
        setNotifications(notifData);
        setEcheances(echeancesData);
        setPendingReportsCount(Array.isArray(rapportsData?.pending) ? rapportsData.pending.length : 0);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(err.message || t("Une erreur est survenue lors du chargement des données."));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleProfileUpdated = async (event) => {
      if (event.detail) {
        setUser(event.detail);
        return;
      }

      try {
        const profilData = await getProfil();
        setUser(profilData);
      } catch (err) {
        console.error('Erreur lors de la mise a jour du profil:', err);
      }
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
  }, []);

  const userInitials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : null;

  return (
    <DemandeProvider>
      <div className="app">
        <SideBarDash
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          active={active}
          setActive={setActive}
          setSelectedDemande={setSelectedDemande}
        />
        <div className="main-wrapper">
          <Header
            onMenuOpen={() => setMobileOpen(true)}
            title={pageTitles[active] || t('Tableau de bord')}
            setActive={setActive}
            userInitials={userInitials}
            notifications={notifications}
          />

          <main className="main-content">
             {error && <div className="error-message" style={{color: 'red', padding: '10px', background: '#fee'}}>{t("Erreur")}: {error}</div>}
            {active === 'accueil' && (
              <AccueilPage 
                setActive={setActive}
                setSelectedDemande={setSelectedDemande}
                user={user}
                stats={stats}
                demandes={demandes}
                echeances={echeances}
                notifications={notifications}
                pendingReportsCount={pendingReportsCount}
                loading={loading}
              />
            )}
            {active === 'demandes' && (
              <MesDemandes
                setActive={setActive}
                setSelectedDemande={setSelectedDemande}
              />
            )}
            {active === 'demandeDetails' && (
              <DemandeDetails
                demande={selectedDemande}
                setActive={setActive}
              />
            )}
            {active === 'nouvelle' && <NouvelleDemande setActive={setActive} editDemande={selectedDemande} />}
            {active === 'detailssejour' && <DetailsSejour setActive={setActive} />}
            {active === 'documentDeposit' && <DocumentDeposit setActive={setActive} />}
            {active === 'additionalInfo' && <AdditionalInfo setActive={setActive} />}
            {active === 'document' && <Document setActive={setActive} />}
            {active === 'rapports' && <MesRapports setActive={setActive} />}
            {active === 'profil' && <MonProfil setActive={setActive} />}
            {active === 'notifications' && <Notifications setActive={setActive} />}
            {active === 'messagerie' && <Messagerie setActive={setActive} />}
          </main>
        </div>
      </div>
    </DemandeProvider>
  );
};

export default Dashboard;
