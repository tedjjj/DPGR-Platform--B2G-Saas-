
// Side effect hook for handling data or state updates.
import React, { useState, useEffect } from 'react';
import './acceuil.css';
import SideBarAs from './SideBarAs';
import Demandes from './Demandes';
import DetailDemande from './DetailDemande';
import Statistiques from './Statistiques';
import Parametres from './Parametres';
import Notifications from './Notifications';
import Messagerie from './Messagerie';
import { getCurrentUser, getMyProfile, getNotifications } from '../api/assistant';
import { authFetch } from '../api/jwtClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('access_token', data.access);
    }
  } catch (e) {
    console.error('Token refresh failed:', e);
  }
}

// Small UI icon used in the interface.
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);
// Small UI icon used in the interface.
const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);
// Small UI icon used in the interface.
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);
// Small UI icon used in the interface.
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const STATUS_MAP = {
  BROUILLON: { label: 'Brouillon', color: '#6b7280' },
  SOUMISE: { label: 'Soumise', color: '#3b82f6' },
  VERIFICATION_AUTOMATIQUE: { label: 'En verification', color: '#8b5cf6' },
  EN_ATTENTE: { label: 'En attente', color: '#f59e0b' },
  DELIBERATION_CS: { label: 'A verifier', color: '#f59e0b' },
  APPROUVEE: { label: 'Approuvée', color: '#16a34a' },
  REJETEE: { label: 'Rejetée', color: '#dc2626' },
  EN_COURS: { label: 'En cours', color: '#0ea5e9' },
  TERMINEE: { label: 'Terminée', color: '#16a34a' },
  CLOTUREE: { label: 'Cloturée', color: '#6b7280' },
  ANNULEE: { label: 'Annulée', color: '#9ca3af' },
};

const getInitials = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getProfilePhotoUrl = (profile) => {
  const photo = profile?.photo_profil;
  if (!photo) return null;
  if (typeof photo === 'string') return photo;
  return photo.secure_url || photo.url || photo.image || null;
};

// Function: formatRelativeTime.
function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `Il y a ${days}j`;
  if (hours > 0) return `Il y a ${hours}h`;
  if (mins > 0) return `Il y a ${mins}min`;
  return "A l'instant";
}

const getValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const groupByYear = (demandes, yearsToShow = 5) => {
  const counts = new Map();
  const currentYear = new Date().getFullYear();

  demandes.forEach((demande) => {
    const year = getValidDate(demande.date_soumission)?.getFullYear();
    if (!year) return;
    counts.set(year, (counts.get(year) || 0) + 1);
  });

  const startYear = currentYear - (yearsToShow - 1);
  const years = [];

  for (let year = startYear; year <= currentYear; year += 1) {
    years.push({
      label: String(year),
      value: counts.get(year) || 0,
    });
  }

  return years;
};

const computeDeltaValue = (current, previous) => {
  if (previous === 0) return 0;
  return Math.round((((current - previous) / previous) * 100) * 10) / 10;
};

