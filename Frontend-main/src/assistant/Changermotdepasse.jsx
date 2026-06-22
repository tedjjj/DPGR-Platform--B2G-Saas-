
// State management using React hooks.
import React, { useState } from 'react';
import './Securite.css';
import { changePassword } from '../api/assistant';

// ── Icons ──
const LockIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);
// Small UI icon used in the interface.
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);
// Small UI icon used in the interface.
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
);
// Small UI icon used in the interface.
const SmallLockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);
// Small UI icon used in the interface.
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);

// ── Password strength checker ──
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 12)            score++;
  if (/[A-Z]/.test(pwd))          score++;
  if (/[a-z]/.test(pwd))          score++;
  if (/[0-9]/.test(pwd))          score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  const map = [
    { label: '',           color: '' },
    { label: 'Très faible', color: '#ef4444' },
    { label: 'Faible',      color: '#f59e0b' },
    { label: 'Moyen',       color: '#f59e0b' },
    { label: 'Fort',        color: '#22c55e' },
    { label: 'Très fort',   color: '#16a34a' },
  ];
  return { score, ...map[score] };
};

// ── Password field ──
// React component: PwdField.
const PwdField = ({ label, value, onChange, placeholder, hint, disabled }) => {
// State management using React hooks.
  const [show, setShow] = useState(false);
// Render the component JSX.
  return (
    <div className="sec-field">
      <label className="sec-label">{label} <span className="sec-required">*</span></label>
      <div className="sec-input-wrap">
        <span className="sec-input-icon"><SmallLockIcon /></span>
        <input
          className="sec-input"
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          className="sec-eye-btn"
          onClick={() => setShow(s => !s)}
          type="button"
          tabIndex={-1}
          disabled={disabled}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && <p className="sec-hint">{hint}</p>}
    </div>
  );
};

// ── Main Component ──
// React component: ChangerMotDePasse.
const ChangerMotDePasse = ({ onBack }) => {
// State management using React hooks.
  const [current,    setCurrent]  = useState('');
// State management using React hooks.
  const [next,       setNext]     = useState('');
// State management using React hooks.
  const [confirm,    setConfirm]  = useState('');
// State management using React hooks.
  const [logoutAll,  setLogout]   = useState(true);
// State management using React hooks.
  const [success,    setSuccess]  = useState(false);
// State management using React hooks.
  const [error,      setError]    = useState('');
// State management using React hooks.
  const [loading,    setLoading]  = useState(false);

  const strength = getStrength(next);

  // ── Client-side validation ──
  const validate = () => {
    if (!current || !next || !confirm) return 'Veuillez remplir tous les champs.';
    if (next.length < 12)             return 'Le mot de passe doit contenir au moins 12 caractères.';
    if (next !== confirm)             return 'Les mots de passe ne correspondent pas.';
    return null;
  };

  // ── Submit → POST /api/auth/change-password/ ──
  const handleSubmit = async () => {
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      // API expects old_password and new_password (mapped inside api.js)
      await changePassword(current, next);

      setSuccess(true);
      setCurrent(''); setNext(''); setConfirm('');
      setTimeout(() => setSuccess(false), 4000);

      // If the user chose to disconnect all other devices, trigger logout
      // Note: the backend's change-password endpoint currently invalidates
      // sessions server-side. The logoutAll checkbox is preserved for UX
      // clarity and future backend support.
      if (logoutAll) {
        // Optionally call a dedicated revoke-all endpoint here when available.
      }
    } catch (err) {
      // Map common backend error shapes to friendly messages
      if (err.status === 400) {
        const detail = err.data?.old_password?.[0]
          || err.data?.new_password?.[0]
          || err.data?.detail
          || err.data?.error
          || err.message
          || 'Mot de passe actuel incorrect.';
        setError(detail);
      } else if (err.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

// Render the component JSX.
  return (
    <div className="sec-page">
      <button className="sec-back-btn" onClick={onBack} disabled={loading}>
        <BackIcon /> Retour aux paramètres
      </button>

      <div className="sec-card">
        {/* Header */}
        <div className="sec-page-header">
          <div className="sec-page-icon"><LockIcon /></div>
          <h2 className="sec-page-title">Changer le mot de passe</h2>
          <p className="sec-page-sub">Assurez-vous d'utiliser un mot de passe fort et sécurisé</p>
        </div>

        {/* Fields */}
        <div className="sec-form">
          <PwdField
            label="Mot de passe actuel"
            value={current}
            onChange={setCurrent}
            placeholder="Entrez votre mot de passe actuel"
            disabled={loading}
          />

          <PwdField
            label="Nouveau mot de passe"
            value={next}
            onChange={setNext}
            placeholder="Entrez votre nouveau mot de passe"
            hint="Minimum 12 caractères avec majuscules, minuscules, chiffres et symboles"
            disabled={loading}
          />

          {/* Strength bar */}
          {next.length > 0 && (
            <div className="sec-strength">
              <div className="sec-strength-bars">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="sec-strength-bar"
                    style={{ background: i <= strength.score ? strength.color : '#e5e7eb' }}
                  />
                ))}
              </div>
              <span className="sec-strength-label" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}

          <PwdField
            label="Confirmer le nouveau mot de passe"
            value={confirm}
            onChange={setConfirm}
            placeholder="Confirmez votre nouveau mot de passe"
            disabled={loading}
          />

          {/* Logout all devices */}
          <div className="sec-logout-box">
            <input
              type="checkbox"
              id="logoutAll"
              checked={logoutAll}
              onChange={e => setLogout(e.target.checked)}
              className="sec-checkbox"
              disabled={loading}
            />
            <label htmlFor="logoutAll" className="sec-logout-label">
              <div className="sec-logout-title">Déconnecter tous les autres appareils</div>
              <div className="sec-logout-sub">
                Pour plus de sécurité, vous serez déconnecté de tous les appareils
              </div>
            </label>
          </div>

          {/* Error / success */}
          {error   && <p className="sec-error">⚠ {error}</p>}
          {success && <p className="sec-success">✅ Mot de passe modifié avec succès !</p>}

          {/* Actions */}
          <div className="sec-actions">
            <button className="sec-cancel-btn" onClick={onBack} disabled={loading}>
              Annuler
            </button>
            <button className="sec-submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Modification…' : 'Modifier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangerMotDePasse;
