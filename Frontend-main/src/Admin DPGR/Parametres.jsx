
// Side effect hook for handling data or state updates.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideBar from './AdminSideBar';
import './Parametres.css';
import ChangerMotDePasse from './ChangerMotDePasse';
import api from '../api/AdminDPGR';
import { logoutUser } from '../auth';

/* ── Icons ── */
const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Main component exported: Parametres.
export default function Parametres({ notifCount, onNavigate }) {
  const navigate = useNavigate();
// State management using React hooks.
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
  });
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState(null);
// State management using React hooks.
  const [saving, setSaving] = useState(false);
// State management using React hooks.
  const [success, setSuccess] = useState(null);
// State management using React hooks.
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ✅ Charger les données de l'utilisateur au démarrage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userProfile = await api.users.profile();
        
        setForm({
          nom: userProfile.nom || '',
          prenom: userProfile.prenom || '',
          email: userProfile.email || '',
        });
      } catch (err) {
        console.error('Erreur chargement profil:', err);
        setError(err.message || 'Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.users.updateProfile({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
      });
      setSuccess('Modifications enregistrées avec succès !');
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login', { replace: true });
  };

// Render the component JSX.
  return (
    <div className="pm-shell">
      <AdminSideBar activePage="parametres" onNavigate={onNavigate} />

      <div className="pm-main">
        {/* Header */}
        <header className="pm-header">
          <h1 className="pm-header-title">Paramètres</h1>
          <div className="pm-header-right">
            <button className="pm-notif-btn" onClick={() => onNavigate('notifications')} style={{ position: 'relative' }}>
              <IconBell />
              {notifCount > 0 && <span className="ad-notif-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>{notifCount}</span>}
            </button>
            <div className="pm-avatar">FA</div>
          </div>
        </header>

        <main className="pm-body">

          {/* ✅ Loading state */}
          {loading && (
            <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              Chargement du profil...
            </p>
          )}

          {/* ✅ Error state */}
          {error && !loading && (
            <p style={{ color: 'red', textAlign: 'center', padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
              {error}
            </p>
          )}

          {/* ✅ Success message */}
          {success && (
            <p style={{ color: 'green', textAlign: 'center', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
              {success}
            </p>
          )}

          {!loading && !error && (
            <>
              {/* ── Informations du profil ── */}
              <div className="pm-card">
                <div className="pm-section-header">
                  <div className="pm-section-icon pm-section-icon--navy"><IconUser /></div>
                  <h3 className="pm-section-title">Informations du profil</h3>
                </div>

                <div className="pm-fields">
                  <div className="pm-field">
                    <label className="pm-label">Prénom</label>
                    <input
                      className="pm-input"
                      value={form.prenom}
                      onChange={set('prenom')}
                      placeholder="Prénom"
                      disabled={saving}
                    />
                  </div>
                  <div className="pm-field">
                    <label className="pm-label">Nom</label>
                    <input
                      className="pm-input"
                      value={form.nom}
                      onChange={set('nom')}
                      placeholder="Nom"
                      disabled={saving}
                    />
                  </div>
                  <div className="pm-field">
                    <label className="pm-label">Email</label>
                    <input
                      className="pm-input"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="email@esi.dz"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* ── Sécurité ── */}
              <div className="pm-card">
                <div className="pm-section-header">
                  <div className="pm-section-icon pm-section-icon--navy"><IconLock /></div>
                  <h3 className="pm-section-title">Sécurité</h3>
                </div>

                <button 
                  className="pm-pwd-btn" 
                  onClick={() => setShowPasswordModal(true)}
                  disabled={saving}
                >
                  Changer le mot de passe
                </button>
              </div>

              {/* ── Save button ── */}
              <button 
                className="pm-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>

              <div className="pm-logout-wrap">
                <button
                  type="button"
                  className="mp-logout-btn"
                  onClick={handleLogout}
                  disabled={saving}
                >
                  <IconLogout /> Se déconnecter
                </button>
              </div>
            </>
          )}

        </main>
      </div>

      {showPasswordModal && (
        <ChangerMotDePasse onBack={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