const buildYearlyOverview = (demandes = []) => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const currentYearDemandes = demandes.filter(
    (demande) => getValidDate(demande.date_soumission)?.getFullYear() === currentYear,
  );
  const previousYearDemandes = demandes.filter(
    (demande) => getValidDate(demande.date_soumission)?.getFullYear() === previousYear,
  );
  const treatedStatuses = new Set(['APPROUVEE', 'REJETEE', 'CLOTUREE']);
  const avgStatuses = new Set(['APPROUVEE', 'REJETEE']);

  const avgDuration = (items) => {
    if (!items.length) return 0;
    const total = items.reduce((sum, item) => sum + (Number(item.duree_jours) || 0), 0);
    return Math.round((total / items.length) * 10) / 10;
  };

  const currentTreated = currentYearDemandes.filter((demande) => treatedStatuses.has(demande.statut));
  const previousTreated = previousYearDemandes.filter((demande) => treatedStatuses.has(demande.statut));
  const currentAvgItems = currentYearDemandes.filter((demande) => avgStatuses.has(demande.statut));
  const previousAvgItems = previousYearDemandes.filter((demande) => avgStatuses.has(demande.statut));

  return {
    currentYear,
    kpis: {
      demandes_cette_annee: {
        value: currentYearDemandes.length,
        delta: computeDeltaValue(currentYearDemandes.length, previousYearDemandes.length),
      },
      demandes_traitees: {
        value: currentTreated.length,
        delta: computeDeltaValue(currentTreated.length, previousTreated.length),
      },
      chercheurs_actifs: {
        value: new Set(currentYearDemandes.map((demande) => demande.chercheur)).size,
        delta: computeDeltaValue(
          new Set(currentYearDemandes.map((demande) => demande.chercheur)).size,
          new Set(previousYearDemandes.map((demande) => demande.chercheur)).size,
        ),
      },
      delai_moyen: {
        value: avgDuration(currentAvgItems),
        delta: computeDeltaValue(avgDuration(currentAvgItems), avgDuration(previousAvgItems)),
      },
    },
    repartition_statut: {
      approuvees: currentYearDemandes.filter((demande) => demande.statut === 'APPROUVEE').length,
      en_cs: currentYearDemandes.filter((demande) => demande.statut === 'DELIBERATION_CS').length,
    },
    evolution_annuelle: groupByYear(demandes),
  };
};

const fetchAllDemandesPages = async () => {
  const allDemandes = [];
  let nextUrl = `${API_BASE}/api/demandes/`;

  while (nextUrl) {
    const res = await fetch(nextUrl, { headers: authHeaders() });

    if (res.status === 401) {
      await refreshToken();
      throw new Error('AUTH_RETRY');
    }

    if (!res.ok) {
      throw new Error(`Demandes error: ${res.status}`);
    }

    const payload = await res.json();
    const list = Array.isArray(payload) ? payload : payload.results || payload.demandes || [];
    allDemandes.push(...list);

    nextUrl = Array.isArray(payload) ? null : (payload.next || null);
  }

  return allDemandes;
};

// React component: Skeleton.
const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px' }) => (
  <div style={{
    width, height, borderRadius,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }} />
);

