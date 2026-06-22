
// Configuration API
const API_BASE_URL = 'http://localhost:8000/api';
export const API_ORIGIN = 'http://localhost:8000';

export const getToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

const apiCall = async (endpoint, options = {}) => {
  const { method = 'GET', body = null, headers = {} } = options;
  const token = getToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: defaultHeaders,
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        await refreshAccessToken();
        return apiCall(endpoint, options);
      }
      throw new Error(`API Error: ${response.status}`);
    }

    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error('Failed to refresh token');

    const data = await response.json();
    setTokens(data.access, refreshToken);
    return data.access;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

export const auth = {
  login: (email, password) =>
    apiCall('/auth/login/', {
      method: 'POST',
      body: { email, password },
    }),
};

export const demandes = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/demandes/?${query}`);
  },
  get: (id) => apiCall(`/demandes/${id}/`),
  create: (data) =>
    apiCall('/demandes/', { method: 'POST', body: data }),
  update: (id, data) =>
    apiCall(`/demandes/${id}/`, { method: 'PUT', body: data }),
  partialUpdate: (id, data) =>
    apiCall(`/demandes/${id}/`, { method: 'PATCH', body: data }),
  delete: (id) =>
    apiCall(`/demandes/${id}/`, { method: 'DELETE' }),
  approve: (id) =>
    apiCall(`/demandes/${id}/approuver/`, { method: 'POST', body: {} }),
  reject: (id, motif = '') =>
    apiCall(`/demandes/${id}/rejeter/`, { method: 'POST', body: { motif } }),
  updateNotesInternes: (id, notes_internes) =>
    apiCall(`/demandes/${id}/notes-internes/`, { method: 'PATCH', body: { notes_internes } }),
  updateStatus: (id, statut, motif = null) => {
    const body = { statut };
    if (motif) {
      body.motif = motif;
    }
    return apiCall(`/demandes/${id}/changer-statut/`, { method: 'PATCH', body });
  },
  documents: (id) => apiCall(`/demandes/${id}/documents/`),
  toExamine: () => apiCall('/demandes/?statut=DELIBERATION_CS'),
};

// ========== RAPPORTS ==========
export const rapports = {
  getByDemande: (demandeId) => apiCall(`/demandes/rapports/?demande=${demandeId}`),
};

export const users = {
  profile: () => apiCall('/users/me/'),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/users/?${query}`);
  },
  changePassword: (oldPassword, newPassword) =>
    apiCall('/auth/change-password/', {
      method: 'POST',
      body: { old_password: oldPassword, new_password: newPassword },
    }),
  updateProfile: (data) =>
    apiCall('/users/me/', { method: 'PATCH', body: data }),
};

export const parametres = {
  sessions: () => apiCall('/parametres/sessions/'),
  session: (id) => apiCall(`/parametres/sessions/${id}/`),
  grades: () => apiCall('/parametres/grades/'),
  laboratoires: () => apiCall('/parametres/laboratoires/'),
  pays: () => apiCall('/parametres/pays/'),
  typeSejour: () => apiCall('/parametres/type-sejours/'),
};

export const evaluations = {
  grilles: () => apiCall('/eval/grilles/'),
  grille: (id) => apiCall(`/eval/grilles/${id}/`),
  checkEligibilite: (demandeId) =>
    apiCall(`/eval/eligibilite/${demandeId}/`),
};

export const notifications = {
  list: (type = null) => {
    const query = type ? `?type_alerte=${type}` : '';
    return apiCall(`/notifications/${query}`);
  },
  markRead: (id) =>
    apiCall(`/notifications/${id}/lire/`, { method: 'POST' }),
  markAllRead: () =>
    apiCall('/notifications/lire-tout/', { method: 'POST' }),
};

export default {
  auth,
  demandes,
  rapports,
  users,
  parametres,
  evaluations,
  notifications,
  getToken,
  setTokens,
  clearTokens,
};
