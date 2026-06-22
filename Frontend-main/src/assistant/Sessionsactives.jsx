
// Side effect hook for handling data or state updates.
import React, { useState, useEffect, useCallback } from 'react';
import './Securite.css';
import { getActiveSessions, revokeSession, revokeAllOtherSessions } from '../api/assistant';

// ── Icons ──
const ShieldIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
);
// Small UI icon used in the interface.
const MonitorIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
  </svg>
);
// Small UI icon used in the interface.
const TabletIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 14c-.83 0-1.5-.67-1.5-1.5S11.17 15 12 15s1.5.67 1.5 1.5S12.83 18 12 18zm9-4H3V6h18v8z"/>
  </svg>
);
// Small UI icon used in the interface.
const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
  </svg>
);
// Small UI icon used in the interface.
const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);
// Small UI icon used in the interface.
const IpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
  </svg>
);
// Small UI icon used in the interface.
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
);
// Small UI icon used in the interface.
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);
// Small UI icon used in the interface.
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);

// ── Helpers ──
const getIcon = (device = '') => {
  if (device.includes('iPad') || device.includes('Tablet')) return <TabletIcon />;
  if (device.includes('Android') || device.includes('Mobile') || device.includes('iPhone')) return <PhoneIcon />;
  return <MonitorIcon />;
};

/**
 * Normalises a session object coming from the backend.
 * The backend may return different field names depending on the
 * endpoint implementation. We map to the shape the UI expects.
 *
 * Expected backend fields (adapt as needed once the real endpoint is live):
 *   id, device_name, location, ip_address, last_activity, is_current
 */
const normaliseSession = (raw) => ({
  id:       raw.id,
  device:   raw.device_name   ?? raw.device   ?? 'Appareil inconnu',
  location: raw.location      ?? '—',
  ip:       raw.ip_address    ?? raw.ip        ?? '—',
  activity: raw.last_activity ?? raw.activity  ?? '—',
  current:  raw.is_current    ?? raw.current   ?? false,
});

// ── Fallback mock data (used when the API endpoint is not yet available) ──
const MOCK_SESSIONS = [
  { id: 1, device: 'Windows - Google Chrome',  location: 'Alger, Algérie',      ip: '41.102.123.45', activity: 'Maintenant',    current: true  },
  { id: 2, device: 'MacOS - Safari',            location: 'Oran, Algérie',       ip: '41.105.89.123', activity: 'Il y a 2 heures', current: false },
  { id: 3, device: 'Android - Chrome Mobile',   location: 'Alger, Algérie',      ip: '41.102.134.67', activity: 'Il y a 5 heures', current: false },
  { id: 4, device: 'iPad - Safari Mobile',       location: 'Constantine, Algérie', ip: '41.108.45.89',  activity: 'Il y a 1 jour',  current: false },
];

// ── Session card ──
// React component: SessionCard.
const SessionCard = ({ session, onDisconnect, disconnecting }) => (
  <div className={`sess-card ${session.current ? 'current' : ''}`}>
    <div className="sess-card-icon">{getIcon(session.device)}</div>
    <div className="sess-card-body">
      <div className="sess-card-top">
        <span className="sess-device">{session.device}</span>
        {session.current ? (
          <span className="sess-current-badge">Session actuelle</span>
        ) : (
          <button
            className="sess-disconnect-btn"
            onClick={() => onDisconnect(session.id)}
            disabled={disconnecting}
          >
            {disconnecting ? '…' : 'Déconnecter'}
          </button>
        )}
      </div>
      <div className="sess-meta">
        <span className="sess-meta-item">
          <PinIcon />
          <div>
            <span className="sess-meta-label">Localisation</span>
            <span className="sess-meta-val">{session.location}</span>
          </div>
        </span>
        <span className="sess-meta-item">
          <IpIcon />
          <div>
            <span className="sess-meta-label">Adresse IP</span>
            <span className="sess-meta-val">{session.ip}</span>
          </div>
        </span>
        <span className="sess-meta-item">
          <ClockIcon />
          <div>
            <span className="sess-meta-label">Activité</span>
            <span className="sess-meta-val">{session.activity}</span>
          </div>
        </span>
      </div>
    </div>
  </div>
);

