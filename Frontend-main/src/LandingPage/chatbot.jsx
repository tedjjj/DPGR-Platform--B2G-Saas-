import { useState } from "react";
import { getApiBaseUrl } from "../api/jwtClient";
import "./Chatbot.css";

// ── Icons ──
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4.2 2.4-7.3L2 9.4h7.6z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9l20-7z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const FAQ_TAGS = [
  "Critères d'éligibilité",
  "Durée d'un stage",
  "Budget autorisé",
  "Délais de traitement",
];

export default function Chatbot() {
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email || !question) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError("");
    setAnswer(null);

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/ask/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi de la question");
      }

      // Le backend renvoie { question, answer } ou { question, answer: null, message: "..." }
      if (data.answer) {
        setAnswer(data.answer);
      } else if (data.message) {
        setAnswer(data.message);
      } else {
        setAnswer("Aucune réponse n'a pu être générée.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chatbot-section">

      <div className="chatbot-top">
        <div className="chatbot-badge">
          <SparkleIcon /> ASSISTANCE INSTANTANÉE
        </div>
        <h2>Une question ? Posez-la à notre chatbot</h2>
        <p>Obtenez des réponses instantanées sur les procédures, les critères d'éligibilité et les délais</p>
        <div className="header-divider" />
      </div>

      <div className="chatbot-card">

        <div className="card-header">
          <div className="avatar"><ChatIcon /></div>
          <div className="card-header-info">
            <h4>Assistant DPGR</h4>
            <span className="online">
              <span className="dot" /> En ligne
            </span>
          </div>
        </div>

        <div className="card-body">
          <div>
            <div className="field-label"><MailIcon /> Votre adresse e-mail</div>
            <input
              className="field-input"
              type="email"
              placeholder="exemple@esi.dz"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="field-label"><MessageIcon /> Votre question</div>
            <textarea
              className="field-textarea"
              placeholder="Quels sont les critères d'éligibilité pour un stage de perfectionnement ?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
          </div>

          {/* Réponse */}
          {answer && (
            <div style={{
              background: 'var(--bg-card, #f8f9fa)',
              border: '1px solid var(--border, #e0e0e0)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}>
              <strong>Réponse :</strong>
              <p style={{ marginTop: '8px' }}>{answer}</p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>
          )}

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Envoi en cours...' : <> Envoyer ma question <SendIcon /> </>}
          </button>

          <div className="guarantee">
            <SparkleIcon /> Réponse sous 24h maximum
          </div>
        </div>

        <div className="faq-section">
          <div className="faq-title">Questions fréquentes :</div>
          <div className="faq-tags">
            {FAQ_TAGS.map(tag => (
              <button key={tag} className="faq-tag" onClick={() => setQuestion(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chatbot-footer">
        <span className="footer-item"><CheckCircleIcon /> Réponses certifiées DPGR</span>
        <span className="footer-item"><CheckCircleIcon /> Données sécurisées</span>
      </div>

    </section>
  );
}
