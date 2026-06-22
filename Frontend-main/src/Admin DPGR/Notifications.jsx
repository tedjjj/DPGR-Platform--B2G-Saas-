
// Side effect hook for handling data or state updates.
import { useState, useEffect } from 'react';
import AdminSideBar from './AdminSideBar';
import { notifications as notifAPI } from '../api/AdminDPGR';
import './Notifications.css';

/* ── Icons ── */
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconInfo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

/* ── Type → couleur ── */
const typeToColor = (type_alerte) => {
  const map = {
    'CHANGEMENT_STATUT':     'navy',
    'DEMANDE_SOUMISE':       'navy',
    'PREPARATION_CS':        'orange',
    'CHANGEMENT_MOT_DE_PASSE': 'orange',
    'OUVERTURE_SESSION':     'green',
    'FERMETURE_SESSION':     'orange',
    'NOUVEAU_CHERCHEUR':     'green',
  };
  return map[type_alerte] || 'navy';
};

/* ── Type → icône ── */
// Function: NotifIcon.
function NotifIcon({ type_alerte }) {
  const color = typeToColor(type_alerte);
  if (color === 'orange') return <span className="nf-icon nf-icon--orange"><IconAlert /></span>;
  if (color === 'green')  return <span className="nf-icon nf-icon--green"><IconCheckCircle /></span>;
  return <span className="nf-icon nf-icon--navy"><IconInfo /></span>;
}

/* ── Catégorie pour les tabs ── */
const typeToCategory = (type_alerte) => {
  const demandes = ['CHANGEMENT_STATUT', 'DEMANDE_SOUMISE', 'PREPARATION_CS'];
  const sessions = ['OUVERTURE_SESSION', 'FERMETURE_SESSION'];
  if (demandes.includes(type_alerte)) return 'demandes';
  if (sessions.includes(type_alerte)) return 'sessions';
  return 'systeme';
};

const TABS = [
  { id: 'toutes',   label: 'Toutes',   filter: null       },
  { id: 'demandes', label: 'Demandes', filter: 'demandes' },
  { id: 'sessions', label: 'Sessions', filter: 'sessions' },
  { id: 'systeme',  label: 'Système',  filter: 'systeme'  },
];

/* ── Formatage date ── */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 60)  return `Il y a ${mins} minute${mins > 1 ? 's' : ''}`;
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (days < 7)   return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR');
};

// Main component exported: Notifications.
export default function Notifications({ onNavigate }) {
// State management using React hooks.
  const [notifs, setNotifs]       = useState([]);
// State management using React hooks.
  const [loading, setLoading]     = useState(true);
// State management using React hooks.
  const [activeTab, setActiveTab] = useState('toutes');

  /* ── Fetch ── */
// Side effect hook for handling data or state updates.
  useEffect(() => {
    notifAPI.list()
      .then(data => setNotifs(Array.isArray(data) ? data : (data?.results || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifs.filter(n => !n.est_lue).length;

  /* ── Filtrage par tab ── */
  const filtered = activeTab === 'toutes'
    ? notifs
    : notifs.filter(n => typeToCategory(n.type_alerte) === activeTab);

  const tabCount = (filter) => filter
    ? notifs.filter(n => typeToCategory(n.type_alerte) === filter).length
    : notifs.length;

  /* ── Actions ── */
  const markRead = async (id) => {
    await notifAPI.markRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, est_lue: true } : n));
  };

  const markAllRead = async () => {
    await notifAPI.markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, est_lue: true })));
  };

  const remove = (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

// Render the component JSX.
  return (
    <div className="nf-shell">
      <AdminSideBar activePage="notifications" onNavigate={onNavigate} />

      <div className="nf-main">
        {/* Header */}
        <header className="nf-header">
          <h1 className="nf-header-title">Notifications</h1>
          <div className="nf-header-right">
            <button className="nf-notif-btn">
              <IconBell />
              {unreadCount > 0 && <span className="nf-notif-badge">{unreadCount}</span>}
            </button>
            <div className="nf-avatar">FA</div>
          </div>
        </header>

        <main className="nf-body">

          {/* Title row */}
          <div className="nf-title-row">
            <div>
              <h2 className="nf-title">Centre de notifications</h2>
              <p className="nf-sub">{unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="nf-title-actions">
              <button className="nf-mark-all-btn" onClick={markAllRead}>
                Tout marquer comme lu
              </button>
              <button className="nf-params-btn" onClick={() => onNavigate && onNavigate('parametres')}>
                <IconSettings /> Paramètres
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="nf-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`nf-tab${activeTab === tab.id ? ' nf-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({tabCount(tab.filter)})
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="nf-empty">Chargement...</div>
          ) : (
            <div className="nf-list">
              {filtered.map(n => (
                <div
                  key={n.id}
                  className={`nf-item nf-item--${typeToColor(n.type_alerte)}${n.est_lue ? ' nf-item--read' : ''}`}
                >
                  <NotifIcon type_alerte={n.type_alerte} />
                  <div className="nf-item-body">
                    <div className="nf-item-top">
                      <p className="nf-item-title">{n.titre}</p>
                      {!n.est_lue && <span className="nf-unread-dot" />}
                    </div>
                    <p className="nf-item-text">{n.message}</p>
                    <div className="nf-item-footer">
                      <span className="nf-item-time">{formatDate(n.date_envoi)}</span>
                      <div className="nf-item-actions">
                        {!n.est_lue && (
                          <button className="nf-mark-btn" onClick={() => markRead(n.id)}>
                            <IconCheck /> Marquer comme lu
                          </button>
                        )}
                        <button className="nf-delete-btn" onClick={() => remove(n.id)}>
                          <IconX /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="nf-empty">Aucune notification dans cette catégorie.</div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
