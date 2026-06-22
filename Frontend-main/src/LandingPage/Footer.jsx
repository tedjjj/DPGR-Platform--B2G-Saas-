import React from "react";
import "./Footer.css";
import EsiLogoSrc from '../assets/esi_logo_w.png';

const NAV_ITEMS = [
  { label: "Accueil", targetId: "accueil" },
  { label: "À propos", targetId: "apropos" },
  { label: "Types de séjours", targetId: "types-sejours" },
  
];

const scrollToSection = (targetId) => {
  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

// Small UI icon used in the interface.
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// Small UI icon used in the interface.
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// Small UI icon used in the interface.
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Small UI icon used in the interface.
const SlackIcon = () => (
  <svg viewBox="0 0 127 127" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80z" fill="#E01E5A"/>
    <path d="M33.7 80c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
    <path d="M46.9 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.7 6.7 39.6.8 46.9.8c7.3 0 13.2 5.9 13.2 13.2v13.2H46.9z" fill="#36C5F0"/>
    <path d="M46.9 33.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2h33z" fill="#36C5F0"/>
    <path d="M99.8 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.8V46.9z" fill="#2EB67D"/>
    <path d="M93.3 46.9c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.9C66.9 6.6 72.8.7 80.1.7c7.3 0 13.2 5.9 13.2 13.2v33z" fill="#2EB67D"/>
    <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2z" fill="#ECB22E"/>
    <path d="M80.1 93.3c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2h-33z" fill="#ECB22E"/>
  </svg>
);

const EsiLogo = () => (
  <div className="esi-logo">
    <img src={EsiLogoSrc} alt="ESI Logo" width="80" height="60" />
    <div className="esi-logo-text">
      <span className="esi-subtitle">ÉCOLE NATIONALE SUPÉRIEURE<br />D'INFORMATIQUE</span>
    </div>
  </div>
);


// Main component exported: Footer.
export default function Footer() {
// Render the component JSX.
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <EsiLogo />
            <p className="footer-brand-desc">
              Plateforme officielle de la DPGR pour la gestion des stages et séjours scientifiques.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">LIENS RAPIDES</h4>
            <ul className="footer-links">
              {NAV_ITEMS.map((item) => (
                <li key={item.targetId}>
                  <a
                    href={`#${item.targetId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.targetId);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">CONTACT</h4>
            <ul className="footer-contact">
              <li>
                <span className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span>BP 68M, Oued Smar<br />16309 Alger, Algérie</span>
              </li>
              <li>
                <span className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 5.55 5.55l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                  </svg>
                </span>
                <span>+213 (0) 21 43 14 14</span>
              </li>
              <li>
                <span className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <span>dpgr@esi.dz</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer-col">
            <h4 className="footer-col-title">SUIVEZ-NOUS</h4>
            <div className="footer-socials">
              <a href="https://www.facebook.com/ESI.Page" className="social-btn" aria-label="Facebook"><FacebookIcon /></a>
              <a href="https://x.com/EsiAlger" className="social-btn" aria-label="Twitter"><TwitterIcon /></a>
              <a href="https://www.linkedin.com/school/ecole-superieure-informatique-alger/posts/?feedView=all" className="social-btn" aria-label="LinkedIn"><LinkedInIcon /></a>
              <a href="#" className="social-btn" aria-label="Slack"><SlackIcon /></a>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <p className="footer-copy">
          © 2026 École nationale Supérieure d'Informatique (ESI). Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
