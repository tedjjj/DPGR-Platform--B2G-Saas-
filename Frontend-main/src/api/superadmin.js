
import { authFetch } from './jwtClient';

const readJson = async (response) => {
  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (response.ok) return null;
    return {
      detail: text.trim().startsWith('<')
        ? 'Le serveur a renvoye une page HTML au lieu d une reponse JSON.'
        : text,
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    if (response.ok) return null;
    return { detail: text };
  }
};

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const normalizeObject = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (value.data && typeof value.data === 'object' && !Array.isArray(value.data)) {
      return value.data;
    }
    return value;
  }
  return {};
};

const getErrorMessage = (data, fallbackMessage) => {
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail.trim();
  if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim();

  if (data && typeof data === 'object') {
    const fieldErrors = Object.entries(data)
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((item) => `${field}: ${item}`);
        }
        if (typeof value === 'string') {
          return [`${field}: ${value}`];
        }
        return [];
      })
      .filter(Boolean);

    if (fieldErrors.length) {
      return fieldErrors.join(' ');
    }
  }

  return fallbackMessage;
};

const ensureOk = (response, data, fallbackMessage) => {
  if (response.ok) return;
  throw new Error(getErrorMessage(data, fallbackMessage));
};

const getCollection = async (path, fallbackMessage) => {
  const response = await authFetch(path, { method: 'GET' });
  const data = await readJson(response);
  ensureOk(response, data, fallbackMessage);
  return normalizeCollection(data);
};

const createResource = async (path, payload, fallbackMessage) => {
  const response = await authFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  ensureOk(response, data, fallbackMessage);
  return data;
};

const updateResource = async (path, payload, fallbackMessage) => {
  const response = await authFetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  ensureOk(response, data, fallbackMessage);
  return data;
};

const deleteResource = async (path, fallbackMessage) => {
  const response = await authFetch(path, { method: 'DELETE' });
  const data = await readJson(response);
  ensureOk(response, data, fallbackMessage);
  return data;
};

const getResource = async (path, fallbackMessage) => {
  const response = await authFetch(path, { method: 'GET' });
  const data = await readJson(response);
  ensureOk(response, data, fallbackMessage);
  return normalizeObject(data);
};

export const getZones = () =>
  getCollection('/parametres/zones/', 'Erreur lors du chargement des zones');

export const createZone = (payload) =>
  createResource('/parametres/zones/', payload, 'Erreur lors de la creation de la zone');

export const deleteZone = (zoneId) =>
  deleteResource(`/parametres/zones/${zoneId}/`, 'Erreur lors de la suppression de la zone');

export const getPays = () =>
  getCollection('/parametres/pays/', 'Erreur lors du chargement des pays');

export const createPays = (payload) =>
  createResource('/parametres/pays/', payload, 'Erreur lors de la creation du pays');

export const deletePays = (paysId) =>
  deleteResource(`/parametres/pays/${paysId}/`, 'Erreur lors de la suppression du pays');

export const getGrades = () =>
  getCollection('/parametres/grades/', 'Erreur lors du chargement des grades');

export const createGrade = (payload) =>
  createResource('/parametres/grades/', payload, 'Erreur lors de la creation du grade');

export const deleteGrade = (gradeId) =>
  deleteResource(`/parametres/grades/${gradeId}/`, 'Erreur lors de la suppression du grade');

export const getLaboratoires = () =>
  getCollection('/parametres/laboratoires/', 'Erreur lors du chargement des laboratoires');

export const createLaboratoire = (payload) =>
  createResource('/parametres/laboratoires/', payload, 'Erreur lors de la creation du laboratoire');

export const deleteLaboratoire = (laboratoireId) =>
  deleteResource(`/parametres/laboratoires/${laboratoireId}/`, 'Erreur lors de la suppression du laboratoire');

export const getTypeSejours = () =>
  getCollection('/parametres/type-sejours/', 'Erreur lors du chargement des types de sejour');

export const createTypeSejour = (payload) =>
  createResource('/parametres/type-sejours/', payload, 'Erreur lors de la creation du type de sejour');

