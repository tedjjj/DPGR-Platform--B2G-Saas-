import { Link } from "react-router-dom";
import "./CTA.css";

// Main component exported: CTA.
export default function CTA() {
// Render the component JSX.
  return (
    <section className="cta-section">
      <span className="cta-dot dot-1"></span>
      <span className="cta-dot dot-2"></span>
      <span className="cta-dot dot-3"></span>
      <span className="cta-dot dot-4"></span>
      <span className="cta-dot dot-5"></span>

      <div className="cta-content">
        <h2 className="cta-title">Prêt à commencer votre parcourt scientifique ?</h2>
        <p className="cta-subtitle">
          Rejoignez notre communauté de chercheurs et bénéficiez de nos programmes de stages et séjours scientifiques.
        </p>

        <Link to="/login" className="cta-btn">
          Accéder à la plateforme <span className="cta-arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
