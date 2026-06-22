
/**
 * Central JWT fetch: same refresh endpoint as the backend, single-flight refresh, one retry on 401.
 */

const API_BASE = 'http://127.0.0.1:8000/api';

let refreshInFlight = null;

export const getApiBaseUrl = () => API_BASE;

const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('role');
};

// Function: authHeaderOrThrow.
function authHeaderOrThrow() {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Session expiree. Veuillez vous reconnecter.');
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * @returns {Promise<string|null>} new access, or null if refresh failed
 */
export async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      clearSession();
      return null;
    }

    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      clearSession();
      return null;
    }

    const data = await res.json();
    if (data.access) localStorage.setItem('access_token', data.access);
    if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    return data.access || null;
  })()
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

/**
 * Authenticated fetch. Retries once after a successful token refresh on 401.
 * @param {string} path - e.g. "/users/me/" (relative to API_BASE)
 * @param {RequestInit} init
 */
export async function authFetch(path, init = {}, isRetry = false) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = new Headers(init.headers || {});

  const { Authorization } = authHeaderOrThrow();
  headers.set('Authorization', Authorization);

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401 && !isRetry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      return authFetch(path, init, true);
    }
  }

  return response;
}

export { authHeaderOrThrow as getAuthHeaderOrThrow };
