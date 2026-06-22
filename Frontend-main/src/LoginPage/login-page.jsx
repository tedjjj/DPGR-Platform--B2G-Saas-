import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './login-page.css';
import { FaUser, FaLock, FaSignOutAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginUser } from '../auth';
import logo from '../assets/esi_sejour_logo_w.png';

const FAQ_PDF_HREF = '/FAQ.pdf';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoingBack = () => {
    navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const role = await loginUser(username, password);

      if (role === 'CHERCHEUR') navigate('/chercheur');
      else if (role === 'ASSISTANT_DPGR') navigate('/assistant');
      else if (role === 'SUPER_ADMIN') navigate('/super-admin');
      else if (role === 'ADMIN_DPGR') navigate('/admin');
      else navigate('/chercheur');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <img src={logo} alt="Logo" />
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-container">
            <div className="input-icon">
              <FaUser size={16} />
            </div>
            <input
              type="text"
              placeholder="Identifiant"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-container">
            <div className="input-icon">
              <FaLock size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Afficher/Masquer le mot de passe"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>

          {error && <p style={{ color: 'red', fontSize: '13px', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'CONNEXION...' : 'SE CONNECTER'}
          </button>
        </form>

        <div className="login-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>Mot de passe oublié ?</a>
          <span className="login-links-divider">|</span>
          <a href={FAQ_PDF_HREF} download="FAQ.pdf">FAQ</a>
        </div>

        <div className="security-text">
          <p>
            Pour des raisons de sécurité, veuillez vous <strong>déconnecter</strong> et fermer votre navigateur lorsque vous avez fini d'accéder aux services authentifiés.
          </p>
          <p>
            L'adresse web commençant par <strong>https://esi.dpgr-gest.dz/esi/login</strong> garantit la sécurité du site sur lequel vous renseignez votre identifiant et mot de passe.
          </p>
        </div>

        <a type="button" className="back-link" onClick={handleGoingBack}>
          <FaSignOutAlt style={{ transform: 'scaleX(-1)' }} /> Revenir à l'accueil
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
