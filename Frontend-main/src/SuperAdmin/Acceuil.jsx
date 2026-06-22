
// Side effect hook for handling data or state updates.
import React, { useEffect, useMemo, useState } from 'react';
import SideBarAdmin from './SideBarAdmin';
import './Acceuil.css';
import { getSuperAdminDashboard } from '../api/superAdmin';

const quickActions = [
  { label: 'Gerer les utilisateurs', color: 'blue' },
  { label: 'Configurer la grille', color: 'gold' },
  { label: 'Zones geographiques', color: 'green' },
  { label: 'Listes de base', color: 'slate' }
];

// Function: Acceuil.
function Acceuil({ onNavigate }) {
// State management using React hooks.
  const [dashboard, setDashboard] = useState(null);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState('');

// Side effect hook for handling data or state updates.
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getSuperAdminDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des donnees du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const roleStats = dashboard?.utilisateurs_par_role || {};
    return [
      { label: 'Utilisateurs', value: dashboard?.total_utilisateurs ?? 0, color: 'blue' },
      { label: 'Chercheurs', value: roleStats.CHERCHEUR ?? 0, color: 'gold' },
      { label: 'Admins', value: roleStats.ADMIN_DPGR ?? 0, color: 'green' },
      { label: 'Assistants', value: roleStats.ASSISTANT_DPGR ?? 0, color: 'slate' },
    ];
  }, [dashboard]);

// Render the component JSX.
  return (
    <SideBarAdmin activeItem="accueil" onNavigate={onNavigate}>
      <div className="admin-dashboard">
        {error && <p className="param-feedback param-feedback--error">{error}</p>}
        {loading && <p className="param-feedback">Chargement du tableau de bord...</p>}
        <section className="admin-card admin-stats">
          {stats.map((stat) => (
            <article key={stat.label} className="admin-stat-item">
              <p>{stat.label}</p>
              <h3 className={`is-${stat.color}`}>{stat.value}</h3>
            </article>
          ))}
        </section>

        <section className="admin-card">
          <h2>Actions rapides</h2>
          <div className="admin-actions-grid">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`admin-action-btn is-${action.color}`}
                onClick={() => {
                  if (action.label === 'Gerer les utilisateurs') onNavigate?.('utilisateurs');
                  if (action.label === 'Configurer la grille') onNavigate?.('grille');
                  if (action.label === 'Zones geographiques') onNavigate?.('zones');
                  if (action.label === 'Listes de base') onNavigate?.('listes');
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <h2>Activite recente</h2>
          <div className="admin-activity-list">
            <article className="admin-activity-item">
              <div>
                <h4>Session courante</h4>
                <p>
                  {dashboard?.session_courante
                    ? `${dashboard.session_courante.annee_academique} (${dashboard.session_courante.etat})`
                    : 'Aucune session ouverte'}
                </p>
              </div>
              <span>Maintenant</span>
            </article>
            <article className="admin-activity-item">
              <div>
                <h4>Demandes enregistrees</h4>
                <p>{dashboard?.total_demandes ?? 0} demandes dans le systeme</p>
              </div>
              <span>Donnees API</span>
            </article>
            <article className="admin-activity-item">
              <div>
                <h4>Referentiel</h4>
                <p>
                  {dashboard?.total_laboratoires ?? 0} labos, {dashboard?.total_pays ?? 0} pays,
                  {' '}
                  {dashboard?.total_types_sejour ?? 0} types de sejour
                </p>
              </div>
              <span>Donnees API</span>
            </article>
          </div>
        </section>
      </div>
    </SideBarAdmin>
  );
}

export default Acceuil;
