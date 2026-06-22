
// Side effect hook for handling data or state updates.
import React, { useEffect, useState } from 'react';
import './Notifications.css';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/assistant';

// Small UI icon used in the interface.
const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

// Small UI icon used in the interface.
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

// Small UI icon used in the interface.
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Small UI icon used in the interface.
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const iconConfig = {
  CHANGEMENT_STATUT: { icon: <CheckIcon />, bg: '#22c55e', accent: '#22c55e', category: 'demandes' },
  DEMANDE_SOUMISE: { icon: <InfoIcon />, bg: '#1e3a8a', accent: '#1e3a8a', category: 'demandes' },
  PREPARATION_CS: { icon: <WarningIcon />, bg: '#f59e0b', accent: '#f59e0b', category: 'demandes' },
  OUVERTURE_SESSION: { icon: <CheckIcon />, bg: '#22c55e', accent: '#22c55e', category: 'sessions' },
  FERMETURE_SESSION: { icon: <WarningIcon />, bg: '#f59e0b', accent: '#f59e0b', category: 'sessions' },
  CHANGEMENT_MOT_DE_PASSE: { icon: <WarningIcon />, bg: '#f59e0b', accent: '#f59e0b', category: 'systeme' },
  NOUVEAU_CHERCHEUR: { icon: <InfoIcon />, bg: '#1e3a8a', accent: '#1e3a8a', category: 'systeme' },
};

const getNotifMeta = (typeAlerte) => iconConfig[typeAlerte] || {
  icon: <InfoIcon />,
  bg: '#1e3a8a',
  accent: '#1e3a8a',
  category: 'systeme',
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return { relative: 'Recent', absolute: '' };
  const date = new Date(isoString);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  let relative;
  if (mins < 1) relative = "A l'instant";
  else if (mins < 60) relative = `Il y a ${mins} min`;
  else if (hours < 24) relative = `Il y a ${hours} h`;
  else if (days < 7) relative = `Il y a ${days} j`;
  else relative = date.toLocaleDateString('fr-FR');

  const absolute = date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return { relative, absolute };
};

// React component: NotifItem.
const NotifItem = ({ notif, onMarkRead, onDelete }) => {
  const cfg = getNotifMeta(notif.type_alerte);

// Render the component JSX.
  return (
    <div
      className={`notif-item ${notif.est_lue ? 'read' : 'unread'}`}
      data-color={notif.type_alerte}
      style={{ borderLeftColor: cfg.accent }}
    >
      <div className="notif-icon-wrap" style={{ background: cfg.bg }}>
        {cfg.icon}
      </div>
      <div className="notif-body">
        <span className="notif-title">{notif.titre}</span>
        {!notif.est_lue && <span className="notif-dot" />}
        <p className="notif-text">{notif.message}</p>
        <div className="notif-footer">
          <div className="notif-time-wrap">
            <span className="notif-time">{formatRelativeTime(notif.date_envoi).relative}</span>
            <span className="notif-time-absolute">{formatRelativeTime(notif.date_envoi).absolute}</span>
          </div>
          <div className="notif-actions">
            {!notif.est_lue && (
              <button className="notif-action-btn mark" onClick={() => onMarkRead(notif.id)}>
                <CheckIcon /> Marquer comme lu
              </button>
            )}
            <button className="notif-action-btn delete" onClick={() => onDelete(notif.id)}>
              <span style={{ fontSize: '13px', lineHeight: 1 }}>x</span> Masquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// React component: Notifications.
const Notifications = ({ setActive, onUnreadChange }) => {
// State management using React hooks.
  const [notifs, setNotifs] = useState([]);
// State management using React hooks.
  const [activeTab, setTab] = useState('toutes');
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState('');

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getNotifications();
        setNotifs(data);
      } catch (err) {
        setError(err.message || 'Impossible de charger les notifications.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (typeof onUnreadChange === 'function') {
      onUnreadChange(notifs.filter((notif) => !notif.est_lue).length);
    }
  }, [notifs, onUnreadChange]);

  const unread = notifs.filter((n) => !n.est_lue).length;
  const demandes = notifs.filter((n) => getNotifMeta(n.type_alerte).category === 'demandes');
  const sessions = notifs.filter((n) => getNotifMeta(n.type_alerte).category === 'sessions');
  const systeme = notifs.filter((n) => getNotifMeta(n.type_alerte).category === 'systeme');

  const displayed =
    activeTab === 'toutes' ? notifs
      : activeTab === 'demandes' ? demandes
        : activeTab === 'sessions' ? sessions
          : systeme;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifs((prev) => prev.map((notif) => (
        notif.id === id ? { ...notif, est_lue: true } : notif
      )));
    } catch (err) {
      setError(err.message || 'Impossible de marquer la notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifs((prev) => prev.map((notif) => ({ ...notif, est_lue: true })));
    } catch (err) {
      setError(err.message || 'Impossible de marquer toutes les notifications.');
    }
  };

// Render the component JSX.
  return (
    <div className="notifs-page">
      <div className="notifs-page-header">
        <div>
          <h2 className="notifs-page-title">Centre de notifications</h2>
          <p className="notifs-page-sub">{unread} notifications non lues</p>
        </div>
        <div className="notifs-header-actions">
          <button className="notifs-mark-all" onClick={handleMarkAllRead}>
            Tout marquer comme lu
          </button>
          <button
            className="notifs-settings-btn"
            onClick={() => setActive('settings')}>
            <SettingsIcon /> Parametres
          </button>
        </div>
      </div>

      <div className="notifs-tabs">
        <button className={`notifs-tab ${activeTab === 'toutes' ? 'active' : ''}`} onClick={() => setTab('toutes')}>
          Toutes ({notifs.length})
        </button>
        <button className={`notifs-tab ${activeTab === 'demandes' ? 'active' : ''}`} onClick={() => setTab('demandes')}>
          Demandes ({demandes.length})
        </button>
        <button className={`notifs-tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setTab('sessions')}>
          Sessions ({sessions.length})
        </button>
        <button className={`notifs-tab ${activeTab === 'systeme' ? 'active' : ''}`} onClick={() => setTab('systeme')}>
          Systeme ({systeme.length})
        </button>
      </div>

      <div className="notifs-list">
        {error ? <p style={{ color: '#dc2626', padding: '8px 0' }}>{error}</p> : null}
        {loading ? <p>Chargement...</p> : displayed.length === 0
          ? <p style={{ color: '#94a3b8', padding: '20px 0' }}>Aucune notification</p>
          : displayed.map((n) => (
            <NotifItem
              key={n.id}
              notif={n}
              onMarkRead={handleMarkRead}
              onDelete={(id) => setNotifs((prev) => prev.filter((notif) => notif.id !== id))}
            />
          ))
        }
      </div>
    </div>
  );
};

export default Notifications;
