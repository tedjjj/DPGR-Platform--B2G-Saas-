import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './Notifications.css';
import {
  getAlertesNotifications,
  filterAlertesNotDismissed,
} from '../api/chercheur';

// ── Icons ──
const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.6 }}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.6 }}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
);

const typeToDisplayType = (type_alerte) => {
  if (type_alerte === 'CHANGEMENT_MOT_DE_PASSE') return 'warning';
  if (type_alerte === 'FERMETURE_SESSION') return 'warning';
  if (type_alerte === 'PREPARATION_CS') return 'warning';
  if (type_alerte === 'OUVERTURE_SESSION' || type_alerte === 'NOUVEAU_CHERCHEUR') return 'success';
  if (type_alerte === 'CHANGEMENT_STATUT' || type_alerte === 'DEMANDE_SOUMISE') return 'info';
  return 'info';
};

const typeToCategory = (type_alerte) => {
  const demandes = ['CHANGEMENT_STATUT', 'DEMANDE_SOUMISE', 'PREPARATION_CS'];
  if (demandes.includes(type_alerte)) return 'demandes';
  return 'systeme';
};

const formatDateTime = (dateStr, t) => {
  if (!dateStr) return { date: t('Date inconnue'), time: '' };
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { date: String(dateStr), time: '' };

  const day = date.getDate();
  const months = [
    t('Jan'), t('Fév'), t('Mar'), t('Avr'), t('Mai'), t('Juin'), 
    t('Juil'), t('Août'), t('Sep'), t('Oct'), t('Nov'), t('Déc')
  ];
  const datePart = `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;

  const timePart = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return { date: datePart, time: timePart };
};

const iconConfig = {
  warning:   { icon: <WarningIcon />, bg: '#f59e0b' },
  info:      { icon: <InfoIcon />,    bg: '#1e3a8a' },
  success:   { icon: <CheckIcon />,   bg: '#22c55e' },
  error:     { icon: <WarningIcon />, bg: '#ef4444' },
  rapport:   { icon: <WarningIcon />, bg: '#ef4444' },
  documents: { icon: <InfoIcon />,    bg: '#1e3a8a' },
  debut:     { icon: <InfoIcon />,    bg: '#22c55e' },
};

const accentColor = {
  warning: '#f59e0b', info: '#1e3a8a', success: '#22c55e',
  error: '#ef4444', rapport: '#ef4444', documents: '#1e3a8a', debut: '#22c55e',
};

const mapApiAlerte = (n, t) => {
  const displayType = typeToDisplayType(n.type_alerte);
  const { date, time } = formatDateTime(n.date_envoi, t);
  return {
    id: n.id,
    type: displayType,
    rawType: n.type_alerte,
    category: typeToCategory(n.type_alerte),
    title: n.titre || t('Notification'),
    body: n.message || '',
    date,
    time,
    dateEnvoi: n.date_envoi,
  };
};

const NotifItem = ({ notif }) => {
  const cfg = iconConfig[notif.type] || iconConfig.info;
  return (
    <div
      className="notif-item"
      data-color={notif.type}
      style={{ borderLeftColor: accentColor[notif.type] || '#e2e8f0' }}
    >
      <div className="notif-icon-wrap" style={{ background: cfg.bg }}>{cfg.icon}</div>
      <div className="notif-body">
        <span className="notif-title">{notif.title}</span>
        <p className="notif-text">{notif.body}</p>
        <div className="notif-footer">
          <div className="notif-datetime">
            <span className="notif-datetime-chip">
              <CalendarIcon />
              {notif.date}
            </span>
            {notif.time && (
              <span className="notif-datetime-chip">
                <ClockIcon />
                {notif.time}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Notifications = ({ setActive: _setActive }) => {
  const { t } = useTranslation();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setTab] = useState('toutes');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const raw = await getAlertesNotifications();
      const filtered = filterAlertesNotDismissed(raw);
      setNotifs(filtered.map(item => mapApiAlerte(item, t)));
    } catch (e) {
      setError(e?.message || t('Impossible de charger les notifications.'));
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const demandes = notifs.filter((n) => n.category === 'demandes');
  const systeme  = notifs.filter((n) => n.category === 'systeme');

  const displayed =
    activeTab === 'toutes'   ? notifs
    : activeTab === 'demandes' ? demandes
    : systeme;

  return (
    <div className="notifs-page">
      <div className="notifs-page-header">
        <div>
          <h2 className="notifs-page-title">{t("Centre de notifications")}</h2>
          <p className="notifs-page-sub">{notifs.length} {t("notification")}{notifs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error ? (
        <p className="notifs-inline-error" role="alert">{error}</p>
      ) : null}

      <div className="notifs-tabs">
        {[
          ['toutes',   notifs],
          ['demandes', demandes],
          ['systeme',  systeme],
        ].map(([key, arr]) => (
          <button
            key={key}
            type="button"
            className={`notifs-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {t(key.charAt(0).toUpperCase() + key.slice(1))} ({arr.length})
          </button>
        ))}
      </div>

      <div className="notifs-list">
        {loading ? (
          <p>{t("Chargement...")}</p>
        ) : displayed.length === 0 ? (
          <p style={{ color: '#94a3b8', padding: '20px 0' }}>{t("Aucune notification")}</p>
        ) : (
          displayed.map((n) => (
            <NotifItem key={n.id} notif={n} />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
