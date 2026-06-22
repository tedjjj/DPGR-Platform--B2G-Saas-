import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SessionsActives.css';

/* ── Icons ── */
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconMonitor = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconTablet = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const IconLocation = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconIP = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

function DeviceIcon({ type }) {
  return type === 'tablet' ? <IconTablet /> : <IconMonitor />;
}

function SessionCard({ session, onDisconnect, isOther, t }) {
  return (
    <div className={`sa-session-card${isOther ? '' : ' sa-session-card--current'}`}>
      <div className="sa-session-left">
        <div className={`sa-device-icon${isOther ? '' : ' sa-device-icon--current'}`}>
          <DeviceIcon type={session.icon} />
        </div>
        <div className="sa-session-info">
          <div className="sa-session-top">
            <p className="sa-device-name">{session.device}</p>
            {!isOther && <span className="sa-current-badge">{t("Session actuelle")}</span>}
            {isOther && (
              <button className="sa-disconnect-btn" onClick={() => onDisconnect(session.id)}>
                {t("Déconnecter")}
              </button>
            )}
          </div>
          <div className="sa-session-meta">
            <span className="sa-meta-item"><IconLocation /> <span><span className="sa-meta-label">{t("Localisation")}</span><br/>{session.location}</span></span>
            <span className="sa-meta-item"><IconIP /> <span><span className="sa-meta-label">{t("Adresse IP")}</span><br/>{session.ip}</span></span>
            <span className="sa-meta-item"><IconClock /> <span><span className="sa-meta-label">{t("Activité")}</span><br/>{session.activity}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionsActives({ onBack }) {
  const { t } = useTranslation();
  
  const CURRENT_SESSION = {
    id: 0,
    device: 'Windows - Google Chrome',
    icon: 'monitor',
    location: t('Alger, Algérie'),
    ip: '41.102.123.45',
    activity: t('Maintenant'),
  };

  const INITIAL_OTHER_SESSIONS = [
    { id: 1, device: 'MacOS - Safari',          icon: 'monitor', location: t('Oran, Algérie'),        ip: '41.105.89.123',  activity: t('Il y a 2 heures') },
    { id: 2, device: 'Android - Chrome Mobile', icon: 'tablet',  location: t('Alger, Algérie'),       ip: '41.102.134.67',  activity: t('Il y a 5 heures') },
    { id: 3, device: 'iPad - Safari Mobile',    icon: 'tablet',  location: t('Constantine, Algérie'),  ip: '41.108.45.89',   activity: t('Il y a 1 jour')   },
  ];

  const [sessions, setSessions] = useState(INITIAL_OTHER_SESSIONS);
  const [disconnectedAll, setDisconnectedAll] = useState(false);

  const handleDisconnect = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleDisconnectAll = () => {
    setSessions([]);
    setDisconnectedAll(true);
  };

  return (
    <div className="sa-overlay">
      <div className="sa-card">

        {/* Header */}
        <div className="sa-header">
          <div className="sa-shield-icon"><IconShield /></div>
          <h2 className="sa-title">{t("Sessions actives")}</h2>
          <p className="sa-sub">{t("Gérez vos appareils connectés")}</p>
        </div>

        {/* Current session */}
        <div className="sa-section">
          <div className="sa-section-label">
            <span className="sa-section-label-dot"><IconCheck /></span>
            <div>
              <p className="sa-section-label-title">{t("Session actuelle")}</p>
              <p className="sa-section-label-sub">{t("Cet appareil")}</p>
            </div>
          </div>
          <SessionCard session={CURRENT_SESSION} isOther={false} t={t} />
        </div>

        {/* Other sessions */}
        <div className="sa-section">
          <div className="sa-other-header">
            <div>
              <p className="sa-section-label-title">{t("Autres sessions")}</p>
              <p className="sa-section-label-sub">{sessions.length} {t("appareil")}{sessions.length !== 1 ? 's' : ''} {t("connecté")}{sessions.length !== 1 ? 's' : ''}</p>
            </div>
            {sessions.length > 0 && (
              <button className="sa-disconnect-all-btn" onClick={handleDisconnectAll}>
                {t("Tout déconnecter")}
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="sa-empty">
              {disconnectedAll
                ? t('Tous les autres appareils ont été déconnectés.')
                : t('Aucun autre appareil connecté.')}
            </div>
          ) : (
            sessions.map(s => (
              <SessionCard key={s.id} session={s} isOther onDisconnect={handleDisconnect} t={t} />
            ))
          )}
        </div>

        {/* Footer */}
        <button className="sa-back-btn" onClick={onBack}>← {t("Retour")}</button>

      </div>
    </div>
  );
}
