
// Side effect hook for handling data or state updates.
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBarAdmin from './SideBarAdmin';
import './Parametre.css';
import { createSession, getSessions, updateSession } from '../api/superAdmin';
import { logoutUser } from '../auth';

// Small UI icon used in the interface.
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 2h2v2h6V2h2v2h2.5A2.5 2.5 0 0 1 22 6.5v13a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 19.5v-13A2.5 2.5 0 0 1 4.5 4H7V2zm12.5 8h-15v9.5c0 .3.2.5.5.5h14c.3 0 .5-.2.5-.5V10zM5 8h14.5V6.5a.5.5 0 0 0-.5-.5h-14a.5.5 0 0 0-.5.5V8z" />
  </svg>
);

// Small UI icon used in the interface.
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.2A9.8 9.8 0 1 0 21.8 12 9.8 9.8 0 0 0 12 2.2zm0 17.6a7.8 7.8 0 1 1 0-15.6 7.8 7.8 0 0 1 0 15.6zm1-12h-2v5.1l4.2 2.5 1-1.7-3.2-1.9V7.8z" />
  </svg>
);

// Small UI icon used in the interface.
const BellIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3a5.4 5.4 0 0 0-5.4 5.4v2.5c0 .7-.2 1.3-.6 1.8l-1.3 1.6A1.2 1.2 0 0 0 5.7 16h12.6a1.2 1.2 0 0 0 1-1.9l-1.3-1.6a3 3 0 0 1-.6-1.8V8.4A5.4 5.4 0 0 0 12 3zm0 18a2.8 2.8 0 0 0 2.6-1.8H9.4A2.8 2.8 0 0 0 12 21z" />
  </svg>
);
// Small UI icon used in the interface.
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NOTIF_STORAGE_KEY = 'superadmin-notification-settings';

const DEFAULT_NOTIFICATIONS = [
  { key: 'n1', label: 'Nouvelle demande soumise -> notifier Assistant DPGR', enabled: true },
  { key: 'n2', label: 'Demande approuvee/rejetee -> notifier Chercheur', enabled: true },
  { key: 'n3', label: 'Echeance de soumission du rapport proche -> notifier Chercheur', enabled: true },
  { key: 'n4', label: 'Rapport en retard -> notifier Admin DPGR', enabled: true },
  { key: 'n5', label: 'Session ouverte/fermee -> notifier tous les utilisateurs', enabled: true },
];

const formatSession = (session) => ({
  ...session,
  key: session.id,
  nom: session.annee_academique,
  dateOuverture: session.date_ouverture,
  dateCloture: session.date_fermeture,
  status: session.etat === 'OUVERTE' ? 'Ouverte' : 'Fermee',
});

const toDateInputValue = (value) => value || '';

// Function: Parametre.
function Parametre({ onNavigate }) {
  const navigate = useNavigate();
// State management using React hooks.
  const [sessions, setSessions] = useState([]);
// State management using React hooks.
  const [showSessionForm, setShowSessionForm] = useState(false);
// State management using React hooks.
  const [newSession, setNewSession] = useState({
    nom: '',
    dateOuverture: '',
    dateCloture: '',
    nbSejoursMin: 1,
    anneesDernierSejour: 2,
  });
// State management using React hooks.
  const [selectedSessionId, setSelectedSessionId] = useState(null);
// State management using React hooks.
  const [thresholds, setThresholds] = useState({
    nbSejoursMin: 1,
    anneesDernierSejour: 2,
  });
// State management using React hooks.
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [saving, setSaving] = useState(false);
// State management using React hooks.
  const [error, setError] = useState('');
// State management using React hooks.
  const [statusMessage, setStatusMessage] = useState('');

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const sessionData = await getSessions();
      const mappedSessions = sessionData.map(formatSession);
      setSessions(mappedSessions);

      const currentOpenSession = mappedSessions.find((session) => session.status === 'Ouverte');
      const selected = currentOpenSession || mappedSessions[0] || null;
      setSelectedSessionId(selected?.id || null);
      setThresholds({
        nbSejoursMin: selected?.nb_sejours_min ?? 1,
        anneesDernierSejour: selected?.annees_depuis_dernier_sejour ?? 2,
      });
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des sessions.');
    } finally {
      setLoading(false);
    }
  };