export const deleteTypeSejour = (typeSejourId) =>
  deleteResource(`/parametres/type-sejours/${typeSejourId}/`, 'Erreur lors de la suppression du type de sejour');

export const getSessions = () =>
  getCollection('/parametres/sessions/', 'Erreur lors du chargement des sessions');

export const createSession = (payload) =>
  createResource('/parametres/sessions/', payload, 'Erreur lors de la creation de la session');

export const updateSession = (sessionId, payload) =>
  updateResource(`/parametres/sessions/${sessionId}/`, payload, 'Erreur lors de la mise a jour de la session');

export const getSuperAdminDashboard = () =>
  getResource('/dashboard/super-admin/', 'Erreur lors du chargement du tableau de bord super admin');

export const getUsers = (role) =>
  getCollection(
    role ? `/users/?role=${encodeURIComponent(role)}` : '/users/',
    'Erreur lors du chargement des utilisateurs'
  );

export const createUser = (payload) =>
  createResource('/users/', payload, "Erreur lors de la creation de l'utilisateur");

export const toggleUserActive = (userId) =>
  updateResource(`/users/${userId}/toggle_active/`, {}, 'Erreur lors du changement de statut utilisateur');

export const deleteUser = (userId) =>
  deleteResource(`/users/${userId}/`, "Erreur lors de la suppression de l'utilisateur");

export const getActionHistory = (action) =>
  getCollection(
    action ? `/logs/?action=${encodeURIComponent(action)}` : '/logs/',
    "Erreur lors du chargement de l'historique"
  );

// ════════════════════════════════════════════════════════════════
// GRILLES ET CRITÈRES (NOUVELLES FONCTIONS)
// ════════════════════════════════════════════════════════════════

export const getGrilleSession = (sessionId) =>
  getResource(
    `/parametres/sessions/${sessionId}/grille-eval/`,
    "Erreur lors du chargement de la grille"
  );

export const createGrilleSession = (sessionId, payload) =>
  createResource(
    `/parametres/sessions/${sessionId}/grille-eval/`,
    payload,
    "Erreur lors de la création de la grille"
  );

export const updateGrilleSession = (sessionId, payload) =>
  updateResource(
    `/parametres/sessions/${sessionId}/grille-eval/`,
    payload,
    "Erreur lors de la mise à jour de la grille"
  );

export const getCriteresSession = (sessionId) =>
  getCollection(
    `/parametres/sessions/${sessionId}/criteres/`,
    "Erreur lors du chargement des critères"
  );

export const createCritereSession = (sessionId, payload) =>
  createResource(
    `/parametres/sessions/${sessionId}/criteres/`,
    payload,
    "Erreur lors de la création du critère"
  );

export const updateCritereSession = (sessionId, critereId, payload) =>
  updateResource(
    `/parametres/sessions/${sessionId}/criteres/${critereId}/`,
    payload,
    "Erreur lors de la mise à jour du critère"
  );

export const deleteCritereSession = (sessionId, critereId) =>
  deleteResource(
    `/parametres/sessions/${sessionId}/criteres/${critereId}/`,
    "Erreur lors de la suppression du critère"
  );

// ════════════════════════════════════════════════════════════════
// RÉPONSES AUX CRITÈRES (CHERCHEUR - NOUVELLES FONCTIONS)
// ════════════════════════════════════════════════════════════════

export const createReponseCritere = (demandeId, payload) =>
  createResource(
    `/demandes/${demandeId}/reponses-criteres/`,
    payload,
    "Erreur lors de la soumission de la réponse"
  );

export const getReponsesCriteres = (demandeId) =>
  getCollection(
    `/demandes/${demandeId}/reponses-criteres/`,
    "Erreur lors du chargement des réponses"
  );

// ════════════════════════════════════════════════════════════════
// SCORE CRITÈRES (NOUVELLES FONCTIONS)
// ════════════════════════════════════════════════════════════════

export const getScoreCriteres = (demandeId) =>
  getResource(
    `/demandes/${demandeId}/score-criteres/`,
    "Erreur lors du chargement du score"
  );
