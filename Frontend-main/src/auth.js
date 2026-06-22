
const BASE_URL = 'http://127.0.0.1:8000/api';

const PASSWORD_RESET_ROUTES = {
  request: '/auth/password-reset/request/',
  verify: '/auth/password-reset/verify/',
  confirm: '/auth/password-reset/confirm/',
};

const PASSWORD_RESET_NOT_SUPPORTED_MESSAGE =
  "La réinitialisation du mot de passe n'est pas disponible sur ce serveur pour le moment.";

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const getApiErrorMessage = (data, fallbackMessage) => {
  if (!data) return fallbackMessage;

  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.message === 'string') return data.message;

  return fallbackMessage;
};

const postPublicJson = async (path, body, fallbackMessage) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await parseJsonSafely(response);

  if (response.status === 404) {
    throw new Error(PASSWORD_RESET_NOT_SUPPORTED_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, fallbackMessage));
  }

  return data;
};

// 1. LOGIN
export const loginUser = async (email, password) => {
  
  // Étape 1 : récupérer le token
  const response = await fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Identifiant ou mot de passe incorrect');
  }

  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);

  // Étape 2 : récupérer le rôle
  const meResponse = await fetch(`${BASE_URL}/users/me/`, {
    headers: {
      'Authorization': `Bearer ${data.access}`,
    }
  });

  const meData = await meResponse.json();
  localStorage.setItem('role', meData.role);

  return meData.role;
};

// 2. LOGOUT
export const logoutUser = async () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  if (accessToken && refreshToken) {
    try {
      await fetch(`${BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    } catch {
      // The local session is still cleared even if the server is unreachable.
    }
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('role');
};

// 3. VERIFICATION
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const getRole = () => {
  return localStorage.getItem('role');
};

export const changePassword = async (old_password, new_password) => {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${BASE_URL}/auth/change-password/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ old_password, new_password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Erreur lors du changement de mot de passe');
  }

  return data;
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`http://127.0.0.1:8000/api/users/me/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};

export const requestPasswordReset = async (identifier) => {
  return postPublicJson(
    PASSWORD_RESET_ROUTES.request,
    { identifier },
    "Impossible d'envoyer le code de réinitialisation."
  );
};

export const verifyPasswordResetOtp = async (identifier, otp) => {
  return postPublicJson(
    PASSWORD_RESET_ROUTES.verify,
    { identifier, otp },
    'Code incorrect ou expire.'
  );
};

export const resetForgottenPassword = async (identifier, otp, new_password) => {
  return postPublicJson(
    PASSWORD_RESET_ROUTES.confirm,
    { identifier, otp, new_password },
    'Impossible de reinitialiser le mot de passe.'
  );
};