// Side effect hook for handling data or state updates.
  useEffect(() => {
    loadSessions();
    try {
      const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch {}
  }, []);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (!selectedSession) return;
    setThresholds({
      nbSejoursMin: selectedSession.nb_sejours_min ?? 1,
      anneesDernierSejour: selectedSession.annees_depuis_dernier_sejour ?? 2,
    });
  }, [selectedSession]);

  const toggleSessionState = async (session) => {
    try {
      setSaving(true);
      setError('');
      setStatusMessage('');

      if (session.status !== 'Ouverte' && sessions.some((item) => item.id !== session.id && item.status === 'Ouverte')) {
        setError("Une autre session est deja ouverte. Fermez-la avant d'en ouvrir une nouvelle.");
        return;
      }

      const nextEtat = session.status === 'Ouverte' ? 'FERMEE' : 'OUVERTE';
      await updateSession(session.id, { etat: nextEtat });
      setStatusMessage(`Session ${nextEtat === 'OUVERTE' ? 'ouverte' : 'fermee'} avec succes.`);
      await loadSessions();
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de statut de la session.');
    } finally {
      setSaving(false);
    }
  };

  const createNewSession = async () => {
    const nom = newSession.nom.trim();
    const dateOuverture = newSession.dateOuverture.trim();
    const dateCloture = newSession.dateCloture.trim();

    if (!nom || !dateOuverture || !dateCloture) {
      setError('Veuillez renseigner les informations obligatoires de la session.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');
      await createSession({
        annee_academique: nom,
        date_ouverture: dateOuverture,
        date_fermeture: dateCloture,
        etat: 'FERMEE',
        nb_sejours_min: Number(newSession.nbSejoursMin) || 1,
        annees_depuis_dernier_sejour: Number(newSession.anneesDernierSejour) || 2,
      });
      setNewSession({
        nom: '',
        dateOuverture: '',
        dateCloture: '',
        nbSejoursMin: 1,
        anneesDernierSejour: 2,
      });
      setShowSessionForm(false);
      setStatusMessage('Session creee avec succes.');
      await loadSessions();
    } catch (err) {
      setError(err.message || 'Erreur lors de la creation de la session.');
    } finally {
      setSaving(false);
    }
  };

  const saveThresholds = async () => {
    if (!selectedSessionId) {
      setError('Aucune session selectionnee.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');
      await updateSession(selectedSessionId, {
        nb_sejours_min: Number(thresholds.nbSejoursMin) || 1,
        annees_depuis_dernier_sejour: Number(thresholds.anneesDernierSejour) || 2,
      });
      setStatusMessage("Seuils d'eligibilite mis a jour.");
      await loadSessions();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise a jour des seuils.');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = () => {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications));
      setStatusMessage('Preferences de notifications enregistrees localement.');
      setError('');
    } catch {
      setError("Impossible d'enregistrer les preferences de notifications.");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login', { replace: true });
  };

// Render the component JSX.
  return (
    <SideBarAdmin title="Parametres Systeme" activeItem="parametres" onNavigate={onNavigate}>
      <div className="param-page">
        {error && <p className="param-feedback param-feedback--error">{error}</p>}
        {statusMessage && <p className="param-feedback param-feedback--success">{statusMessage}</p>}
        {loading && <p className="param-feedback">Chargement des parametres...</p>}

        <section className="param-card">
          <h2 className="param-title-row">
            <span className="param-title-icon is-blue">
              <CalendarIcon />
            </span>
            Gestion des Sessions
          </h2>
          <p className="param-warning">
            Ces donnees sont synchronisees avec l&apos;API des sessions. Une seule session peut etre ouverte a la fois.
          </p>

          <div className="session-table">
            <div className="session-head">
              <span>Nom de session</span>
              <span>Date d&apos;ouverture</span>
              <span>Date de cloture</span>
              <span>Statut</span>
              <span>Actions</span>
            </div>
            {sessions.map((session) => (
              <article
                key={session.id}
                className={`session-row ${selectedSessionId === session.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedSessionId(session.id)}
              >
                <span>{session.nom}</span>
                <span>{session.dateOuverture}</span>
                <span>{session.dateCloture}</span>
                <span>
                  <em className={`session-status ${session.status === 'Ouverte' ? 'is-open' : 'is-closed'}`}>
                    {session.status}
                  </em>
                </span>
                <span>
                  <button
                    type="button"
                    className="session-close-action-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSessionState(session);
                    }}
                  >
                    {session.status === 'Ouverte' ? 'Fermer' : 'Ouvrir'}
                  </button>
                </span>
              </article>
            ))}
          </div>

          {showSessionForm && (
            <div className="session-form-box">
              <label>
                Nom de session
                <input
                  type="text"
                  value={newSession.nom}
                  onChange={(event) => setNewSession((prev) => ({ ...prev, nom: event.target.value }))}
                />
              </label>
              <label>
                Date d&apos;ouverture
                <input
                  type="date"
                  value={toDateInputValue(newSession.dateOuverture)}
                  onChange={(event) =>
                    setNewSession((prev) => ({ ...prev, dateOuverture: event.target.value }))
                  }
                />
              </label>
              <label>
                Date de cloture
                <input
                  type="date"
                  value={toDateInputValue(newSession.dateCloture)}
                  onChange={(event) =>
                    setNewSession((prev) => ({ ...prev, dateCloture: event.target.value }))
                  }
                />
              </label>
              <label>
                Nb. sejours minimum
                <input
                  type="number"
                  min="0"
                  value={newSession.nbSejoursMin}
                  onChange={(event) =>
                    setNewSession((prev) => ({ ...prev, nbSejoursMin: event.target.value }))
                  }
                />
              </label>
              <label>
                Annees depuis dernier sejour
                <input
                  type="number"
                  min="0"
                  value={newSession.anneesDernierSejour}
                  onChange={(event) =>
                    setNewSession((prev) => ({ ...prev, anneesDernierSejour: event.target.value }))
                  }
                />
              </label>
              <div className="session-form-actions">
                <button type="button" className="session-cancel-btn" onClick={() => setShowSessionForm(false)}>
                  Annuler
                </button>
                <button type="button" className="session-save-btn" onClick={createNewSession}>
                  Enregistrer
                </button>
              </div>
            </div>
          )}

         
        </section>

        <section className="param-card">
          <h2 className="param-title-row">
            <span className="param-title-icon is-gold">
              <ClockIcon />
            </span>
            Seuils d&apos;eligibilite de la session
          </h2>

          <div className="session-selector-row">
            <label>
              Session cible
              <select
                value={selectedSessionId || ''}
                onChange={(event) => setSelectedSessionId(Number(event.target.value) || null)}
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.nom}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="delay-grid">
            <label>
              Nombre minimal de sejours
              <input
                type="number"
                min="0"
                value={thresholds.nbSejoursMin}
                onChange={(event) =>
                  setThresholds((prev) => ({ ...prev, nbSejoursMin: event.target.value }))
                }
              />
            </label>
            <label>
              Annees depuis le dernier sejour
              <input
                type="number"
                min="0"
                value={thresholds.anneesDernierSejour}
                onChange={(event) =>
                  setThresholds((prev) => ({ ...prev, anneesDernierSejour: event.target.value }))
                }
              />
            </label>
          </div>
          <button type="button" className="save-mini-btn" onClick={saveThresholds}>
            Enregistrer les seuils
          </button>
        </section>

        <section className="param-card">
          <h2 className="param-title-row">
            <span className="param-title-icon is-green">
              <BellIcon />
            </span>
            Parametres de Notifications
          </h2>
          <div className="notif-list">
            {notifications.map((item) => (
              <div key={item.key} className="notif-row">
                <span>{item.label}</span>
                <button
                  type="button"
                  className={`notif-switch ${item.enabled ? 'is-on' : ''}`}
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) => (n.key === item.key ? { ...n, enabled: !n.enabled } : n))
                    )
                  }
                  aria-label="Basculer la notification"
                >
                  <span />
                </button>
              </div>
            ))}
          </div>

          <div className="notif-channel">
            <strong>Canal de notification</strong>
            <label><input type="radio" name="canal" /> Email</label>
            <label><input type="radio" name="canal" /> In-app</label>
            <label><input type="radio" name="canal" defaultChecked /> Les deux</label>
          </div>

          <button type="button" className="save-mini-btn" onClick={saveNotifications}>
            Enregistrer les notifications
          </button>
        </section>

        <div className="param-logout-wrap">
          <button type="button" className="param-logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            Se déconnecter
          </button>
        </div>
      </div>
    </SideBarAdmin>
  );
}

export default Parametre;
