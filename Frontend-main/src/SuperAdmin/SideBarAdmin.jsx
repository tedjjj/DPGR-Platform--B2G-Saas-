
// State management using React hooks.
import React, { useState } from 'react';
import './SideBarAdmin.css';
import logo from '../assets/esi_sejour_logo_w.png';

/* ── Icons ── */
// Small UI icon used in the interface.
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3.5 3 10.7V21h6.6v-5.7h4.8V21H21V10.7L12 3.5zm0 2.3 7 5.6V19h-2.6v-5.7H7.6V19H5v-7.6l7-5.6z" />
  </svg>
);
// Small UI icon used in the interface.
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm6 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM2 19.2C2 16.3 4.4 14 7.4 14h3.2c1.1 0 2.2.3 3.1.9-1.1.9-1.8 2.2-1.9 3.7H2v.6zm11.5.4c.1-2 1.7-3.6 3.7-3.6h.6c2 0 3.7 1.6 3.7 3.6v.4h-8v-.4z" />
  </svg>
);
// Small UI icon used in the interface.
const GridIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
  </svg>
);
// Small UI icon used in the interface.
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.2A9.8 9.8 0 1 0 21.8 12 9.8 9.8 0 0 0 12 2.2zm7.6 8.7h-3.2A15.6 15.6 0 0 0 14.9 4a8 8 0 0 1 4.7 6.9zM12 4.1c1 .9 2 3.4 2.5 6.8H9.5C10 7.5 11 5 12 4.1zM4.4 13.1h3.2c.1 1.6.4 3.2.9 4.6a9 9 0 0 0 1 2.2 8 8 0 0 1-5.1-6.8zm0-2.2A8 8 0 0 1 9.5 4a9 9 0 0 0-1 2.2c-.5 1.4-.8 3-.9 4.6H4.4zm7.6 9c-1-.9-2-3.4-2.5-6.8h5c-.5 3.4-1.5 5.9-2.5 6.8zm2.9-.9c.5-1.4.8-3 .9-4.6h3.2a8 8 0 0 1-5.1 6.8c.4-.7.8-1.4 1-2.2z" />
  </svg>
);
// Small UI icon used in the interface.
const ListIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 6.5A1.5 1.5 0 1 1 5 9a1.5 1.5 0 0 1 0-2.5zM9 7h11v2H9V7zM5 11A1.5 1.5 0 1 1 5 14a1.5 1.5 0 0 1 0-3zm4 .5h11v2H9v-2zM5 15.5A1.5 1.5 0 1 1 5 18a1.5 1.5 0 0 1 0-2.5zM9 16h11v2H9v-2z" />
  </svg>
);
// Small UI icon used in the interface.
const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3a5.3 5.3 0 0 0-5.3 5.3v2.6c0 .7-.3 1.3-.7 1.8l-1.3 1.5a1.3 1.3 0 0 0 1 2.2h12.6a1.3 1.3 0 0 0 1-2.2L18 12.7c-.4-.5-.7-1.1-.7-1.8V8.3A5.3 5.3 0 0 0 12 3zm0 18a2.6 2.6 0 0 0 2.4-1.6h-4.8A2.6 2.6 0 0 0 12 21z" />
  </svg>
);
// Small UI icon used in the interface.
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
);
// Small UI icon used in the interface.
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const navItems = [
  { id: 'accueil',      label: 'Accueil',              icon: <HomeIcon />  },
  { id: 'utilisateurs', label: 'Utilisateurs',          icon: <UsersIcon /> },
  { id: 'grille',       label: "Grille d'évaluation",  icon: <GridIcon />  },
  { id: 'zones',        label: 'Zones géographiques',  icon: <GlobeIcon /> },
  { id: 'listes',       label: 'Listes de base',        icon: <ListIcon />  },
  { id: 'notifications',label: 'Historique',            icon: <BellIcon />  },
  { id: 'parametres',   label: 'Paramètres système',   icon: <GridIcon />  },
];

// Function: SideBarAdmin.
function SideBarAdmin({ children, title = 'Tableau de bord', activeItem = 'accueil', onNavigate }) {
// State management using React hooks.
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (id) => {
    setMobileOpen(false);
    onNavigate?.(id);
  };

// Render the component JSX.
  return (
    <div className="super-admin-page">

      {/* Overlay (mobile only) */}
      {mobileOpen && (
        <div className="super-admin-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`super-admin-sidebar${mobileOpen ? ' super-admin-sidebar--open' : ''}`}>
        <div className="super-admin-logo">
          <img src={logo} alt="ESI Logo" className="sidebar-logo-img" />
        
        <div className="super-admin-sidebar-title">Portail Super Admin</div>
        </div>
        <nav className="super-admin-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`super-admin-nav-item${activeItem === item.id ? ' is-active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="super-admin-nav-icon">{item.icon}</span>
              <span className="super-admin-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="super-admin-main">
        <header className="super-admin-header">
          <div className="super-admin-header-left">
            <button
              className="super-admin-hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <h1>{title}</h1>
          </div>
          <div className="super-admin-header-actions">
            <div className="super-admin-avatar">SA</div>
          </div>
        </header>
        <section className="super-admin-content">{children}</section>
      </main>
    </div>
  );
}

export default SideBarAdmin;
