
// Side effect hook for handling data or state updates.
import { useEffect, useMemo, useState } from 'react';
import SideBarAdmin from './SideBarAdmin';
import './Notifications.css';
import { getActionHistory } from '../api/superAdmin';

const PAGE_SIZE = 20;

const IconActivity = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 8-6-16-3 8H2" />
  </svg>
);

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconFile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const TABS = [
  { id: 'toutes', label: 'Toutes', match: () => true },
  { id: 'logout', label: 'Deconnexions', match: (log) => log.action === 'LOGOUT' },
  { id: 'users', label: 'Utilisateurs', match: (log) => log.action.includes('UTILISATEUR') },
  { id: 'demandes', label: 'Demandes', match: (log) => log.action.includes('DEMANDE') || log.action.includes('DOCUMENT') },
  { id: 'sessions', label: 'Sessions', match: (log) => log.action.includes('SESSION') },
];

const ROLE_LABELS = {
  CHERCHEUR: 'Chercheur',
  ADMIN_DPGR: 'Admin DPGR',
  ASSISTANT_DPGR: 'Assistant DPGR',
  SUPER_ADMIN: 'Super Admin',
};

const ACTION_LABELS = {
  LOGIN: 'Connexion',
  LOGOUT: 'Deconnexion',
  CHANGE_PASSWORD: 'Changement du mot de passe',
  CREATION_DEMANDE: 'Creation demande',
  MODIFICATION_DEMANDE: 'Modification demande',
  SOUMISSION_DEMANDE: 'Soumission demande',
  APPROBATION_DEMANDE: 'Approbation demande',
  REJET_DEMANDE: 'Rejet demande',
  ANNULATION_DEMANDE: 'Annulation demande',
  AJOUT_DOCUMENT: 'Ajout document',
  SUPPRESSION_DOCUMENT: 'Suppression document',
  MODIFICATION_PROFIL: 'Modification profil',
  AJOUT_UTILISATEUR: 'Ajout utilisateur',
  MODIFICATION_UTILISATEUR: 'Modification utilisateur',
  SUPPRESSION_UTILISATEUR: 'Suppression utilisateur',
  AJOUT_PAYS: 'Ajout pays',
  AJOUT_SESSION: 'Ajout session',
  OUVERTURE_SESSION: 'Ouverture session',
  FERMETURE_SESSION: 'Fermeture session',
};

const getLogTone = (action) => {
  if (action === 'LOGOUT') return 'orange';
  if (action.includes('UTILISATEUR') || action.includes('PROFIL')) return 'navy';
  if (action.includes('DEMANDE') || action.includes('DOCUMENT')) return 'green';
  return 'gold';
};

const formatDate = (value) => {
  if (!value) return 'Date non disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

// Function: HistoryIcon.
function HistoryIcon({ action }) {
  if (action === 'LOGOUT') return <span className="nf-icon nf-icon--orange"><IconLogout /></span>;
  if (action.includes('UTILISATEUR') || action.includes('PROFIL')) {
    return <span className="nf-icon nf-icon--navy"><IconUser /></span>;
  }
  if (action.includes('DEMANDE') || action.includes('DOCUMENT')) {
    return <span className="nf-icon nf-icon--green"><IconFile /></span>;
  }
  return <span className="nf-icon nf-icon--gold"><IconActivity /></span>;
}

// Main component exported: Notifications.
export default function Notifications({ onNavigate }) {
// State management using React hooks.
  const [logs, setLogs] = useState([]);
// State management using React hooks.
  const [activeTab, setActiveTab] = useState('toutes');
// State management using React hooks.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState('');

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getActionHistory();
        setLogs(data);
      } catch (err) {
        setError(err.message || "Impossible de charger l'historique.");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filtered = useMemo(() => {
    const selectedTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
    return logs.filter(selectedTab.match);
  }, [activeTab, logs]);

  const visibleLogs = filtered.slice(0, visibleCount);
  const hasMoreLogs = visibleCount < filtered.length;
  const tabCount = (tab) => logs.filter(tab.match).length;
  const logoutCount = logs.filter((log) => log.action === 'LOGOUT').length;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setVisibleCount(PAGE_SIZE);
  };

// Render the component JSX.
  return (
    <SideBarAdmin title="Historique des actions" activeItem="notifications" onNavigate={onNavigate}>
      <main className="nf-body">
        <div className="nf-title-row">
          <div>
            <h2 className="nf-title">Historique des actions</h2>
            <p className="nf-sub">{logoutCount} deconnexions enregistrees</p>
          </div>
        </div>

        <div className="nf-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`nf-tab${activeTab === tab.id ? ' nf-tab--active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label} ({tabCount(tab)})
            </button>
          ))}
        </div>

        {error ? <p className="nf-feedback nf-feedback--error">{error}</p> : null}
        {loading ? <p className="nf-feedback">Chargement de l'historique...</p> : null}

        <div className="nf-list" aria-live="polite">
          {visibleLogs.map((log) => {
            const actionLabel = ACTION_LABELS[log.action] || log.action;
            const roleLabel = ROLE_LABELS[log.user_role] || log.user_role || 'Systeme';
            const userName = log.user_name || log.user_email || 'Systeme';

// Render the component JSX.
            return (
              <article key={log.id} className={`nf-item nf-item--${getLogTone(log.action)}`}>
                <HistoryIcon action={log.action} />
                <div className="nf-item-body">
                  <div className="nf-item-top">
                    <p className="nf-item-title">{userName}</p>
                    <span className="nf-role-pill">{roleLabel}</span>
                  </div>
                  <p className="nf-item-text">
                    <strong>{actionLabel}</strong>
                    <span>{log.details || 'Action enregistree sans details supplementaires.'}</span>
                  </p>
                  <div className="nf-item-footer">
                    <span className="nf-item-time">{formatDate(log.date_action)}</span>
                    {log.ip_address ? <span className="nf-ip">IP: {log.ip_address}</span> : null}
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && filtered.length === 0 ? (
            <div className="nf-empty">Aucune action dans cette categorie.</div>
          ) : null}
        </div>

        {hasMoreLogs ? (
          <button
            type="button"
            className="nf-load-more"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Afficher plus ({filtered.length - visibleCount} restantes)
          </button>
        ) : null}
      </main>
    </SideBarAdmin>
  );
}
