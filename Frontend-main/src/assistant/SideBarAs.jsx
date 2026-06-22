
import React from 'react';
import './SideBarAs.css';
import logo from '../assets/esi_sejour_logo_w.png';

// ── Icons ──
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);
// Small UI icon used in the interface.
const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);
// Small UI icon used in the interface.
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
  </svg>
);
// Small UI icon used in the interface.
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);
// Small UI icon used in the interface.
const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);
// Small UI icon used in the interface.
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

// ── Nav items ──
const navItems = [
  { id: 'accueil',    label: 'Accueil',            icon: <HomeIcon />     },
  { id: 'demandes',   label: 'Toutes les demandes', icon: <ListIcon />     },
  { id: 'messagerie', label: 'Messagerie',          icon: <MailIcon />     },
  { id: 'notifs',     label: 'Notifications',       icon: <BellIcon />     },
  { id: 'stats',      label: 'Statistiques',        icon: <ChartIcon />    },
  { id: 'settings',   label: 'Paramètres',          icon: <SettingsIcon /> },
];

// ── Component ──
// React component: SideBarAs.
const SideBarAs = ({ mobileOpen, setMobileOpen, active, setActive }) => {

  const handleNavClick = (id) => {
    setActive(id);
    setMobileOpen(false);
  };

// Render the component JSX.
  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>

        <div className="sidebar-logo">
          <img src={logo} alt="ESI Logo" className="sidebar-logo-img" />
          <div className="sidebar-tagline">Assistant DPGR</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        

      </aside>
    </>
  );
};

export default SideBarAs;
