
// Side effect hook for handling data or state updates.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SideBarAdmin from './SideBarAdmin';
import './Utulisateur.css';
import NouveuUtulisateur from './NouveuUtulisateur';
import { createUser, deleteUser, getUsers, toggleUserActive } from '../api/superAdmin';


const roleOptions = ['Tous', 'Chercheur', 'Admin DPGR', 'Assistant DPGR'];
const statusOptions = ['Tous', 'Actif', 'Inactif'];

const ROLE_TO_LABEL = {
  CHERCHEUR: 'Chercheur',
  ADMIN_DPGR: 'Admin DPGR',
  ASSISTANT_DPGR: 'Assistant DPGR',
  SUPER_ADMIN: 'Super Admin',
};

const LABEL_TO_ROLE = {
  Chercheur: 'CHERCHEUR',
  'Admin DPGR': 'ADMIN_DPGR',
  'Assistant DPGR': 'ASSISTANT_DPGR',
  'Super Admin': 'SUPER_ADMIN',
};

const roleColorMap = {
  CHERCHEUR: '#2b4f91',
  ADMIN_DPGR: '#c8a040',
  ASSISTANT_DPGR: '#1da74f',
  SUPER_ADMIN: '#6f7e93',
};

// Small UI icon used in the interface.
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10.5 3.5a7 7 0 1 0 4.4 12.4l4.1 4.1 1.4-1.4-4.1-4.1a7 7 0 0 0-5.8-11zM5.5 10.5a5 5 0 1 1 10 0 5 5 0 0 1-10 0z" />
  </svg>
);

// Small UI icon used in the interface.
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7.4 9.2 12 13.8l4.6-4.6 1.4 1.4-6 6-6-6 1.4-1.4z" />
  </svg>
);

// Small UI icon used in the interface.
const DotsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 7a1.7 1.7 0 1 1 0-3.4A1.7 1.7 0 0 1 12 7zm0 6.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zm0 6.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z" />
  </svg>
);

