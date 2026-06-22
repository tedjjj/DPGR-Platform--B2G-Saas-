import { useState } from "react";
import "./ManuelUtilisation.css";
import "./CTA.css";

const MANUAL_PDF_HREF = "/User-Manual.pdf";

const VIDEO_FILE = "Video Project 2 (1).mp4";
const VIDEO_PATH = `/LandingPage/ManuelUtilisation/videos/${encodeURIComponent(VIDEO_FILE)}`;

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M10 8l6 4-6 4V8z" />
  </svg>
);

const RouteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19V5" />
    <path d="M20 19V5" />
    <path d="M4 8h16" />
    <path d="M4 16h16" />
    <circle cx="8" cy="12" r="1.5" />
    <circle cx="16" cy="12" r="1.5" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const steps = [
  "Acceder a la plateforme",
  "Se connecter a son espace",
  "Envoyer une demande",
];

export default function ManuelUtilisation() {
  const [hasVideo, setHasVideo] = useState(false);

  return (
    <section className="manuel-section">
      <div className="manuel-top">
        <div className="manuel-badge">
          <RouteIcon /> MANUEL D'UTILISATION
        </div>
        <h2>Comprendre la plateforme en quelques minutes</h2>
        <p>
          Une video guide les chercheurs pas a pas pour acceder a la plateforme,
          se connecter et soumettre une demande de boursse.
        </p>
        <div className="manuel-divider" />
      </div>

      <div className="manuel-card">
        <div className="manuel-card-header">
          <div className="manuel-avatar">
            <PlayIcon />
          </div>
          <div>
            <h4>Guide video</h4>
            <span>Acces, connexion et depot de demande</span>
          </div>
        </div>

        <div className="manuel-video-shell">
          <video
            className="manuel-video"
            controls
            preload="metadata"
            onLoadedMetadata={() => setHasVideo(true)}
            onCanPlay={() => setHasVideo(true)}
            onError={() => setHasVideo(false)}
          >
            <source src={VIDEO_PATH} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture video.
          </video>
          {!hasVideo && (
            <div className="manuel-video-placeholder">
              <PlayIcon />
              <span>Deposez la video ici :</span>
              <strong>{VIDEO_PATH}</strong>
            </div>
          )}
        </div>

        <div className="manuel-steps">
          {steps.map((step) => (
            <div key={step} className="manuel-step">
              <span><CheckIcon /></span>
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="manuel-download-wrap">
        <a
          href={MANUAL_PDF_HREF}
          download="User Manual.pdf"
          className="cta-btn"
        >
          TELECHARGER LE MANUEL D&apos;UTILISATION
        </a>
      </div>
    </section>
  );
}
