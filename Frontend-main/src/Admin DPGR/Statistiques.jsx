
// Side effect hook for handling data or state updates.
import { useState, useEffect } from 'react';
import AdminSideBar from './AdminSideBar';
import './Statistiques.css';
import api from '../api/AdminDPGR';

/* ── Icons ── */
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

// Main component exported: Statistiques.
export default function Statistiques({ notifCount, onNavigate }) {
// State management using React hooks.
  const [stats, setStats] = useState([
    { label: 'Total demandes',    value: 0,   color: 'navy'  },
    { label: 'Approuvées',        value: 0,   color: 'green' },
    { label: 'Rejetées',          value: 0,   color: 'red'   },
    { label: "Taux d'approbation",value: '0%', color: 'gold'  },
  ]);

// State management using React hooks.
  const [types, setTypes] = useState([
    { label: 'Stage de perfectionnement', value: 0, max: 1, color: 'navy' },
    { label: 'Séjour scientifique',        value: 0, max: 1, color: 'gold' },
  ]);

// State management using React hooks.
  const [sessions, setSessions] = useState([]);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState(null);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Charger TOUTES les demandes
        const demandesRaw = await api.demandes.list();
        const demandes = Array.isArray(demandesRaw) ? demandesRaw : demandesRaw?.results || [];

        // Calculer les statistiques avec la MÊME LOGIQUE que AdminDash
        const totalDemandes = demandes.length;
        const demandesTraitees = demandes.filter(d => ['APPROUVEE', 'ACCEPTEE', 'TERMINEE', 'REJETEE'].includes(d.statut));
        
        const approuvees = demandesTraitees.filter(d => ['APPROUVEE', 'ACCEPTEE', 'TERMINEE'].includes(d.statut)).length;
        const rejetees = demandes.filter(d => d.statut === 'REJETEE').length;
        
        const tauxApprobation = demandesTraitees.length > 0 
          ? Math.round((approuvees / demandesTraitees.length) * 100) 
          : 0;

        // Demandes par type de séjour
        const spctt = demandes.filter(d => d.type_sejour && d.type_sejour.code === 'SPCTT').length;
        const sshn = demandes.filter(d => d.type_sejour && d.type_sejour.code === 'SSHN').length;
        const maxType = Math.max(totalDemandes, 1);
        
        // Mettre à jour les stats
        setStats([
          { label: 'Total demandes',    value: totalDemandes,   color: 'navy'  },
          { label: 'Approuvées',        value: approuvees,      color: 'green' },
          { label: 'Rejetées',          value: rejetees,        color: 'red'   },
          { label: "Taux d'approbation",value: `${tauxApprobation}%`, color: 'gold'  },
        ]);

        setTypes([
          { label: 'Stage de perfectionnement', value: spctt, max: maxType, color: 'navy' },
          { label: 'Séjour scientifique',        value: sshn, max: maxType, color: 'gold' },
        ]);

        // ✅ Charger les sessions et leurs statistiques
        const sessionsRaw = await api.parametres.sessions();
        const sessionsList = Array.isArray(sessionsRaw) ? sessionsRaw : sessionsRaw?.results || [];

        const sessionsStats = sessionsList.map(session => {
          // Filtrer les demandes de cette session
          const demandesSession = demandes.filter(d => d.session === session.id);
          const examinees = demandesSession.length;
          const approuvees = demandesSession.filter(d => d.statut === 'APPROUVEE').length;
          const rejetees = demandesSession.filter(d => d.statut === 'REJETEE').length;

          return {
            label: session.nom || `Session ${session.id}`,
            examined: examinees,
            approved: approuvees,
            rejected: rejetees
          };
        });

        setSessions(sessionsStats);

      } catch (err) {
        console.error('Erreur chargement stats:', err);
        setError(err.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
// Render the component JSX.
    return (
      <div className="st-shell">
        <AdminSideBar activePage="statistiques" onNavigate={onNavigate} />
        <div className="st-main">
          <header className="st-header">
            <h1 className="st-header-title">Statistiques</h1>
          </header>
          <main className="st-body" style={{ textAlign: 'center', padding: '20px' }}>
            <p>Chargement des statistiques...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
// Render the component JSX.
    return (
      <div className="st-shell">
        <AdminSideBar activePage="statistiques" onNavigate={onNavigate} />
        <div className="st-main">
          <header className="st-header">
            <h1 className="st-header-title">Statistiques</h1>
          </header>
          <main className="st-body" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            <p>Erreur: {error}</p>
          </main>
        </div>
      </div>
    );
  }

// Render the component JSX.
  return (
    <div className="st-shell">
      <AdminSideBar activePage="statistiques" onNavigate={onNavigate} />

      <div className="st-main">
        {/* Header */}
        <header className="st-header">
          <h1 className="st-header-title">Statistiques</h1>
          <div className="st-header-right">
            <button className="st-notif-btn" onClick={() => onNavigate('notifications')} style={{ position: 'relative' }}>
              <IconBell />
              {notifCount > 0 && <span className="ad-notif-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>{notifCount}</span>}
            </button>
            <div className="st-avatar">FA</div>
          </div>
        </header>

        <main className="st-body">

          {/* ── Stats row ── */}
          <div className="st-stats">
            {stats.map(({ label, value, color }) => (
              <div key={label} className="st-stat-card">
                <p className="st-stat-label">{label}</p>
                <p className={`st-stat-value st-stat-value--${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Demandes par type ── */}
          <div className="st-card">
            <h3 className="st-section-title">Demandes par type</h3>
            <div className="st-bars">
              {types.map(({ label, value, max, color }) => (
                <div key={label} className="st-bar-row">
                  <div className="st-bar-header">
                    <span className="st-bar-label">{label}</span>
                    <span className="st-bar-count">{value}</span>
                  </div>
                  <div className="st-bar-track">
                    <div
                      className={`st-bar-fill st-bar-fill--${color}`}
                      style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sessions récentes ── */}
          <div className="st-card">
            <h3 className="st-section-title">Sessions récentes</h3>
            {sessions.length > 0 ? (
              <div className="st-sessions">
                {sessions.map((s, i) => (
                  <div key={i} className="st-session-row">
                    <div className="st-session-left">
                      <p className="st-session-label">{s.label}</p>
                      <p className="st-session-sub">{s.examined} demandes examinées</p>
                    </div>
                    <div className="st-session-right">
                      <p className="st-session-approved">{s.approved} approuvées</p>
                      <p className="st-session-rejected">{s.rejected} rejetées</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Aucune session trouvée
              </p>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}
