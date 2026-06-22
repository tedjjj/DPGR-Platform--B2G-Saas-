
// Side effect hook for handling data or state updates.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Parametres.css';

import ChangerMotDePasse from './ChangerMotDePasse';
import SessionsActives   from './SessionsActives';

import {
  getCurrentUser,
  updateCurrentUser,
  getMyProfile,
  getSessions,
  createSession,
  updateSession,
  logout,
} from '../api/assistant';

// ── Icons ──
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
// Small UI icon used in the interface.
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);
// Small UI icon used in the interface.
const SessionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z" />
  </svg>
);
const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);
// Small UI icon used in the interface.
const CalendarSessionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H5V9h14v10z" />
  </svg>
);
// Small UI icon used in the interface.
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);
// Small UI icon used in the interface.
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ── Evaluation criteria (static — will be confirmed/overridden by API) ──
const defaultCriteria = [
  { id: 'nbSejours',   label: 'Nombre de stages ou séjours consommés',  description: 'Critère prioritaire pour le classement des demandes.' },
  { id: 'nbJours',     label: 'Nombre de jours consommés',               description: 'Mesure le volume déjà consommé par le demandeur.' },
  { id: 'dernierSejour', label: 'Date du dernier stage ou séjour',       description: 'Favorise les chercheurs les moins récemment bénéficiaires.' },
  { id: 'historique',  label: 'Historique du demandeur',                  description: 'Apporte un contexte supplémentaire sur les mobilités passées.' },
  { id: 'documents',   label: 'Complétude des justificatifs',             description: 'Vérifie la présence des invitations, programmes et pièces requises.' },
  { id: 'impact',      label: 'Impact scientifique attendu',               description: 'Met en avant les retombées scientifiques prévues du séjour.' },
];

const createCriteriaState = (overrides = {}) =>
  defaultCriteria.reduce((acc, c) => { acc[c.id] = overrides[c.id] ?? true; return acc; }, {});

// ── Date helpers ──
const toInputDate = (v) => {
  if (!v) return '';
  if (v.includes('-')) return v;
  const [d, m, y] = v.split('/');
  return `${y}-${m}-${d}`;
};
const toDisplayDate = (v) => {
  if (!v) return '';
  if (v.includes('/')) return v;
  const [y, m, d] = v.split('-');
  return `${d}/${m}/${y}`;
};

const createSessionDraft = (session) => ({
  id:         session?.id ?? null,
  nom:        session?.nom ?? '',
  ouverture:  toInputDate(session?.ouverture ?? ''),
  cloture:    toInputDate(session?.cloture   ?? ''),
  statut:     session?.statut ?? 'fermee',
  copiedFrom: '',
  criteres:   createCriteriaState(session?.criteres ?? {}),
  grilleEvaluation: session?.grilleEvaluation ?? null,
  nbSejoursMin: session?.nbSejoursMin ?? 1,
  anneesDepuisDernierSejour: session?.anneesDepuisDernierSejour ?? 2,
});

/**
 * Maps a backend session object to the shape used internally.
 * Adjust field names once the real /api/parametres/sessions/ response is known.
 */
const normaliseSession = (raw) => ({
  id:       raw.id,
  nom:      raw.annee_academique ?? raw.nom ?? raw.name ?? `Session ${raw.id}`,
  ouverture: toDisplayDate(raw.date_ouverture ?? raw.ouverture ?? ''),
  cloture:   toDisplayDate(raw.date_fermeture ?? raw.date_cloture ?? raw.cloture ?? ''),
  statut:   (raw.etat ?? raw.statut ?? (raw.is_active ? 'ouverte' : 'fermee')).toString().toLowerCase() === 'ouverte' ? 'ouverte' : 'fermee',
  criteres: createCriteriaState(raw.criteres ?? {}),
  grilleEvaluation: raw.grille_evaluation ?? null,
  nbSejoursMin: raw.nb_sejours_min ?? 1,
  anneesDepuisDernierSejour: raw.annees_depuis_dernier_sejour ?? 2,
});

// ── Shared UI components ──
// React component: Toggle.
const Toggle = ({ checked, onChange, disabled = false }) => (
  <button type="button" className={`pm-toggle ${checked ? 'on' : 'off'}`} onClick={() => !disabled && onChange(!checked)} disabled={disabled}>
    <span className="pm-toggle-thumb" />
  </button>
);

// React component: SectionHeader.
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="pm-section-header">
    <div className="pm-section-icon">{icon}</div>
    <div>
      <h3 className="pm-section-title">{title}</h3>
      <p className="pm-section-sub">{subtitle}</p>
    </div>
  </div>
);

// React component: Field.
const Field = ({ label, value, onChange, disabled, type = 'text' }) => (
  <div className="pm-field">
    <label className="pm-field-label">{label}</label>
    <input
      className="pm-field-input"
      type={type}
      value={value}
      onChange={e => onChange && onChange(e.target.value)}
      disabled={disabled}
    />
  </div>
);

