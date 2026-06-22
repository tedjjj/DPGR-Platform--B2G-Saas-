
// Side effect hook for handling data or state updates.
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './NouveuUtulisateur.css';
import { getGrades } from '../api/superAdmin';

const roleOptions = [
  { value: 'CHERCHEUR', label: 'Chercheur' },
  { value: 'ADMIN_DPGR', label: 'Admin DPGR' },
  { value: 'ASSISTANT_DPGR', label: 'Assistant DPGR' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

// Function: NouveuUtulisateur.
function NouveuUtulisateur({ isOpen, onClose, onSave, saving = false, error = '' }) {
// State management using React hooks.
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: 'CHERCHEUR',
    grade_id: '',
    password: '',
  });
// State management using React hooks.
  const [grades, setGrades] = useState([]);
// State management using React hooks.
  const [gradesLoading, setGradesLoading] = useState(false);
// State management using React hooks.
  const [gradesError, setGradesError] = useState('');

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (!isOpen) {
      setForm({
        nom: '',
        prenom: '',
        email: '',
        role: 'CHERCHEUR',
        grade_id: '',
        password: '',
      });
      setGradesError('');
    }
  }, [isOpen]);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (!isOpen) return;

    const loadGrades = async () => {
      try {
        setGradesLoading(true);
        setGradesError('');
        const data = await getGrades();
        setGrades(data);
      } catch (err) {
        setGradesError(err.message || 'Impossible de charger les grades.');
      } finally {
        setGradesLoading(false);
      }
    };

    loadGrades();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'role' && value !== 'CHERCHEUR' ? { grade_id: '' } : {}),
    }));
  };

  const handleSubmit = async () => {
    await onSave?.({
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      role: form.role,
      ...(form.role === 'CHERCHEUR' ? { grade_id: form.grade_id } : {}),
      password: form.password,
    });
  };

  return createPortal(
    <div className="new-user-overlay">
      <div className="new-user-modal">
        <header className="new-user-header">
          <div>
            <p className="new-user-kicker">Administration</p>
            <h2>Creer un nouvel utilisateur</h2>
          </div>
          <button type="button" className="new-user-close-btn" aria-label="Fermer" onClick={onClose}>
            &times;
          </button>
        </header>

        <div className="new-user-form">
          {error ? <p className="new-user-error">{error}</p> : null}
          {gradesError ? <p className="new-user-error">{gradesError}</p> : null}

          <div className="new-user-grid">
            <div className="new-user-field">
              <label htmlFor="new-user-lastname">Nom</label>
              <input
                id="new-user-lastname"
                type="text"
                placeholder="Ex: Benali"
                value={form.nom}
                onChange={(event) => handleChange('nom', event.target.value)}
              />
            </div>

            <div className="new-user-field">
              <label htmlFor="new-user-firstname">Prenom</label>
              <input
                id="new-user-firstname"
                type="text"
                placeholder="Ex: Ahmed"
                value={form.prenom}
                onChange={(event) => handleChange('prenom', event.target.value)}
              />
            </div>
          </div>

          <div className="new-user-field">
            <label htmlFor="new-user-email">Adresse email</label>
            <input
              id="new-user-email"
              type="email"
              placeholder="exemple@esi.dz"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
            />
          </div>

          <div className="new-user-grid">
            <div className="new-user-field">
              <label htmlFor="new-user-role">Role</label>
              <select
                id="new-user-role"
                value={form.role}
                onChange={(event) => handleChange('role', event.target.value)}
              >
                {roleOptions.map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
            </div>

            {form.role === 'CHERCHEUR' ? (
              <div className="new-user-field">
                <label htmlFor="new-user-grade">Grade</label>
                <select
                  id="new-user-grade"
                  value={form.grade_id}
                  onChange={(event) => handleChange('grade_id', event.target.value)}
                  disabled={gradesLoading}
                >
                  <option value="">{gradesLoading ? 'Chargement...' : 'Selectionner un grade'}</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.nom}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <div className="new-user-field">
            <label htmlFor="new-user-password">Mot de passe provisoire</label>
            <input
              id="new-user-password"
              type="password"
              placeholder="Minimum 8 caracteres"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
            />
          </div>
        </div>

        <footer className="new-user-footer">
          <button type="button" className="new-user-btn cancel-btn" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button type="button" className="new-user-btn save-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default NouveuUtulisateur;
