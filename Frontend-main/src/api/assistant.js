
import { authFetch, getApiBaseUrl } from './jwtClient';

export const API_ORIGIN = (
  import.meta.env.VITE_API_URL ?? getApiBaseUrl().replace(/\/api\/?$/, '')
).replace(/\/$/, '');

const readJson = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const mapStatut = (statut) => {
  const map = {
    BROUILLON: 'Brouillon',
    SOUMISE: 'En attente',
    VERIFICATION_AUTOMATIQUE: 'A verifier',
    PREPARATION_CS: 'En CS',
    DELIBERATION_CS: 'En CS',
    DELIBERATION_CS_FIN: 'En CS',
    APPROUVE: 'Approuve',
    APPROUVEE: 'Approuve',
    REJETE: 'Rejete',
    REJETEE: 'Rejete',
    EN_ATTENTE: 'En attente',
    TERMINEE: 'Termine',
    CLOTUREE: 'Cloture',
    ANNULEE: 'Annule',
    DEMANDE_ANNULATION: 'En attente',
  };
  return map[statut] || statut;
};

const isDraftDemande = (demande) => demande?.statut === 'BROUILLON';

const buildDemandeTypeLabel = (typeSejour) =>
  typeSejour?.libelle || typeSejour?.code || typeSejour || '-';

const buildDemandeName = (demande) =>
  [demande?.chercheur_nom, demande?.chercheur_prenom].filter(Boolean).join(' ').trim();

const buildInitials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '??';

const normalizeDemande = (demande) => {
  const name = buildDemandeName(demande);

  return {
    ...demande,
    initials: buildInitials(name),
    name: name || 'Demande',
    status: mapStatut(demande?.statut),
    type: buildDemandeTypeLabel(demande?.type_sejour),
    location: [demande?.ville_accueil, demande?.destination].filter(Boolean).join(', '),
    dates: `${demande?.date_debut || ''} -> ${demande?.date_fin || ''}`,
  };
};

export const getAllDemandes = async () => {
  const [demandesRes, typesRes] = await Promise.all([
    authFetch('/demandes/'),
    authFetch('/parametres/type-sejours/'),
  ]);

  const demandes = await readJson(demandesRes);
  const types = await readJson(typesRes);

  if (!demandesRes.ok || !Array.isArray(demandes)) {
    throw new Error(
      (demandes && demandes.detail) || 'Impossible de charger les demandes'
    );
  }
  if (!typesRes.ok || !Array.isArray(types)) {
    throw new Error((types && types.detail) || 'Impossible de charger les types de sejour');
  }

  const typesMap = {};
  types.forEach((t) => {
    typesMap[t.id] = t.libelle;
  });

  return demandes
    .filter((d) => !isDraftDemande(d))
    .map((d) =>
      normalizeDemande({
        ...d,
        type_sejour: typesMap[d.type_sejour?.id ?? d.type_sejour] || d.type_sejour,
      })
    );
};

export const getDashboardStats = async () => {
  const res = await authFetch('/dashboard/assistant/');
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && data.detail) || 'Erreur dashboard');
  return data;
};

export const getNotifications = async (type = null) => {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const res = await authFetch(`/notifications/${query}`);
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error((data && data.detail) || 'Impossible de charger les notifications');
  }
  return Array.isArray(data) ? data : (data?.results ?? []);
};

export const markNotificationRead = async (id) => {
  const res = await authFetch(`/notifications/${id}/lire/`, { method: 'POST' });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error((data && data.detail) || 'Impossible de marquer la notification.');
  }
  return data;
};

export const markAllNotificationsRead = async () => {
  const res = await authFetch('/notifications/lire-tout/', { method: 'POST' });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error((data && data.detail) || 'Impossible de marquer toutes les notifications.');
  }
  return data;
};

export const logout = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const res = await authFetch('/auth/logout/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && data.detail) || 'Erreur lors de la deconnexion');
  return data;
};

export const changePassword = async (oldPassword, newPassword) => {
  const res = await authFetch('/auth/change-password/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
  const data = await readJson(res);
  if (!res.ok) {
    const err = new Error(data?.detail || data?.error || 'Erreur changement mot de passe');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const getCurrentUser = async () => {
  const res = await authFetch('/users/me/');
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && (data.detail || data.error)) || "Impossible de charger l'utilisateur");
  return data;
};

export const updateCurrentUser = async (payload) => {
  const res = await authFetch('/users/me/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && (data.detail || data.error)) || 'Erreur lors de la sauvegarde du profil');
  return data;
};

export const getMyProfile = async () => {
  const res = await authFetch('/monprofil/');
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && (data.detail || data.error)) || 'Impossible de charger le profil');
  return data;
};

export const updateMyProfile = async (payload) => {
  const res = await authFetch('/monprofil/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && (data.detail || data.error)) || 'Erreur lors de la sauvegarde du profil');
  return data;
};

export const getSessions = async () => {
  const res = await authFetch('/parametres/sessions/');
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && data.detail) || 'Impossible de charger les sessions');
  return data;
};

export const createSession = async (payload) => {
  const res = await authFetch('/parametres/sessions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) {
    const err = new Error(data?.detail || 'Erreur lors de la creation de la session');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const updateSession = async (id, payload) => {
  const res = await authFetch(`/parametres/sessions/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await readJson(res);
  if (!res.ok) {
    const err = new Error(data?.detail || 'Erreur lors de la mise a jour de la session');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const getActiveSessions = async () => {
  const res = await authFetch('/auth/sessions/');
  const data = await readJson(res);
  if (!res.ok) {
    const err = new Error((data && data.detail) || 'Impossible de charger les sessions actives');
    err.status = res.status;
    throw err;
  }
  return data;
};

export const revokeSession = async (id) => {
  const res = await authFetch(`/auth/sessions/${id}/revoke/`, { method: 'POST' });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && data.detail) || 'Impossible de deconnecter cet appareil');
  return data;
};

export const revokeAllOtherSessions = async () => {
  const res = await authFetch('/auth/sessions/revoke-all/', { method: 'POST' });
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && data.detail) || 'Impossible de deconnecter tous les appareils');
  return data;
};

export const getDemande = async (id) => {
  const res = await authFetch(`/demandes/${id}/`);
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && data.detail) || 'Impossible de charger la demande');
  if (isDraftDemande(data)) {
    throw new Error('Cette demande est encore en brouillon et reste visible uniquement par le chercheur.');
  }
  return normalizeDemande(data);
};

export const getDemandeDocuments = async (id) => {
  const res = await authFetch(`/demandes/${id}/documents/`);
  const data = await readJson(res);
  if (!res.ok) throw new Error((data && data.detail) || 'Impossible de charger les documents');
  return Array.isArray(data) ? data : (data?.results ?? []);
};

export const validateDemandeDocuments = async (id) => {
  const res = await authFetch(`/demandes/${id}/preparer-cs/`, {
    method: 'POST',
  });
  const data = await readJson(res);
  if (!res.ok) {
    throw new Error((data && data.detail) || 'Impossible de valider les documents');
  }
  return normalizeDemande(data);
};
