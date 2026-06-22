import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './forgot-password.css';
import { FaEnvelope, FaLock, FaArrowLeft, FaCheck } from 'react-icons/fa';
import logo from '../assets/esi_sejour_logo_w.png';
import {
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetForgottenPassword,
} from '../auth';

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { score: 0, label: '', color: 'transparent', width: '0%' },
    { score: 1, label: 'Faible', color: '#ef4444', width: '25%' },
    { score: 2, label: 'Moyen', color: '#f59e0b', width: '50%' },
    { score: 3, label: 'Bien', color: '#3b82f6', width: '75%' },
    { score: 4, label: 'Excellent', color: '#16a34a', width: '100%' },
  ];
  return levels[score];
}

const StepIndicator = ({ currentStep }) => {
  const steps = ['Identifiant', 'Code OTP', 'Nouveau mot de passe'];
  return (
    <div className="forgot-steps">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        return (
          <React.Fragment key={i}>
            <div className="forgot-step">
              <div className={`forgot-step-circle ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                {isDone ? <FaCheck size={12} /> : stepNum}
              </div>
              <span className={`forgot-step-label ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className={`forgot-step-line ${isDone ? 'done' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OtpInput = ({ value, onChange }) => {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else if (i > 0) {
        refs[i - 1].current.focus();
        next[i - 1] = '';
        onChange(next.join(''));
      }
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) {
      refs[i - 1].current.focus();
      return;
    }
    if (e.key === 'ArrowRight' && i < 5) {
      refs[i + 1].current.focus();
    }
  };

  const handleChange = (e, i) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const next = [...digits];
    next[i] = char;
    onChange(next.join(''));
    if (i < 5) refs[i + 1].current.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      refs[Math.min(pasted.length, 5)].current.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          className="otp-input"
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
};

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [identifier, setIdent] = useState('');
  const [otp, setOtp] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(newPwd);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) {
      setError("Veuillez saisir votre identifiant ou adresse e-mail.");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(identifier.trim());
      setOtp('');
      setCountdown(60);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length < 6) {
      setError('Veuillez saisir le code a 6 chiffres.');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetOtp(identifier.trim(), otp);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Code incorrect ou expire. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPwd) {
      setError('Veuillez saisir un nouveau mot de passe.');
      return;
    }
    if (newPwd.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caracteres.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await resetForgottenPassword(identifier.trim(), otp, newPwd);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(identifier.trim());
      setCountdown(60);
      setOtp('');
    } catch (err) {
      setError(err.message || 'Impossible de renvoyer le code. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <div className="forgot-logo">
          <img src={logo} alt="ESI Logo" />
        </div>

        <h2 className="forgot-title">Reinitialisation du mot de passe</h2>
        <p className="forgot-subtitle">
          {step === 1 && "Saisissez votre identifiant ou adresse e-mail pour recevoir un code de verification."}
          {step === 2 && <>Un code a 6 chiffres a ete envoye a l'adresse associee a <strong>{identifier}</strong>.</>}
          {step === 3 && 'Choisissez un nouveau mot de passe securise pour votre compte.'}
        </p>

        <StepIndicator currentStep={step} />

        {success ? (
          <div className="forgot-success">
            <div className="forgot-success-icon">
              <FaCheck size={28} color="#16a34a" />
            </div>
            <p className="forgot-success-title">Mot de passe reinitialise !</p>
            <p className="forgot-success-text">
              Votre mot de passe a ete mis a jour avec succes.
              <br />
              Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
            </p>
            <button className="forgot-btn" style={{ marginTop: 8 }} onClick={() => navigate('/login')}>
              SE CONNECTER
            </button>
          </div>
        ) : (
          <>
            {step === 1 && (
              <form onSubmit={handleStep1} className="forgot-form">
                <div className="input-container">
                  <div className="input-icon"><FaEnvelope size={16} /></div>
                  <input
                    type="text"
                    placeholder="Identifiant ou adresse e-mail"
                    className="input-field"
                    value={identifier}
                    onChange={(e) => setIdent(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="forgot-error">{error}</p>}
                <button type="submit" className="forgot-btn" disabled={loading}>
                  {loading ? 'ENVOI EN COURS...' : 'ENVOYER LE CODE'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2} className="forgot-form">
                <OtpInput value={otp} onChange={setOtp} />
                {error && <p className="forgot-error">{error}</p>}
                <button type="submit" className="forgot-btn" disabled={loading || otp.length < 6}>
                  {loading ? 'VERIFICATION...' : 'VERIFIER LE CODE'}
                </button>
                <div className="resend-row">
                  Vous n'avez pas recu de code ?{' '}
                  <button
                    type="button"
                    className="resend-btn"
                    disabled={countdown > 0 || loading}
                    onClick={handleResend}
                  >
                    {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer'}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleStep3} className="forgot-form">
                <div className="input-container">
                  <div className="input-icon"><FaLock size={16} /></div>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Nouveau mot de passe"
                    className="input-field"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}
                    tabIndex={-1}
                  >
                    {showPwd ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {newPwd && (
                  <div className="password-strength">
                    <div className="strength-bar-track">
                      <div className="strength-bar-fill" style={{ width: strength.width, background: strength.color }} />
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}

                <div className="input-container">
                  <div className="input-icon"><FaLock size={16} /></div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirmer le mot de passe"
                    className="input-field"
                    value={confirmPwd}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{ background: 'none', border: 'none', padding: '0 12px', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' }}
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {error && <p className="forgot-error">{error}</p>}
                <button type="submit" className="forgot-btn" disabled={loading}>
                  {loading ? 'ENREGISTREMENT...' : 'REINITIALISER'}
                </button>
              </form>
            )}
          </>
        )}

        {!success && (
          <div className="forgot-note">
            <p>
              Pour des raisons de securite, le code de reinitialisation est <strong>valable 15 minutes</strong> a partir de la reception.
            </p>
            <p>
              Si vous n'etes pas a l'origine de cette demande, ignorez ce message et contactez l'<strong>administrateur</strong>.
            </p>
          </div>
        )}

        <button className="back-link" onClick={() => navigate('/login')}>
          <FaArrowLeft /> Retour a la connexion
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
