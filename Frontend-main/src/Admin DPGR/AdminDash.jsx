
// Side effect hook for handling data or state updates.
import { useState, useEffect } from 'react';
import AdminSideBar from './AdminSideBar';
import './AdminDash.css';
import ExamenDossier from './ExamenDossier';
import Statistiques from './Statistiques';
import Notifications from './Notifications';
import Parametres from './Parametres';
import DetDemandeAdmin from './DetDemandeAdmin';
import api from '../api/AdminDPGR';
import RapportsAdmin from './RapportsAdmin'; 
import DetailRapportAdmin from './DetailRapportAdmin';

// ── Icons ──────────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
// Small UI icon used in the interface.
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
// Small UI icon used in the interface.
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  BROUILLON:                { label: 'Brouillon',       color: '#6b7280' },
  SOUMISE:                  { label: 'Soumise',         color: '#3b82f6' },
  VERIFICATION_AUTOMATIQUE: { label: 'En vérification', color: '#8b5cf6' },
  EN_ATTENTE:               { label: 'En attente',       color: '#f59e0b' },
  DELIBERATION_CS:          { label: 'En CS',           color: '#f59e0b' },
  APPROUVEE:                { label: 'Approuvée',        color: '#16a34a' },
  REJETEE:                  { label: 'Rejetée',          color: '#dc2626' },
  CLOTUREE:                 { label: 'Clôturée',         color: '#6b7280' },
};

// Function: formatRelativeTime.
function formatRelativeTime(isoString) {
  const diff  = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `Il y a ${days}j`;
  if (hours > 0) return `Il y a ${hours}h`;
  if (mins  > 0) return `Il y a ${mins}min`;
  return "À l'instant";
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
// React component: StatCard.
const StatCard = ({ value, label, sub, color }) => (
  <div style={{
    background: color, borderRadius: 14,
    padding: '24px 22px 22px',
    display: 'flex', flexDirection: 'column', gap: 4,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>{label}</div>
    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{sub}</div>
  </div>
);

// ── Activity Card ──────────────────────────────────────────────────────────────
// React component: ActivityCard.
const ActivityCard = ({ demande, onView }) => {
  const lastName   = demande.chercheur_nom    || '';
  const firstName  = demande.chercheur_prenom || '';
  const initials   = `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase() || '??';
  const fullName   = `${lastName} ${firstName}`.trim() || `Demande #${demande.id}`;
  const typeSejour = demande.type_sejour?.code || demande.type_sejour?.nom || '—';
  const location   = [demande.ville_accueil, demande.destination].filter(Boolean).join(', ') || '—';
  const statusInfo = STATUS_MAP[demande.statut] || { label: demande.statut, color: '#6b7280' };
  const submittedAt = demande.date_soumission ? formatRelativeTime(demande.date_soumission) : '—';

// Render the component JSX.
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: 14, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor = 'rgba(181,149,59,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: '#1e3a5f', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a2332', lineHeight: 1.2 }}>{fullName}</div>
          <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 2 }}>{submittedAt}</div>
        </div>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '4px 12px', borderRadius: 999,
        fontSize: '0.72rem', fontWeight: 700,
        background: statusInfo.color, color: '#fff',
        width: 'fit-content',
      }}>{statusInfo.label}</div>

      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1a2332' }}>{typeSejour}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#6b7280' }}>
        <PinIcon /> {location}
      </div>

      <div style={{ marginTop: 2 }}>
        <button
          onClick={() => onView && onView(demande.id)}
          style={{
            background: '#1A3A6B', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '8px 20px',
            fontSize: '0.83rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#152d5a'}
          onMouseLeave={e => e.currentTarget.style.background = '#1A3A6B'}
        >Voir</button>
      </div>
    </div>
  );
};