// ── Main Component ──
// React component: SessionsActives.
const SessionsActives = ({ onBack }) => {
// State management using React hooks.
  const [sessions,        setSessions]        = useState([]);
// State management using React hooks.
  const [loading,         setLoading]         = useState(true);
// State management using React hooks.
  const [fetchError,      setFetchError]      = useState('');
// State management using React hooks.
  const [allDisconnected, setAllDisc]         = useState(false);
// State management using React hooks.
  const [disconnecting,   setDisconnecting]   = useState(false);
// State management using React hooks.
  const [usingMock,       setUsingMock]       = useState(false);

  // ── Fetch sessions on mount ──
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await getActiveSessions();
      // Backend returns an array (possibly paginated — handle both)
      const raw = Array.isArray(data) ? data : (data?.results ?? []);
      setSessions(raw.map(normaliseSession));
      setUsingMock(false);
    } catch (err) {
      // Endpoint not yet implemented (404) or other error → fall back to mock
      if (err?.status === 404 || err?.status === 405) {
        setSessions(MOCK_SESSIONS);
        setUsingMock(true);
      } else {
        setFetchError('Impossible de charger les sessions. Veuillez réessayer.');
        setSessions(MOCK_SESSIONS);
        setUsingMock(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

// Side effect hook for handling data or state updates.
  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // ── Disconnect single session ──
  const disconnect = async (id) => {
    setDisconnecting(true);
    try {
      if (!usingMock) await revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch {
      setFetchError('Impossible de déconnecter cet appareil.');
    } finally {
      setDisconnecting(false);
    }
  };

  // ── Disconnect all other sessions ──
  const disconnectAll = async () => {
    setDisconnecting(true);
    try {
      if (!usingMock) await revokeAllOtherSessions();
      setSessions(prev => prev.filter(s => s.current));
      setAllDisc(true);
      setTimeout(() => setAllDisc(false), 3000);
    } catch {
      setFetchError('Impossible de déconnecter tous les appareils.');
    } finally {
      setDisconnecting(false);
    }
  };

  const current = sessions.find(s => s.current);
  const others  = sessions.filter(s => !s.current);

// Render the component JSX.
  return (
    <div className="sec-page">
      <button className="sec-back-btn" onClick={onBack} disabled={loading || disconnecting}>
        <BackIcon /> Retour aux paramètres
      </button>

      <div className="sec-card">
        {/* Header */}
        <div className="sec-page-header">
          <div className="sec-page-icon sec-page-icon-shield"><ShieldIcon /></div>
          <h2 className="sec-page-title">Sessions actives</h2>
          <p className="sec-page-sub">Gérez vos appareils connectés</p>
        </div>

        {/* Developer notice when falling back to mock data */}
        {usingMock && (
          <p className="sec-hint" style={{ textAlign: 'center', marginBottom: '12px' }}>
            ⚙️ Données de démonstration — l'endpoint sessions n'est pas encore disponible.
          </p>
        )}

        {/* Loading state */}
        {loading && (
          <p style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>
            Chargement des sessions…
          </p>
        )}

        {/* Fetch error */}
        {fetchError && <p className="sec-error">{fetchError}</p>}

        {/* Current session */}
        {!loading && (
          <div className="sess-section">
            <div className="sess-section-header">
              <div className="sess-section-title-wrap">
                <span className="sess-section-check"><CheckIcon /></span>
                <div>
                  <div className="sess-section-title">Session actuelle</div>
                  <div className="sess-section-sub">Cet appareil</div>
                </div>
              </div>
            </div>
            {current
              ? <SessionCard session={current} onDisconnect={disconnect} disconnecting={disconnecting} />
              : <p className="sec-hint">Session actuelle non identifiée.</p>
            }
          </div>
        )}

        {/* Other sessions */}
        {!loading && others.length > 0 && (
          <div className="sess-section">
            <div className="sess-section-header">
              <div>
                <div className="sess-section-title">Autres sessions</div>
                <div className="sess-section-sub">
                  {others.length} appareil{others.length > 1 ? 's' : ''} connecté{others.length > 1 ? 's' : ''}
                </div>
              </div>
              <button
                className="sess-disconnect-all-btn"
                onClick={disconnectAll}
                disabled={disconnecting}
              >
                {disconnecting ? 'Déconnexion…' : 'Tout déconnecter'}
              </button>
            </div>
            <div className="sess-other-list">
              {others.map(s => (
                <SessionCard key={s.id} session={s} onDisconnect={disconnect} disconnecting={disconnecting} />
              ))}
            </div>
          </div>
        )}

        {allDisconnected && (
          <p className="sec-success" style={{ textAlign: 'center' }}>
            ✅ Tous les autres appareils ont été déconnectés.
          </p>
        )}

        {!loading && others.length === 0 && !allDisconnected && (
          <div className="sess-empty">Aucune autre session active.</div>
        )}
      </div>
    </div>
  );
};

export default SessionsActives;
