import React from 'react';
import { useTranslation } from 'react-i18next';
import './SideBarDash.css';
import logo from '../assets/esi_sejour_logo_w.png';
import { useDemande } from './DemandeContext';

// ── Icons ──
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

// Small UI icon used in the interface.
const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
  </svg>
);

// Small UI icon used in the interface.
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

// Small UI icon used in the interface.
const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);

// Small UI icon used in the interface.
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

// Small UI icon used in the interface.
const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
  </svg>
);

// Small UI icon used in the interface.
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
);

// Small UI icon used in the interface.
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

// Small UI icon used in the interface.
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
  </svg>
);

// Small UI icon used in the interface.
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// React component: SideBarDash.
const SideBarDash = ({ active, setActive, mobileOpen, setMobileOpen, setSelectedDemande }) => {
  const { t } = useTranslation();
  const { resetDemande } = useDemande();

  const navItems = [
    { id: 'accueil',  label: t('Accueil'),         icon: <HomeIcon />  },
    { id: 'demandes', label: t('Mes Demandes'),     icon: <FileIcon />  },
    { id: 'nouvelle', label: t('Nouvelle Demande'), icon: <PlusIcon />  },
    { id: 'rapports', label: t('Mes Rapports'),     icon: <ChartIcon /> },
    { id: 'notifications', label: t('Notifications'), icon: <BellIcon /> },
    { id: 'profil',   label: t('Mon Profil'),       icon: <UserIcon />  },
    { id: 'messagerie', label: t('Messagerie'), icon: <SendIcon /> },
  ];

  const handleNavClick = (id) => {
    if (id === 'nouvelle' && setSelectedDemande) {
      resetDemande();
      setSelectedDemande(null);
    }
    setActive(id);
    setMobileOpen(false);
  };

// Render the component JSX.
  return (
    <>
      {/* Hamburger button (only visible on mobile) */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Overlay (closes sidebar when clicking outside) */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" className="sidebar-logo-img" />
          <div className="sidebar-tagline">{t("Portail Chercheur")}</div>
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

        <div className="sidebar-help">
          <div className="help-chat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </div>
          <p className="help-title">{t("Besoin d'assistance ?")}</p>
          <a href="../#" className="help-link">{t("Ouvrir le Chatbot")} →</a>
          <p className="help-sub">{t("Assistance 24/7 disponible")}</p>
        </div>
      </aside>
    </>
  );
};

export default SideBarDash;