// ── Page Toutes les Demandes ───────────────────────────────────────────────────
// React component: ToutesDemandes.
const ToutesDemandes = ({ demandes, onBack, onView }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2332' }}>
        Toutes les demandes ({demandes.length})
      </h2>
      <button onClick={onBack} style={{
        background: 'none', border: '1px solid #e5e7eb',
        borderRadius: 8, padding: '6px 16px',
        fontSize: '0.83rem', cursor: 'pointer',
        color: '#6b7280', fontFamily: 'inherit',
      }}>← Retour</button>
    </div>
    <div className="ad-activity-grid">
      {demandes.length === 0
        ? <div style={{ color: '#6b7280', gridColumn: '1/-1' }}>Aucune demande.</div>
        : demandes.map((d, i) => <ActivityCard key={i} demande={d} onView={onView} />)
      }
    </div>
  </div>
);

// ── Main AdminDash ─────────────────────────────────────────────────────────────
// Main component exported: AdminDash.
export default function AdminDash() {
// State management using React hooks.
  const [page, setPage]                   = useState('accueil');
// State management using React hooks.
  const [selectedDemande, setSelectedDemande] = useState(null);
// State management using React hooks.
  const [selectedRapport, setSelectedRapport] = useState(null);
// State management using React hooks.
  const [demandes, setDemandes]           = useState([]);
// State management using React hooks.
  const [adminInitials, setAdminInitials] = useState('AD');
// State management using React hooks.
  const [loading, setLoading]             = useState(true);
// State management using React hooks.
  const [error, setError]                 = useState(null);
  
  // NOUVEAU STATE POUR LE COMPTEUR DE NOTIFICATIONS
  const [notifCount, setNotifCount]       = useState(0); 
  
// State management using React hooks.
  const [stats, setStats]                 = useState({
    total: 0, en_attente: 0, taux_approbation: 0, prochaine_session: 15,
  });

  const handleNavigate = (p) => {
    setPage(p);
    setSelectedDemande(null);
    setSelectedRapport(null);
  };

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [demandesData, profile] = await Promise.all([
          api.demandes.list(),
          api.users.profile(),
        ]);

        const rawList = Array.isArray(demandesData)
          ? demandesData
          : demandesData?.results || [];

        // ON FILTRE ICI : On ne garde que les demandes qui ne sont pas des brouillons
        const list = rawList.filter(d => d.statut !== 'BROUILLON');

        setDemandes(list);

        // --- CALCUL DYNAMIQUE DU TAUX D'APPROBATION ---
        const demandesTraitees = list.filter(d => ['APPROUVEE', 'ACCEPTEE', 'TERMINEE', 'REJETEE'].includes(d.statut));
        const demandesApprouvees = demandesTraitees.filter(d => ['APPROUVEE', 'ACCEPTEE', 'TERMINEE'].includes(d.statut));
        
        // Formule exacte : on ne garde que les dossiers qui sont passés en délibération
        const tauxCalcule = demandesTraitees.length > 0 
          ? Math.round((demandesApprouvees.length / demandesTraitees.length) * 100) 
          : 0; 

        setStats(prev => ({
          ...prev,
          total:            list.length,
          en_attente:       list.filter(d => d.statut === 'SOUMISE').length,
          taux_approbation: tauxCalcule 
        }));

        if (profile) {
          const n = profile.nom    ? profile.nom.charAt(0).toUpperCase()    : '';
          const p = profile.prenom ? profile.prenom.charAt(0).toUpperCase() : '';
          setAdminInitials((n + p) || 'AD');
        }

        // --- RECUPERATION DU VRAI NOMBRE DE NOTIFICATIONS ---
        try {
          if (api.notifications && api.notifications.list) {
            const notifsData = await api.notifications.list();
            const notifs = Array.isArray(notifsData) ? notifsData : notifsData?.results || [];
            
            // On compte celles qui ne sont pas lues (adapte '.lu' ou '.is_read' selon ton backend)
            const unreadCount = notifs.filter(n => n.lu === false || n.is_read === false || !n.read).length;
            
            // Si le backend ne renvoie que les non-lues, on utilise notifs.length
            setNotifCount(unreadCount > 0 ? unreadCount : notifs.length); 
          }
        } catch (e) {
          console.warn("Impossible de charger les notifications :", e);
        }

      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (selectedDemande) return (
    <div className="ad-shell">
      <AdminSideBar activePage="accueil" onNavigate={handleNavigate} />
      <div className="ad-main">
        <header className="ad-header">
          <h1 className="ad-header-title">Détail de la Demande</h1>
          <div className="ad-header-right">
            {/* BOUTON MIS À JOUR */}
            <button className="ad-notif-btn" onClick={() => handleNavigate('notifications')}>
              <BellIcon />
              {notifCount > 0 && <span className="ad-notif-badge">{notifCount}</span>}
            </button>
            <div className="ad-avatar">{adminInitials}</div>
          </div>
        </header>
        <main className="ad-body">
          <DetDemandeAdmin demandeId={selectedDemande} onBack={() => setSelectedDemande(null)} />
        </main>
      </div>
    </div>
  );

  if (selectedRapport) return (
    <div className="ad-shell">
      <AdminSideBar activePage="rapports" onNavigate={handleNavigate} />
      <div className="ad-main">
        <header className="ad-header">
          <h1 className="ad-header-title">Détail du Rapport</h1>
          <div className="ad-header-right">
            {/* BOUTON MIS À JOUR */}
            <button className="ad-notif-btn" onClick={() => handleNavigate('notifications')}>
              <BellIcon />
              {notifCount > 0 && <span className="ad-notif-badge">{notifCount}</span>}
            </button>
            <div className="ad-avatar">{adminInitials}</div>
          </div>
        </header>
        <main className="ad-body">
          <DetailRapportAdmin rapportId={selectedRapport} onBack={() => setSelectedRapport(null)} />
        </main>
      </div>
    </div>
  );

  if (page === 'deliberation')  return <ExamenDossier onBack={() => setPage('accueil')} onNavigate={handleNavigate} />;
  if (page === 'statistiques')  return <Statistiques  onNavigate={handleNavigate} />;
  if (page === 'notifications') return <Notifications onNavigate={handleNavigate} />;
  if (page === 'parametres')    return <Parametres    onNavigate={handleNavigate} />;

  if (page === 'rapports') return (
    <div className="ad-shell">
      <AdminSideBar activePage="rapports" onNavigate={handleNavigate} />
      <div className="ad-main">
        <header className="ad-header">
          <h1 className="ad-header-title">Gestion des Rapports</h1>
          <div className="ad-header-right">
            {/* BOUTON MIS À JOUR */}
            <button className="ad-notif-btn" onClick={() => handleNavigate('notifications')}>
              <BellIcon />
              {notifCount > 0 && <span className="ad-notif-badge">{notifCount}</span>}
            </button>
            <div className="ad-avatar">{adminInitials}</div>
          </div>
        </header>
        <main className="ad-body" style={{ padding: 0 }}>
          <RapportsAdmin onViewDetail={(id) => setSelectedRapport(id)} />
        </main>
      </div>
    </div>
  );

  if (page === 'demandes') return (
    <div className="ad-shell">
      <AdminSideBar activePage="accueil" onNavigate={handleNavigate} />
      <div className="ad-main">
        <header className="ad-header">
          <h1 className="ad-header-title">Toutes les demandes</h1>
          <div className="ad-header-right">
            {/* BOUTON MIS À JOUR */}
            <button className="ad-notif-btn" onClick={() => handleNavigate('notifications')}>
              <BellIcon />
              {notifCount > 0 && <span className="ad-notif-badge">{notifCount}</span>}
            </button>
            <div className="ad-avatar">{adminInitials}</div>
          </div>
        </header>
        <main className="ad-body">
          <ToutesDemandes
            demandes={demandes}
            onBack={() => setPage('accueil')}
            onView={(id) => setSelectedDemande(id)}
          />
        </main>
      </div>
    </div>
  );

  if (loading) return (
    <div className="ad-shell">
      <AdminSideBar activePage="accueil" onNavigate={handleNavigate} />
      <div className="ad-main">
        <header className="ad-header">
          <h1 className="ad-header-title">Tableau de bord</h1>
          <div className="ad-header-right">
            {/* BOUTON MIS À JOUR */}
            <button className="ad-notif-btn" onClick={() => handleNavigate('notifications')}>
              <BellIcon />
              {notifCount > 0 && <span className="ad-notif-badge">{notifCount}</span>}
            </button>
            <div className="ad-avatar">{adminInitials}</div>
          </div>
        </header>
        <main className="ad-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Chargement…</p>
        </main>
      </div>
    </div>
  );

  if (error) return (
    <div className="ad-shell">
      <AdminSideBar activePage="accueil" onNavigate={handleNavigate} />
      <div className="ad-main">
        <header className="ad-header">
          <h1 className="ad-header-title">Tableau de bord</h1>
          <div className="ad-header-right">
            {/* BOUTON MIS À JOUR */}
            <button className="ad-notif-btn" onClick={() => handleNavigate('notifications')}>
              <BellIcon />
              {notifCount > 0 && <span className="ad-notif-badge">{notifCount}</span>}
            </button>
            <div className="ad-avatar">{adminInitials}</div>
          </div>
        </header>
        <main className="ad-body">
          <p style={{ color: '#ef4444' }}>Erreur : {error}</p>
        </main>
      </div>
    </div>
  );

  const recentDemandes = demandes.slice(0, 6);

  const kpis = [
    {
      value: stats.total,
      label: 'Total demandes', sub: 'Toutes sessions',
      color: 'linear-gradient(135deg, #1A3A6B 0%, #0F2044 100%)',
    },
    {
      value: stats.en_attente,
      label: 'En attente examen', sub: 'À traiter',
      color: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    },
    {
      value: `${stats.taux_approbation}%`,
      label: "Taux d'approbation", sub: 'Ce mois',
      color: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    },
    {
      value: stats.prochaine_session,
      label: 'Prochaine session', sub: 'Février 2025',
      color: 'linear-gradient(135deg, #C9A84C 0%, #B8984A 100%)',
    },
  ];

// Render the component JSX.
  return (
    <div className="ad-shell">
      <AdminSideBar activePage="accueil" onNavigate={handleNavigate} />

      <div className="ad-main">
        <header className="ad-header">
          <h1 className="ad-header-title">Tableau de bord</h1>
          <div className="ad-header-right">
            {/* BOUTON MIS À JOUR */}
            <button className="ad-notif-btn" onClick={() => handleNavigate('notifications')}>
              <BellIcon />
              {notifCount > 0 && <span className="ad-notif-badge">{notifCount}</span>}
            </button>
            <div className="ad-avatar">{adminInitials}</div>
          </div>
        </header>

        <main className="ad-body">

          <div className="ad-kpi-grid">
            {kpis.map((k, i) => <StatCard key={i} {...k} />)}
          </div>

          <div style={{
            background: '#fff', borderRadius: 14,
            padding: 24, border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a2332' }}>
                Activité récente
              </h2>
              <a href="#"
                onClick={e => { e.preventDefault(); setPage('demandes'); }}
                style={{ fontSize: '0.82rem', color: '#1A3A6B', fontWeight: 500, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#b5953b'}
                onMouseLeave={e => e.currentTarget.style.color = '#1A3A6B'}
              >
                Voir toutes les demandes
              </a>
            </div>

            <div className="ad-activity-grid">
              {recentDemandes.length === 0
                ? <div style={{ color: '#6b7280', gridColumn: '1/-1' }}>Aucune demande récente.</div>
                : recentDemandes.map((d, i) => (
                    <ActivityCard
                      key={i}
                      demande={d}
                      onView={(id) => setSelectedDemande(id)}
                    />
                  ))
              }
            </div>
          </div>

          <button className="ad-cta-btn" onClick={() => setPage('deliberation')}>
            Commencer la délibération <ArrowIcon />
          </button>

        </main>
      </div>
    </div>
  );
}
