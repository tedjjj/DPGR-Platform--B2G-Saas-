import { authFetch, getApiBaseUrl } from './jwtClient';

const readJson = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const toAbsoluteFileUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${getApiBaseUrl().replace(/\/api$/, '')}${url}`;
};

const toStringList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : item?.name || item?.nom || item?.libelle || ''))
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return [];
};

const ensureOk = (response, data, fallbackMessage) => {
  if (response.ok) return;

  const detail = data?.detail;
  const msg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map(String).join(' ') : null);
  throw new Error(msg || data?.error || JSON.stringify(data) || fallbackMessage);
};

export const creerDemande = async (formData) => {
  const response = await authFetch('/demandes/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors de la creation de la demande');
  return data;
};

export const mettreAJourDemande = async (demandeId, formData) => {
  const response = await authFetch(`/demandes/${demandeId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors de la mise a jour de la demande');
  return data;
};

export const soumettreDemande = async (demandeId) => {
  const response = await authFetch(`/demandes/${demandeId}/soumettre/`, {
    method: 'POST',
  });

  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors de la soumission de la demande');
  return data;
};

export const annulerDemande = async (demandeId) => {
  const response = await authFetch(`/demandes/${demandeId}/annuler/`, {
    method: 'POST',
  });

  const data = await readJson(response);
  ensureOk(response, data, "Erreur lors de l'annulation de la demande");
  return data;
};

export const uploadDocumentDemande = async (demandeId, { fichier, type_document, est_obligatoire }) => {
  const formData = new FormData();
  formData.append('fichier', fichier);
  formData.append('type_document', type_document);
  formData.append('est_obligatoire', est_obligatoire ? 'true' : 'false');

  const response = await authFetch(`/demandes/${demandeId}/documents/`, {
    method: 'POST',
    body: formData,
  });

  const data = await readJson(response);
  ensureOk(response, data, "Erreur lors de l'upload du document");
  return {
    ...data,
    fileUrl: toAbsoluteFileUrl(data?.fichier || data?.file || data?.url || null),
  };
};

export const supprimerDocumentDemande = async (demandeId, documentId) => {
  const response = await authFetch(`/demandes/${demandeId}/documents/${documentId}/`, {
    method: 'DELETE',
  });

  if (response.status === 204) return;
  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors de la suppression du document');
};

export const getDocumentsDemande = async (demandeId) => {
  const response = await authFetch(`/demandes/${demandeId}/documents/`, { method: 'GET' });
  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors du chargement des documents');
  const documents = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
  return documents.map((doc) => ({
    ...doc,
    fileUrl: toAbsoluteFileUrl(doc?.fichier || doc?.file || doc?.url || null),
  }));
};

export const getTypesSejour = async () => {
  const response = await authFetch('/parametres/type-sejours/', { method: 'GET' });
  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors du chargement des types de sejour');
  return data;
};

export const getSessions = async () => {
  const response = await authFetch('/parametres/sessions/', { method: 'GET' });
  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors du chargement des sessions');
  return data;
};

export const getPays = async () => {
  const response = await authFetch('/parametres/pays/', { method: 'GET' });
  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors du chargement des pays');
  return (data || []).map((item) => ({
    ...item,
    name: item.name || item.nom || item.libelle || '',
    cities: toStringList(item.cities || item.villes || item.ville_list || item.destinations),
  }));
};

export const getCitiesByCountry = async (country) => {
  const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country }),
  });

  const data = await readJson(response);
  if (!response.ok || data?.error) {
    throw new Error(data?.msg || 'Erreur lors du chargement des villes');
  }

  return Array.isArray(data?.data) ? data.data : [];
};

export const terminerDemande = async (demandeId) => {
  const response = await authFetch(`/demandes/${demandeId}/terminer/`, {
    method: 'POST',
  });
  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors de la clôture de la demande');
  return data;
};