// React component: DonutChart.
const DonutChart = ({ total, segments }) => {
  const r = 60;
  const cx = 80;
  const cy = 80;
  const stroke = 22;
  const circ = 2 * Math.PI * r;

  if (total === 0) {
    return <div style={{ color: '#9ca3af', fontSize: 13 }}>Aucune donnee</div>;
  }

  if (segments.length === 1) {
// Render the component JSX.
    return (
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={segments[0].color} strokeWidth={stroke} />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1e293b">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#6b7280">total</text>
      </svg>
    );
  }

  const arcs = [];
  segments.reduce((offset, segment) => {
    const dash = (segment.value / total) * circ;
    arcs.push({
      ...segment,
      dasharray: `${dash} ${circ - dash}`,
      dashoffset: offset,
    });
    return offset - dash;
  }, circ / 4);

// Render the component JSX.
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {arcs.map((arc, index) => (
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={arc.dasharray}
          strokeDashoffset={arc.dashoffset}
          strokeLinecap="butt"
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1e293b">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#6b7280">total</text>
    </svg>
  );
};

// React component: Header.
const Header = ({ title, onMenuOpen, setActive, notifCount, msgCount, avatarUrl, avatarInitials }) => (
  <header className="ad-header">
    <div className="ad-header-left">
      <button className="ad-header-hamburger" onClick={onMenuOpen} aria-label="Open menu">
        <MenuIcon />
      </button>
      <h1 className="ad-header-title">{title}</h1>
    </div>
    <div className="ad-header-actions">
      <button className="ad-notif-wrap ad-inbox-wrap" onClick={() => setActive('messagerie')} aria-label="Messagerie">
        <InboxIcon />
        {msgCount > 0 && <span className="ad-notif-badge ad-inbox-badge">{msgCount}</span>}
      </button>
      <button className="ad-notif-wrap" onClick={() => setActive('notifs')} style={{ cursor: 'pointer' }}>
        <BellIcon />
        {notifCount > 0 && <span className="ad-notif-badge">{notifCount}</span>}
      </button>
      <div className="ad-avatar" onClick={() => setActive('settings')} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
        {avatarUrl
          ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : avatarInitials}
      </div>
    </div>
  </header>
);

// React component: StatCard.
const StatCard = ({ value, label, sub, color, loading }) => (
  <div className="ad-stat-card" style={{ background: color }}>
    {loading ? (
      <>
        <Skeleton height="36px" width="60%" />
        <div style={{ marginTop: 8 }}><Skeleton height="14px" width="80%" /></div>
        <div style={{ marginTop: 6 }}><Skeleton height="12px" width="50%" /></div>
      </>
    ) : (
      <>
        <div className="ad-stat-value" style={{ color: '#fff' }}>{value ?? '-'}</div>
        <div className="ad-stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>{label}</div>
        <div className="ad-stat-sub" style={{ color: 'rgba(255,255,255,0.6)' }}>{sub}</div>
      </>
    )}
  </div>
);

// React component: ActivityCard.
const ActivityCard = ({ demande, onSelectDemande }) => {
  const firstName = demande.chercheur_prenom || '';
  const lastName = demande.chercheur_nom || '';
  const initials = `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase() || '??';
  const fullName = `${lastName} ${firstName}`.trim() || `Demande #${demande.id}`;
  const statusInfo = STATUS_MAP[demande.statut] || { label: demande.statut, color: '#6b7280' };
  const submittedAt = demande.date_soumission ? formatRelativeTime(demande.date_soumission) : '-';
  const typeSejour = demande.type_sejour?.code || '-';
  const location = [demande.ville_accueil, demande.destination].filter(Boolean).join(', ') || '-';

// Render the component JSX.
  return (
    <div className="ad-activity-card">
      <div className="ad-activity-top">
        <div className="ad-activity-avatar" style={{ background: '#1e3a5f' }}>{initials}</div>
        <div className="ad-activity-info">
          <div className="ad-activity-name">{fullName}</div>
          <div className="ad-activity-time">{submittedAt}</div>
        </div>
      </div>
      <div className="ad-activity-badge" style={{ background: statusInfo.color, color: '#fff' }}>
        {statusInfo.label}
      </div>
      <div className="ad-activity-type">{typeSejour}</div>
      <div className="ad-activity-location">
        <PinIcon /> {location}
      </div>
      <div className="ad-activity-actions">
        <button className="ad-btn-voir" onClick={() => onSelectDemande && onSelectDemande(demande.id)}>
          Voir
        </button>
      </div>
    </div>
  );
};

// React component: AccueilPage.
const AccueilPage = ({ setActive, onSelectDemande }) => {
// State management using React hooks.
  const [allDemandes, setAllDemandes] = useState([]);
// State management using React hooks.
  const [recentDems, setRecentDems] = useState([]);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState(null);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchAllDemandesPages();
        setAllDemandes(list);
        setRecentDems(list.filter((d) => d.statut !== 'BROUILLON').slice(0, 3));
      } catch (err) {
        if (err.message === 'AUTH_RETRY') {
          return fetchAll();
        }
        console.error('AccueilPage fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const yearlyOverview = buildYearlyOverview(allDemandes);
  const kpis = yearlyOverview.kpis;
  const currentYearLabel = String(yearlyOverview.currentYear);

  const stats = [
    {
      value: loading ? '...' : (kpis.demandes_cette_annee?.value ?? '-'),
      label: 'Demandes cette année',
      sub: currentYearLabel,
      color: 'linear-gradient(135deg, #1A3A6B 0%, #0F2044 100%)',
    },
    {
      value: loading ? '...' : (kpis.demandes_traitees?.value ?? '-'),
      label: 'Demandes traitées',
      sub: 'Approuvées + rejetées',
      color: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    },
    {
      value: loading ? '...' : (kpis.chercheurs_actifs?.value ?? '-'),
      label: 'Chercheurs actifs',
      sub: 'Avec demandes en cours',
      color: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    },
    {
      value: loading ? '...' : (kpis.delai_moyen?.value != null ? `${kpis.delai_moyen.value} j` : '-'),
      label: 'Delai moyen',
      sub: 'En jours',
      color: 'linear-gradient(135deg, #C9A84C 0%, #B8984A 100%)',
    },
  ];

  const barData = yearlyOverview.evolution_annuelle;
  const barMax = barData.length ? Math.max(...barData.map((item) => item.value), 1) : 1;

  const rep = yearlyOverview.repartition_statut || {};
  const approuvées = rep.approuvées || 0;
  const enCs = rep.en_cs || 0;
  const donutTotal = approuvées + enCs;
  const donutSegments = [
    { value: approuvées, color: '#1A3A6B' },
    { value: enCs, color: '#b5953b' },
  ];

// Render the component JSX.
  return (
    <div className="ad-page">
      <div className="ad-stats-row">
        {stats.map((stat, index) => <StatCard key={index} {...stat} loading={loading} />)}
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: 'rgba(220,38,38,0.1)',
          color: '#dc2626',
          border: '1px solid rgba(220,38,38,0.2)',
          fontSize: 13,
        }}>
          Erreur de chargement : {error}
        </div>
      )}

      <section className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Activite recente</h2>
          <a
            href="#"
            className="ad-section-link"
            onClick={(e) => {
              e.preventDefault();
              setActive('demandes');
            }}
          >
            Voir toutes les demandes
          </a>
        </div>

        {loading ? (
          <div className="ad-activity-grid">
            {[0, 1, 2].map((item) => (
              <div key={item} className="ad-activity-card">
                <Skeleton height="60px" />
                <div style={{ marginTop: 10 }}><Skeleton height="20px" width="40%" /></div>
                <div style={{ marginTop: 8 }}><Skeleton height="14px" width="70%" /></div>
                <div style={{ marginTop: 6 }}><Skeleton height="14px" width="50%" /></div>
              </div>
            ))}
          </div>
        ) : recentDems.length === 0 ? (
          <p style={{ color: '#6b7280', padding: '20px 0' }}>Aucune demande recente.</p>
        ) : (
          <div className="ad-activity-grid">
            {recentDems.map((demande) => (
              <ActivityCard key={demande.id} demande={demande} onSelectDemande={onSelectDemande} />
            ))}
          </div>
        )}
      </section>

      <div className="ad-charts-row">
        <div className="ad-chart-card">
          <h3 className="ad-chart-title">Demandes par annee</h3>
          {loading ? (
            <Skeleton height="140px" />
          ) : barData.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: 13 }}>Aucune donnee disponible.</p>
          ) : (
            <div className="ad-bar-chart">
              {barData.map((item, index) => (
                <div
                  key={index}
                  className="ad-bar-col"
                  title={`${item.value} demande${item.value > 1 ? 's' : ''}`}
                >
                  <div
                    className="ad-bar"
                    style={{ height: `${(item.value / barMax) * 120}px` }}
                    aria-label={`${item.label}: ${item.value} demande${item.value > 1 ? 's' : ''}`}
                  />
                  <div className="ad-bar-label">{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ad-chart-card">
          <h3 className="ad-chart-title">Repartition par statut</h3>
          <p className="ad-chart-sub">Repartition globale</p>
          {loading ? (
            <Skeleton height="160px" />
          ) : (
            <div className="ad-donut-row">
              <DonutChart total={donutTotal} segments={donutSegments} />
              <div className="ad-donut-legend">
                <div className="ad-legend-item">
                  <span className="ad-legend-dot" style={{ background: '#1A3A6B' }} />
                  <span className="ad-legend-label">Approuvées</span>
                  <span className="ad-legend-count">{approuvées}</span>
                </div>
                <div className="ad-legend-item">
                  <span className="ad-legend-dot" style={{ background: '#b5953b' }} />
                  <span className="ad-legend-label">En CS</span>
                  <span className="ad-legend-count">{enCs}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AssistantDash = () => {
// State management using React hooks.
  const [active, setActive] = useState('accueil');
// State management using React hooks.
  const [mobileOpen, setMobileOpen] = useState(false);
// State management using React hooks.
  const [selectedDemande, setSelected] = useState(null);
// State management using React hooks.
  const [messageTarget, setMessageTarget] = useState(null);
// State management using React hooks.
  const [notifCount, setNotifCount] = useState(0);
// State management using React hooks.
  const [msgCount, setMsgCount] = useState(0);
// State management using React hooks.
  const [avatarUrl, setAvatarUrl] = useState(null);
// State management using React hooks.
  const [avatarInitials, setAvatarInitials] = useState('?');

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const loadHeaderProfile = async () => {
      try {
        const [user, profile] = await Promise.all([
          getCurrentUser(),
          getMyProfile().catch(() => null),
        ]);

        const fullName = `${user.nom ?? ''} ${user.prenom ?? ''}`.trim() || user.email || '';
        setAvatarInitials(getInitials(fullName));
        setAvatarUrl(getProfilePhotoUrl(profile));
      } catch {
        setAvatarInitials('?');
        setAvatarUrl(null);
      }
    };

    loadHeaderProfile();
  }, []);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const fetchHeaderCounts = async () => {
      try {
        const [notifications, messagesRes] = await Promise.all([
          getNotifications(),
          authFetch('/messagerie/?est_lu=false'),
        ]);

        const messagesData = await messagesRes.json();

        setNotifCount(Array.isArray(notifications) ? notifications.filter((notif) => !notif.est_lue).length : 0);
        setMsgCount(Array.isArray(messagesData) ? messagesData.length : 0);
      } catch {
        // non-critical
      }
    };

    fetchHeaderCounts();
  }, []);

  const pageTitles = {
    accueil: 'Tableau de Bord',
    demandes: selectedDemande ? 'Detail de la Demande' : 'Toutes les Demandes',
    messagerie: 'Messagerie',
    notifs: 'Notifications',
    stats: 'Statistiques & Rapports',
    settings: 'Parametres',
  };

  const handleSelectDemande = (id) => {
    setSelected(id);
    setActive('demandes');
    setMessageTarget(null);
  };

  const handleBack = () => {
    setSelected(null);
  };

  const handleNavigate = (id) => {
    setActive(id);
    setSelected(null);
    setMessageTarget(null);
  };

  const handleOpenMessagerie = (target) => {
    setMessageTarget(target);
    setActive('messagerie');
  };

// Render the component JSX.
  return (
    <div className="ad-app">
      <SideBarAs
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        active={active}
        setActive={handleNavigate}
        msgCount={msgCount}
      />
      <div className="ad-main-wrapper">
        <Header
          title={pageTitles[active] || 'Tableau de Bord'}
          onMenuOpen={() => setMobileOpen(true)}
          setActive={handleNavigate}
          notifCount={notifCount}
          msgCount={msgCount}
          avatarUrl={avatarUrl}
          avatarInitials={avatarInitials}
        />
        <main className="ad-main-content">
          {active === 'accueil' && <AccueilPage setActive={setActive} onSelectDemande={handleSelectDemande} />}
          {active === 'demandes' && !selectedDemande && <Demandes onSelectDemande={handleSelectDemande} />}
          {active === 'demandes' && selectedDemande && (
            <DetailDemande
              demandeId={selectedDemande}
              onBack={handleBack}
              onOpenMessagerie={handleOpenMessagerie}
            />
          )}
          {active === 'messagerie' && <Messagerie onUnreadChange={setMsgCount} targetConversation={messageTarget} />}
          {active === 'stats' && <Statistiques />}
          {active === 'settings' && <Parametres avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} setAvatarInitials={setAvatarInitials} />}
          {active === 'notifs' && <Notifications setActive={setActive} onUnreadChange={setNotifCount} />}
        </main>
      </div>
    </div>
  );
};

export default AssistantDash;
