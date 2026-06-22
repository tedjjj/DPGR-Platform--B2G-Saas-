import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ChangerMotDePasse.css';
import { changePassword } from '../auth';

/* ── Icons ── */
const IconLock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconLockSm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ── Password Input ── */
function PasswordInput({ placeholder, value, onChange, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="cp-input-wrap">
        <span className="cp-input-icon"><IconLockSm /></span>
        <input
          className="cp-input"
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button className="cp-eye-btn" type="button" onClick={() => setShow(v => !v)}>
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {hint && <p className="cp-hint">{hint}</p>}
    </div>
  );
}

export default function ChangerMotDePasse({ onBack }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [disconnect, setDisconnect] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.actuel || !form.nouveau || !form.confirmer) {
      setError(t('Veuillez remplir tous les champs.'));
      return;
    }
    if (form.nouveau.length < 8) {
      setError(t('Le nouveau mot de passe doit contenir au moins 8 caractères.'));
      return;
    }
    if (form.nouveau !== form.confirmer) {
      setError(t('Les mots de passe ne correspondent pas.'));
      return;
    }
    setError('');

    try {
      await changePassword(form.actuel, form.nouveau);
      onBack(); // retour après succès
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="cp-overlay">
      <div className="cp-card">

        {/* Icon + Title */}
        <div className="cp-header">
          <div className="cp-lock-icon"><IconLock /></div>
          <h2 className="cp-title">{t("Changer le mot de passe")}</h2>
          <p className="cp-sub">{t("Assurez-vous d'utiliser un mot de passe fort et sécurisé")}</p>
        </div>

        {/* Error */}
        {error && <div className="cp-error">{error}</div>}

        {/* Fields */}
        <div className="cp-fields">
          <div className="cp-field">
            <label className="cp-label">{t("Mot de passe actuel")} <span className="cp-required">*</span></label>
            <PasswordInput
              placeholder={t("Entrez votre mot de passe actuel")}
              value={form.actuel}
              onChange={set('actuel')}
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">{t("Nouveau mot de passe")} <span className="cp-required">*</span></label>
            <PasswordInput
              placeholder={t("Entrez votre nouveau mot de passe")}
              value={form.nouveau}
              onChange={set('nouveau')}
              hint={t("Minimum 12 caractères avec majuscules, minuscules, chiffres et symboles")}
            />
          </div>

          <div className="cp-field">
            <label className="cp-label">{t("Confirmer le nouveau mot de passe")} <span className="cp-required">*</span></label>
            <PasswordInput
              placeholder={t("Confirmez votre nouveau mot de passe")}
              value={form.confirmer}
              onChange={set('confirmer')}
            />
          </div>

          {/* Disconnect toggle */}
          <div
            className={`cp-disconnect${disconnect ? ' cp-disconnect--on' : ''}`}
            onClick={() => setDisconnect(v => !v)}
          >
            <div className="cp-disconnect-check">
              <input type="checkbox" checked={disconnect} onChange={() => {}} />
            </div>
            <div>
              <p className="cp-disconnect-title">{t("Déconnecter tous les autres appareils")}</p>
              <p className="cp-disconnect-sub">{t("Pour plus de sécurité, vous serez déconnecté de tous les appareils")}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="cp-footer">
          <button className="cp-cancel-btn" onClick={onBack}>{t("Annuler")}</button>
          <button className="cp-submit-btn" onClick={handleSubmit}>{t("Modifier")}</button>
        </div>

      </div>
    </div>
  );
}