// ── Session Modal ──
// React component: SessionModal.
const SessionModal = ({ mode, draft, sessions, error, saving, onClose, onFieldChange, onToggleCriterion, onCopyConfig, onSave }) => {
  if (!draft) return null;
  const isEdit = mode === 'edit';
  const criteriaLocked = isEdit && draft.statut === 'ouverte';
  const activeCriteriaCount = Object.values(draft.criteres).filter(Boolean).length;

// Render the component JSX.
  return (
    <div className="pm-modal-backdrop" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        <div className="pm-modal-header">
          <div>
            <h3 className="pm-modal-title">{isEdit ? 'Modifier la session' : 'Ouvrir une nouvelle session'}</h3>
            <p className="pm-modal-subtitle">{isEdit ? 'Mettez à jour les informations' : "Choisissez la configuration d'évaluation"}</p>
          </div>
          <button type="button" className="pm-modal-close" onClick={onClose}>×</button>
        </div>

        {criteriaLocked && (
          <div className="pm-session-alert pm-session-alert-compact">
            <AlertIcon />
            <span>Cette session est déjà ouverte. La grille ne peut plus être modifiée.</span>
          </div>
        )}
        {error && <div className="pm-session-error">{error}</div>}

        <div className="pm-fields-grid pm-modal-fields">
          <Field label="Nom de session" value={draft.nom} onChange={v => onFieldChange('nom', v)} />
          <div className="pm-field">
            <label className="pm-field-label">Statut</label>
            <select className="pm-field-select" value={draft.statut} onChange={e => onFieldChange('statut', e.target.value)} disabled={!isEdit}>
              <option value="ouverte">Ouverte</option>
              <option value="fermee">Fermée</option>
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-field-label">Date d'ouverture</label>
            <input
              className="pm-field-input"
              type="date"
              value={draft.ouverture}
              max={draft.cloture || undefined}
              onChange={e => onFieldChange('ouverture', e.target.value)}
            />
          </div>
          <div className="pm-field">
            <label className="pm-field-label">Date de clôture</label>
            <input
              className="pm-field-input"
              type="date"
              value={draft.cloture}
              min={draft.ouverture || undefined}
              onChange={e => onFieldChange('cloture', e.target.value)}
            />
          </div>
        </div>

        {!isEdit && (
          <div className="pm-field">
            <label className="pm-field-label">Reprendre la configuration existante</label>
            <select className="pm-field-select" value={draft.copiedFrom} onChange={e => onCopyConfig(e.target.value)}>
              <option value="">Configuration par défaut</option>
              {sessions.map(s => <option key={s.id} value={String(s.id)}>{s.nom}</option>)}
            </select>
          </div>
        )}

        <div className="pm-session-config-card">
          <div className="pm-session-config-header">
            <h4 className="pm-session-config-title">Configuration de la grille</h4>
            <div className="pm-session-badge">{activeCriteriaCount} critères actifs</div>
          </div>
          <div className="pm-criteria-list">
            {defaultCriteria.map(c => (
              <div key={c.id} className="pm-criteria-row">
                <div className="pm-criteria-text">
                  <span className="pm-criteria-label">{c.label}</span>
                  <span className="pm-criteria-sub">{c.description}</span>
                </div>
                <Toggle checked={draft.criteres[c.id]} onChange={() => onToggleCriterion(c.id)} disabled={criteriaLocked} />
              </div>
            ))}
          </div>
        </div>

        <div className="pm-modal-actions">
          <button type="button" className="pm-modal-secondary-btn" onClick={onClose} disabled={saving}>Annuler</button>
          <button type="button" className="pm-save-btn" onClick={onSave} disabled={saving}>
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Ouvrir la session'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Parametres Component ──
// React component: Parametres.
const Parametres = ({ avatarUrl, setAvatarUrl, setAvatarInitials }) => {
  const navigate = useNavigate();
// State management using React hooks.
  const [currentView, setCurrentView] = useState('menu');

  // ── Session state ──
  const [sessionList,   setSessionList]  = useState([]);
// State management using React hooks.
  const [sessionsLoading, setSessionsLoading] = useState(true);
// State management using React hooks.
  const [sessionSaved,  setSessionSaved] = useState(false);
// State management using React hooks.
  const [sessionSaving, setSessionSaving] = useState(false);
// State management using React hooks.
  const [modalMode,     setModalMode]    = useState(null);
// State management using React hooks.
  const [sessionDraft,  setSessionDraft] = useState(null);
// State management using React hooks.
  const [sessionError,  setSessionError] = useState('');

  // ── Profile state ──
  const [profileLoading, setProfileLoading] = useState(true);
// State management using React hooks.
  const [nom,   setNom]   = useState('');
// State management using React hooks.
  const [email, setEmail] = useState('');
// State management using React hooks.
  const [tel,   setTel]   = useState('');
// State management using React hooks.
  const [role,  setRole]  = useState('');
// State management using React hooks.
  const [saved, setSaved] = useState(false);
// State management using React hooks.
  const [profileError, setProfileError] = useState('');
// State management using React hooks.
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Avatar handlers (state is lifted to parent) ──


  // ── Fetch profile on mount ──
  useEffect(() => {
    (async () => {
      try {
        const [user, profile] = await Promise.all([
          getCurrentUser(),
          getMyProfile().catch(() => null),
        ]);
        setNom(`${user.nom ?? ''} ${user.prenom ?? ''}`.trim() || user.email);
        setEmail(user.email ?? '');
        setRole(user.role ?? '');
        setTel(user.telephone ?? profile?.telephone ?? profile?.tel_mobile ?? profile?.tel_fixe ?? profile?.tel ?? '');
        // push initials up so the header can show them immediately
        const fullName = `${user.nom ?? ''} ${user.prenom ?? ''}`.trim() || user.email || '';
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        const initials = parts.length === 0 ? '?' : parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        if (setAvatarInitials) setAvatarInitials(initials);
      } catch {
        setProfileError('Impossible de charger le profil.');
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

  // ── Fetch sessions on mount ──
  useEffect(() => {
    (async () => {
      try {
        const data = await getSessions();
        const raw = Array.isArray(data) ? data : (data?.results ?? []);
        setSessionList(raw.map(normaliseSession));
      } catch {
        // fallback to empty list — SuperAdmin may not have access
        setSessionList([]);
      } finally {
        setSessionsLoading(false);
      }
    })();
  }, []);

  // ── Profile save → PATCH /api/monprofil/ ──
  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileSaving(true);
    try {
      await updateCurrentUser({ telephone: tel.trim() });
      setTel(tel.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setProfileError(err?.message ?? 'Erreur lors de la sauvegarde.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Logout → POST /api/auth/logout/ ──
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // ── Session modal handlers ──
  const openEditSession = (s) => { setModalMode('edit');   setSessionDraft(createSessionDraft(s));    setSessionError(''); };
  const openNewSession  = ()  => { setModalMode('create'); setSessionDraft(createSessionDraft(null)); setSessionError(''); };
  const closeSessionModal = () => { setModalMode(null); setSessionDraft(null); setSessionError(''); };
  const updateSessionDraft = (k, v) => setSessionDraft(p => ({ ...p, [k]: v }));
  const toggleCriterion = (id) => setSessionDraft(p => ({ ...p, criteres: { ...p.criteres, [id]: !p.criteres[id] } }));

  const handleCopyConfig = (id) => {
    if (!id) { setSessionDraft(p => ({ ...p, copiedFrom: '', criteres: createCriteriaState() })); return; }
    const src = sessionList.find(s => String(s.id) === id);
    if (src) setSessionDraft(p => ({ ...p, copiedFrom: id, criteres: createCriteriaState(src.criteres) }));
  };

  // ── Save session → POST or PATCH /api/parametres/sessions/ ──
  const saveSession = async () => {
    if (!sessionDraft.nom.trim() || !sessionDraft.ouverture || !sessionDraft.cloture) {
      setSessionError('Champs obligatoires manquants.');
      return;
    }
    if (sessionDraft.ouverture >= sessionDraft.cloture) {
      setSessionError("La date d'ouverture doit être antérieure à la date de clôture.");
      return;
    }

    setSessionSaving(true);
    setSessionError('');

    // Build payload — adapt field names to match your backend model
    const payload = {
      annee_academique: sessionDraft.nom.trim(),
      date_ouverture: sessionDraft.ouverture,
      date_fermeture: sessionDraft.cloture,
      etat:           sessionDraft.statut === 'ouverte' ? 'OUVERTE' : 'FERMEE',
      grille_evaluation: sessionDraft.grilleEvaluation,
      nb_sejours_min: sessionDraft.nbSejoursMin,
      annees_depuis_dernier_sejour: sessionDraft.anneesDepuisDernierSejour,
    };

    try {
      let saved_session;
      if (modalMode === 'edit') {
        saved_session = await updateSession(sessionDraft.id, payload);
      } else {
        saved_session = await createSession(payload);
      }

      const norm = normaliseSession(saved_session);
      setSessionList(prev =>
        modalMode === 'edit'
          ? prev.map(s => s.id === norm.id ? norm : s)
          : [norm, ...prev]
      );

      closeSessionModal();
      setSessionSaved(true);
      setTimeout(() => setSessionSaved(false), 2500);
    } catch (err) {
      const msg = err?.message
        ?? err?.data?.detail
        ?? err?.data?.annee_academique?.[0]
        ?? err?.data?.date_ouverture?.[0]
        ?? err?.data?.date_fermeture?.[0]
        ?? err?.data?.non_field_errors?.[0]
        ?? "Erreur lors de l'enregistrement de la session.";
      setSessionError(msg);
    } finally {
      setSessionSaving(false);
    }
  };

  // ── Sub-view routing ──
  if (currentView === 'password') return <ChangerMotDePasse onBack={() => setCurrentView('menu')} />;
  if (currentView === 'sessions') return <SessionsActives  onBack={() => setCurrentView('menu')} />;

// Render the component JSX.
  return (
    <div className="pm-page">

      {/* 1. Session Management Card */}
      <div className="pm-card">
        <SectionHeader icon={<CalendarSessionIcon />} title="Gestion des Sessions" subtitle="Créez, ouvrez et consultez les sessions" />
        <div className="pm-session-alert">
          <AlertIcon />
          <span>La configuration de la grille ne peut plus être modifiée une fois ouverte.</span>
        </div>

        {sessionsLoading ? (
          <p style={{ padding: '16px', color: '#6b7280', textAlign: 'center' }}>Chargement des sessions…</p>
        ) : (
          <div className="pm-session-table-wrap">
            <table className="pm-session-table">
              <thead>
                <tr><th>Nom</th><th>Ouverture</th><th>Clôture</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {sessionList.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#6b7280', padding: '16px' }}>Aucune session trouvée.</td></tr>
                ) : sessionList.map(s => (
                  <tr key={s.id}>
                    <td>{s.nom}</td>
                    <td>{s.ouverture}</td>
                    <td>{s.cloture}</td>
                    <td><span className={`pm-session-status ${s.statut}`}>{s.statut === 'ouverte' ? 'Ouverte' : 'Fermée'}</span></td>
                    <td><button type="button" className="pm-session-edit-btn" onClick={() => openEditSession(s)}>Modifier</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pm-card-footer pm-session-footer-row">
          {sessionSaved && <span className="pm-save-confirm">Session enregistrée</span>}
          <button type="button" className="pm-session-add-btn" onClick={openNewSession} disabled={sessionsLoading}>
            <PlusIcon /> Ouvrir une session
          </button>
        </div>
      </div>

      {/* 2. Profile Card */}
      <div className="pm-card">
        <SectionHeader icon={<UserIcon />} title="Informations du profil" subtitle="Gérez vos informations personnelles" />

        {profileLoading ? (
          <p style={{ padding: '16px', color: '#6b7280', textAlign: 'center' }}>Chargement du profil…</p>
        ) : (
          <>
            {/* Avatar picker */}
            <div className="pm-fields-grid">
              <Field label="Nom complet"   value={nom}   disabled />
              <Field label="Adresse email" value={email} disabled />
              <Field label="Téléphone"     value={tel}   onChange={setTel} disabled={profileSaving} />
              <Field label="Rôle"          value={role}  disabled />
            </div>
          </>
        )}

        {profileError && <p className="sec-error" style={{ marginTop: '8px' }}>{profileError}</p>}

        <div className="pm-card-footer">
          {saved && <span className="pm-save-confirm">Modifications enregistrées</span>}
          <button type="button" className="pm-save-btn" onClick={handleSaveProfile} disabled={profileLoading || profileSaving}>
            {profileSaving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* 3. Security Card */}
      <div className="pm-card">
        <SectionHeader icon={<LockIcon />} title="Sécurité" subtitle="Gérez vos paramètres de sécurité" />
        <div className="pm-security-list">
          <div className="pm-security-row" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('password')}>
            <div className="pm-security-icon"><LockIcon /></div>
            <div className="pm-security-text">
              <span className="pm-security-label">Changer le mot de passe</span>
              <span className="pm-security-sub">Sécurisez votre compte</span>
            </div>
            <ChevronRight />
          </div>
          <div className="pm-security-row" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('sessions')}>
            <div className="pm-security-icon"><SessionIcon /></div>
            <div className="pm-security-text">
              <span className="pm-security-label">Sessions actives</span>
              <span className="pm-security-sub">Gérer les appareils connectés</span>
            </div>
            <ChevronRight />
          </div>
        </div>
      </div>

      {/* Logout */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', paddingBottom: '40px' }}>
        <button className="mp-logout-btn" onClick={handleLogout}>
          <IconLogout /> Se déconnecter
        </button>
      </div>

      <SessionModal
        mode={modalMode}
        draft={sessionDraft}
        sessions={sessionList}
        error={sessionError}
        saving={sessionSaving}
        onClose={closeSessionModal}
        onFieldChange={updateSessionDraft}
        onToggleCriterion={toggleCriterion}
        onCopyConfig={handleCopyConfig}
        onSave={saveSession}
      />
    </div>
  );
};

export default Parametres;
