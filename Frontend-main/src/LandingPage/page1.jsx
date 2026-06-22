import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./page1.css";
import ESI_logo from "../assets/esi_sejour_logo_dark.png";


// ─── SVG Icons ────────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

 

const CalendarIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FileIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TrendIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const GradCapIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#0d1b3e" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const AwardIcon = () => (
  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#0d1b3e" strokeWidth="2">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Accueil", targetId: "accueil" },
  { label: "À propos", targetId: "apropos" },
  { label: "Types de séjours", targetId: "types-sejours" },
  { label: "Contact", targetId: "contact" },
];

const STATS = [
  { icon: <UsersIcon />,   number: "+500", label: "Chercheurs"          },
  { icon: <CalendarIcon />, number: "12",  label: "Années d'expérience" },
  { icon: <FileIcon />,    number: "2",    label: "Types de séjours"    },
  { icon: <TrendIcon />,   number: "100%", label: "Traçabilité"         },
];




// ─── Component ────────────────────────────────────────────────────────────────

export default function Page1() {
  const [activeNav, setActiveNav] = useState("Accueil");
  const navigate = useNavigate();

  const handleNavClick = (item) => {
    setActiveNav(item.label);
    const section = document.getElementById(item.targetId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLoginClick = () => {
  navigate("/login");
};

const handleSubmitClick = () => {
  navigate("/login");
};

  const handleLearnMoreClick = () => {
    const ctaSection = document.getElementById("cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <div className="page1">

      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-logo">
          <div>
            <img className="esi-logo" src={ESI_logo} alt="ESI logo"></img>
          </div>
          <span className="nav-logo-text">École Nationale Supérieure d'Informatique</span>
        </div>

        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={activeNav === item.label ? "nav-link-btn active" : "nav-link-btn"}
                onClick={() => handleNavClick(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <button className="nav-btn" type="button" onClick={handleLoginClick}>
          Se connecter
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Gérez vos stages et séjours<br />
            scientifiques<br />
            <em>avec excellence</em>
          </h1>
          <div className="hero-divider" />
          <p className="hero-sub">La plateforme officielle de la DPGR — ESI Alger</p>
          <div className="hero-actions">
            <button className="btn-gold" type="button" onClick={handleSubmitClick}>
              Soumettre une demande <span className="btn-arrow"><ArrowIcon /></span>
            </button>
            <button className="btn-outline" type="button" onClick={handleLearnMoreClick}>
              En savoir plus
            </button>
          </div>
        </div>
      </section>

    
      <div className="wave-wrapper">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" height="48">
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#f5f6fa" />
        </svg>
      </div>

    
     

    </div>
  );
}