// Function: Utulisateur.
function Utulisateur({ onNavigate }) {
// State management using React hooks.
  const [search, setSearch] = useState('');
// State management using React hooks.
  const [roleFilter, setRoleFilter] = useState('Tous');
// State management using React hooks.
  const [statusFilter, setStatusFilter] = useState('Tous');
// State management using React hooks.
  const [isRoleOpen, setIsRoleOpen] = useState(false);
// State management using React hooks.
  const [isStatusOpen, setIsStatusOpen] = useState(false);
// State management using React hooks.
  const [openActionKey, setOpenActionKey] = useState(null);
// State management using React hooks.
  const [users, setUsers] = useState([]);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState('');
// State management using React hooks.
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
// State management using React hooks.
  const [createSaving, setCreateSaving] = useState(false);
// State management using React hooks.
  const [createError, setCreateError] = useState('');

  const mapUser = (user) => {
    const firstName = user.prenom || '';
    const lastName = user.nom || '';
    const fallbackName = user.email?.split('@')[0] || 'Utilisateur';
    const fullName = `${firstName} ${lastName}`.trim() || fallbackName;
    const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
    return {
      id: user.id,
      key: user.id,
      initials,
      color: roleColorMap[user.role] || '#2b4f91',
      name: fullName,
      role: ROLE_TO_LABEL[user.role] || user.role,
      roleKey: user.role,
      email: user.email || '-',
      status: user.is_active ? 'Actif' : 'Inactif',
    };
  };

  const loadUsers = useCallback(async (selectedRole = roleFilter) => {
    try {
      setLoading(true);
      setError('');
      const roleValue = LABEL_TO_ROLE[selectedRole];
      const data = await getUsers(roleValue);
      setUsers(data.map(mapUser));
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

// Side effect hook for handling data or state updates.
  useEffect(() => {
    loadUsers(roleFilter);
  }, [loadUsers, roleFilter]);

  const handleToggleUser = async (userId) => {
    try {
      setError('');
      await toggleUserActive(userId);
      await loadUsers(roleFilter);
      setOpenActionKey(null);
    } catch (err) {
      setError(err.message || 'Erreur lors du changement de statut utilisateur.');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm('Supprimer cet utilisateur ?');
    if (!confirmed) return;

    try {
      setError('');
      await deleteUser(userId);
      await loadUsers(roleFilter);
      setOpenActionKey(null);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const handleCreateUser = async (payload) => {
    if (!payload.nom || !payload.prenom || !payload.email || !payload.password) {
      setCreateError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (payload.role === 'CHERCHEUR' && !payload.grade_id) {
      setCreateError('Veuillez selectionner un grade pour le chercheur.');
      return;
    }
    if (payload.password.length < 8) {
      setCreateError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    try {
      setCreateSaving(true);
      setCreateError('');
      await createUser(payload);
      setIsCreateModalOpen(false);
      await loadUsers(roleFilter);
    } catch (err) {
      setCreateError(err.message || "Erreur lors de la creation de l'utilisateur.");
    } finally {
      setCreateSaving(false);
    }
  };

  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === 'Tous' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'Tous' || user.status === statusFilter;
      const searchValue = search.trim().toLowerCase();
      const matchesSearch =
        searchValue.length === 0 ||
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue);
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, roleFilter, statusFilter, search]);

  const userStats = useMemo(() => {
    return {
      chercheurs: users.filter((user) => user.roleKey === 'CHERCHEUR').length,
      assistants: users.filter((user) => user.roleKey === 'ASSISTANT_DPGR').length,
      admins: users.filter((user) => user.roleKey === 'ADMIN_DPGR').length,
      inactifs: users.filter((user) => user.status === 'Inactif').length,
    };
  }, [users]);

// Render the component JSX.
  return (
    <SideBarAdmin title="Gestion des Utilisateurs" activeItem="utilisateurs" onNavigate={onNavigate}>
      <div className="users-page" onClick={() => setOpenActionKey(null)}>
        {error && <p className="param-feedback param-feedback--error">{error}</p>}
        {loading && <p className="param-feedback">Chargement des utilisateurs...</p>}
        <section className="users-table-card">
          <div className="users-tools-row">
            <div className="search-input-wrap">
              <SearchIcon />
              <input
                type="text"
                placeholder="Rechercher par nom ou email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="users-filter-wrap">
              <button
                type="button"
                className="users-filter-btn"
                onClick={() => {
                  setIsRoleOpen((prev) => !prev);
                  setIsStatusOpen(false);
                }}
              >
                <span>Role: {roleFilter}</span>
                <ChevronDownIcon />
              </button>
              {isRoleOpen && (
                <div className="users-dropdown-list">
                  {roleOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={roleFilter === option ? 'is-selected' : ''}
                      onClick={() => {
                        setRoleFilter(option);
                        setIsRoleOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="users-filter-wrap">
              <button
                type="button"
                className="users-filter-btn"
                onClick={() => {
                  setIsStatusOpen((prev) => !prev);
                  setIsRoleOpen(false);
                }}
              >
                <span>Statut: {statusFilter}</span>
                <ChevronDownIcon />
              </button>
              {isStatusOpen && (
                <div className="users-dropdown-list">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={statusFilter === option ? 'is-selected' : ''}
                      onClick={() => {
                        setStatusFilter(option);
                        setIsStatusOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="new-user-btn-top"
              onClick={() => {
                setCreateError('');
                setIsCreateModalOpen(true);
              }}
            >
              + Creer un nouvel utilisateur
            </button>
          </div>

          <div className="users-table-head">
            <span>Utilisateur</span>
            <span>Role</span>
            <span>Statut</span>
            <span>Actions</span>
          </div>

          <div className="users-table-body">
            {filteredData.map((user) => (
              <article key={user.key} className="users-row">
                <div className="users-cell user-col">
                  <div className="avatar-dot" style={{ backgroundColor: user.color }}>
                    {user.initials}
                  </div>
                  <div className="identity-text">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                </div>

                <div className="users-cell">{user.role}</div>

                <div className="users-cell">
                  <span className={`status-pill ${user.status === 'Actif' ? 'is-active' : 'is-inactive'}`}>
                    {user.status}
                  </span>
                </div>

                <div className="users-cell action-col" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    className="row-action-btn"
                    onClick={() => setOpenActionKey((prev) => (prev === user.key ? null : user.key))}
                  >
                    <DotsIcon />
                  </button>
                  {openActionKey === user.key && (
                    <div className="row-action-menu">
                      <button type="button" onClick={() => handleToggleUser(user.id)}>
                        {user.status === 'Actif' ? 'Desactiver' : 'Activer'}
                      </button>
                      <button type="button" className="is-delete" onClick={() => handleDeleteUser(user.id)}>
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="users-bottom-stats">
          <article className="mini-stat is-blue">
            <h3>{userStats.chercheurs}</h3>
            <p>Chercheurs</p>
          </article>
          <article className="mini-stat is-gold">
            <h3>{userStats.assistants}</h3>
            <p>Assistants DPGR</p>
          </article>
          <article className="mini-stat is-green">
            <h3>{userStats.admins}</h3>
            <p>Admins DPGR</p>
          </article>
          <article className="mini-stat is-red">
            <h3>{userStats.inactifs}</h3>
            <p>Inactifs</p>
          </article>
        </section>
      </div>
      <NouveuUtulisateur
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (createSaving) return;
          setIsCreateModalOpen(false);
          setCreateError('');
        }}
        onSave={handleCreateUser}
        saving={createSaving}
        error={createError}
      />
    </SideBarAdmin>
  );
}

export default Utulisateur;
