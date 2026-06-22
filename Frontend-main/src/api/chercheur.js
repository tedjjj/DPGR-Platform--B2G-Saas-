import { authFetch, getApiBaseUrl } from './jwtClient';

const BASE_URL = getApiBaseUrl();

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

const ensureOk = (response, data, fallbackMessage) => {
  if (response.ok) return;

  const detail = typeof data === 'string' ? data : data?.detail;
  throw new Error(detail || data?.error || fallbackMessage);
};

const normalizeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const getResponseDetail = (data, fallbackMessage) => {
  if (typeof data === 'string') return data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.error === 'string') return data.error;
  return fallbackMessage;
};

const getRapportDemandeId = (rapport) => {
  const demande = rapport?.demande;
  if (typeof demande === 'number') return demande;
  if (typeof demande === 'string') return Number(demande) || demande;
  if (typeof demande?.id === 'number') return demande.id;
  if (typeof demande?.id === 'string') return Number(demande.id) || demande.id;
  return null;
};

const mapStatut = (statut) => {
  const map = {
    BROUILLON: 'Brouillon',
    SOUMISE: 'Soumise',
    VERIFICATION_AUTOMATIQUE: 'Verification automatique',
    PREPARATION_CS: 'Preparation CS',
    DELIBERATION_CS: 'Deliberation CS',
    APPROUVEE: 'Approuvee',
    REJETEE: 'Rejetee',
    EN_ATTENTE: 'En attente',
    TERMINEE: 'Terminee',
    DEMANDE_ANNULATION: 'Demande annulation',
    DELIBERATION_CS_FIN: 'Deliberation CS fin',
    CLOTUREE: 'Cloturee',
    ANNULEE: 'Annulee',
  };

  return map[statut] || statut;
};

const fetchAuthenticatedJson = async (path, fallbackMessage) => {
  const response = await authFetch(path, { method: 'GET' });
  const data = await readJson(response);
  ensureOk(response, data, fallbackMessage);
  return data;
};

const getDemandesCollection = async (fallbackMessage = 'Erreur lors de la recuperation des demandes') =>
  dedupeAccidentalDrafts(normalizeCollection(await fetchAuthenticatedJson('/demandes/', fallbackMessage)));

const dedupeAccidentalDrafts = (demandes) => {
  const seenDraftKeys = new Set();

  return demandes
    .slice()
    .sort((a, b) => b.id - a.id)
    .filter((demande) => {
      if (demande.statut !== 'BROUILLON') {
        return true;
      }

      const draftKey = [
        demande.destination,
        demande.ville_accueil,
        demande.institution_accueil,
        demande.date_debut,
        demande.date_fin,
        demande.objectifs_scientifiques,
        demande.pays,
        demande.session,
      ].join('|');

      if (seenDraftKeys.has(draftKey)) {
        return false;
      }

      seenDraftKeys.add(draftKey);
      return true;
    });
};

const mapDemandeForList = (demande, documents = []) => ({
  id: demande.id,
  ref: demande.numero_demande || `DEM-${demande.id}`,
  title: [demande.destination, demande.ville_accueil].filter(Boolean).join(' - '),
  type: demande.type_sejour?.code || 'Type non defini',
  status: demande.statut,
  statusLabel: mapStatut(demande.statut),
  chercheur_nom: demande.chercheur_nom,
  chercheur_prenom: demande.chercheur_prenom,
  chercheur_grade: demande.chercheur_grade,
  destination: [demande.ville_accueil, demande.destination].filter(Boolean).join(', '),
  period: `${demande.date_debut} -> ${demande.date_fin}`,
  duration: `${demande.duree_jours} jours`,
  duree: `${demande.duree_jours} jours`,
  dateDepart: demande.date_debut,
  dateRetour: demande.date_fin,
  objectifs: demande.objectifs_scientifiques,
  institution: demande.institution_accueil || 'Non renseignee',
  submitted: demande.date_soumission || 'Non soumise',
  updatedAt: demande.date_soumission || 'Non disponible',
  docs: documents.length ? `${documents.length} document(s)` : 'Aucun document',
  documentCount: documents.length,
  documentNames: documents.map((doc) => String(doc.type_document || '').replace(/[\[\]"]/g, '')).filter(Boolean),
  verified: null,
  attestation: demande.attestation || null,
});


const toAbsoluteFileUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL.replace(/\/api$/, '')}${url}`;
};


export const getProfil = async () => {
  const [userData, profilData] = await Promise.all([
    fetchAuthenticatedJson('/users/me/', 'Erreur lors de la recuperation du compte'),
    fetchAuthenticatedJson('/monprofil/', 'Erreur lors de la recuperation du profil'),
  ]);

  return { ...userData, profil: profilData };
};

export const updateProfil = async (userId, profilData) => {
  const response = await authFetch('/monprofil/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profilData),
  });

  const data = await readJson(response);
  ensureOk(response, data, 'Erreur lors de la mise a jour du profil');
  return data;
};

export const uploadPhotoProfil = async (userId, file) => {
  const formData = new FormData();
  formData.append('photo_profil', file);

  const response = await authFetch('/monprofil/', {
    method: 'PATCH',
    body: formData,
  });

  const data = await readJson(response);
  ensureOk(response, data, "Erreur lors de l'upload de la photo");
  return data;
};

export const getMesDemandes = async () => {
  const demandes = await getDemandesCollection();

  const documentsByDemande = await Promise.all(
    demandes.map(async (demande) => {
      try {
        const docs = await fetchAuthenticatedJson(
          `/demandes/${demande.id}/documents/`,
          'Erreur lors de la recuperation des documents'
        );
        return [demande.id, Array.isArray(docs) ? docs : []];
      } catch {
        return [demande.id, []];
      }
    })
  );

  const docsMap = new Map(documentsByDemande);
  return demandes.map((demande) => mapDemandeForList(demande, docsMap.get(demande.id) || []));
};

export const getDemandeById = async (demandeId) => {
  const demande = await fetchAuthenticatedJson(
    `/demandes/${demandeId}/`,
    'Erreur lors de la recuperation de la demande'
  );
  return demande;
};

export const getDocumentsDemande = async (demandeId) => {
  const data = await fetchAuthenticatedJson(
    `/demandes/${demandeId}/documents/`,
    'Erreur lors de la recuperation des documents'
  );

  return data.map((doc) => String(doc.type_document || '').replace(/[\[\]"]/g, ''));
};

export const getDocumentsDemandeDetailed = async (demandeId) => {
  const data = await fetchAuthenticatedJson(
    `/demandes/${demandeId}/documents/`,
    'Erreur lors de la recuperation des documents'
  );
  return Array.isArray(data) ? data : [];
};

export const getStatistiquesDemandes = async () => {
  const demandes = await getDemandesCollection();

  const stats = {
    enAttente: 0,
    approuvees: 0,
    enCours: 0,
    total: demandes.length,
  };

  demandes.forEach((demande) => {
    if (demande.statut === 'BROUILLON' || demande.statut === 'EN_ATTENTE') {
      stats.enAttente += 1;
    } else if (demande.statut === 'APPROUVEE' || demande.statut === 'DELIBERATION_CS') {
      stats.approuvees += 1;
    } else if (
      demande.statut === 'SOUMISE' ||
      demande.statut === 'VERIFICATION_AUTOMATIQUE' ||
      demande.statut === 'PREPARATION_CS' ||
      demande.statut === 'DELIBERATION_CS_FIN'
    ) {
      stats.enCours += 1;
    }
  });

  return stats;
};

export const getDemandesRecentes = async (limit = 3) => {
  const demandes = await getDemandesCollection();

  return demandes
    .sort((a, b) => {
      const dateA = a.date_soumission ? new Date(a.date_soumission) : new Date(0);
      const dateB = b.date_soumission ? new Date(b.date_soumission) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, limit)
    .map((demande) => ({
      id: demande.id,
      numero: demande.numero_demande,
      destination: demande.destination,
      ville: demande.ville_accueil,
      statut: mapStatut(demande.statut),
      statutRaw: demande.statut,
      dateDebut: demande.date_debut,
      dateFin: demande.date_fin,
      duree: demande.duree_jours,
      objectifs: demande.objectifs_scientifiques,
      institution: demande.institution_accueil,
    }));
};

export const getNotifications = async () => {
  const demandes = await getDemandesCollection('Erreur lors de la recuperation des notifications');
  const rapports = await getMesRapports();

  const notifications = [];
  const now = new Date();
  const pendingRapports = Array.isArray(rapports?.pending) ? rapports.pending : [];

  pendingRapports
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a?.dueDate || 0).getTime();
      const dateB = new Date(b?.dueDate || 0).getTime();
      return dateA - dateB;
    })
    .forEach((rapport) => {
      notifications.push({
        id: `rapport-${rapport.demandeId}`,
        type: 'rapport',
        message: `Rapport a soumettre pour ${rapport.destination || rapport.ville || `la demande ${rapport.demandeId}`}`,
        time: rapport.remaining || 'En attente',
        icon: 'alert',
        sortDate: rapport.dueDate,
      });
    });

  demandes.forEach((demande) => {
    if (demande.statut === 'VERIFICATION_AUTOMATIQUE') {
      notifications.push({
        id: `doc-${demande.id}`,
        type: 'documents',
        message: `Documents a soumettre pour ${demande.destination}`,
        time: 'Action requise',
        icon: 'file',
        sortDate: demande.date_debut || demande.date_soumission || null,
      });
    }

    const dateDebut = new Date(demande.date_debut);
    const daysBeforeStart = Math.ceil((dateDebut - now) / (1000 * 60 * 60 * 24));

    if (dateDebut > now && daysBeforeStart <= 30) {
      notifications.push({
        id: `debut-${demande.id}`,
        type: 'debut',
        message: `Début mission: ${demande.destination}`,
        time: daysBeforeStart <= 1 ? 'Demain' : `Dans ${daysBeforeStart} jours`,
        icon: 'plane',
        sortDate: demande.date_debut,
      });
    }
  });

  return notifications
    .sort((a, b) => {
      const dateA = a.sortDate ? new Date(a.sortDate).getTime() : Number.MAX_SAFE_INTEGER;
      const dateB = b.sortDate ? new Date(b.sortDate).getTime() : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    })
    .slice(0, 5)
    .map(({ sortDate, ...notification }) => notification);
};

/** Alertes serveur (table Notification) --> centre de notifications chercheur */

export const getAlertesNotifications = async () => {
  const data = await fetchAuthenticatedJson(
    '/notifications/',
    'Erreur lors de la recuperation des notifications'
  );
  return normalizeCollection(data);
};

export const markAlerteNotificationRead = async (id) => {
  const response = await authFetch(`/notifications/${id}/lire/`, { method: 'POST' });
  const payload = await readJson(response);
  ensureOk(response, payload, 'Erreur lors du marquage comme lu');
  return payload;
};

export const markAllAlertesNotificationsRead = async () => {
  const response = await authFetch('/notifications/lire-tout/', { method: 'POST' });
  const payload = await readJson(response);
  ensureOk(response, payload, 'Erreur lors du marquage global');
  return payload;
};

const DISMISSED_ALERTES_KEY = 'chercheur-notifications-dismissed';

const readDismissedAlerteIds = () => {
  try {
    const raw = localStorage.getItem(DISMISSED_ALERTES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set((Array.isArray(arr) ? arr : []).map((x) => Number(x)));
  } catch {
    return new Set();
  }
};

const persistDismissedAlerteIds = (set) => {
  try {
    localStorage.setItem(DISMISSED_ALERTES_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
};

/** Si le backend n expose pas DELETE sur les notifications, masquage local persistant */
export const dismissAlerteNotificationLocal = (id) => {
  const next = readDismissedAlerteIds();
  next.add(Number(id));
  persistDismissedAlerteIds(next);
};

/** Filtre les alertes masquées localement (si le serveur ne propose pas DELETE) */
export const filterAlertesNotDismissed = (items) => {
  const dismissed = readDismissedAlerteIds();
  return (Array.isArray(items) ? items : []).filter((n) => n?.id != null && !dismissed.has(Number(n.id)));
};

export const deleteAlerteNotification = async (id) => {
  const response = await authFetch(`/notifications/${id}/`, { method: 'DELETE' });
  if (response.status === 204) return { deleted: true };
  if (response.ok) {
    await readJson(response);
    return { deleted: true };
  }
  if (response.status === 405 || response.status === 404) {
    dismissAlerteNotificationLocal(id);
    return { deleted: false, localOnly: true };
  }
  const data = await readJson(response);
  ensureOk(response, data, 'Impossible de supprimer la notification');
  return { deleted: true };
};

/** Messagerie chercheur ↔ assistant (POST { contenu }, GET liste) */
export const getMessagerieMessages = async () => {
  const data = await fetchAuthenticatedJson('/messagerie/', 'Erreur lors du chargement de la messagerie');
  return normalizeCollection(data);
};

export const postMessagerieMessage = async (contenu) => {
  const response = await authFetch('/messagerie/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contenu }),
  });
  const data = await readJson(response);
  ensureOk(response, data, "Erreur lors de l envoi du message");
  return data;
};

export const getEcheancesProcheaines = async () => {
  const demandes = await getDemandesCollection();

  const echeances = [];
  const now = new Date();

  demandes.forEach((demande) => {
    const dateDebut = new Date(demande.date_debut);
    const dateFin = new Date(demande.date_fin);

    if (dateDebut > now) {
      echeances.push({
        id: `debut-${demande.id}`,
        date: demande.date_debut,
        label: `Début mission ${demande.destination}`,
        type: 'debut',
        color: 'green',
      });
    }

    if (dateFin > now && dateFin > dateDebut) {
      echeances.push({
        id: `rapport-${demande.id}`,
        date: new Date(dateFin.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        label: `Rapport à soumettre pour ${demande.destination}`,
        type: 'rapport',
        color: 'orange',
      });
    }
  });

  return echeances
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);
};


const pickLatestRapport = (rapportData) => {
  if (Array.isArray(rapportData)) {
    return rapportData
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a?.date_soumission || a?.date_validation || 0).getTime();
        const dateB = new Date(b?.date_soumission || b?.date_validation || 0).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return (b?.id || 0) - (a?.id || 0);
      })[0] || null;
  }

  return rapportData && typeof rapportData === 'object' ? rapportData : null;
};

const normalizeRapportCollection = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const getRapportForDemande = async (demandeId) => {
  const response = await authFetch(`/demandes/${demandeId}/rapport/`, { method: 'GET' });

  if (response.status === 404) return null;
  if (!response.ok) return null;

  const data = await readJson(response);

  if (Array.isArray(data) || Array.isArray(data?.results) || Array.isArray(data?.data) || Array.isArray(data?.items)) {
    const matchingRapports = normalizeRapportCollection(data).filter(
      (rapport) => getRapportDemandeId(rapport) === demandeId
    );
    return pickLatestRapport(matchingRapports);
  }

  if (data && getRapportDemandeId(data) === demandeId) {
    return pickLatestRapport(data);
  }

  return null;
};

const mapRapportStatus = (rapport, fallbackStatus = 'en_attente') => {
  if (!rapport) return fallbackStatus;
  if (rapport.est_valide || rapport.statut === 'VALIDE') return 'valide';
  if (rapport.statut === 'A_CORRIGER') return 'corriger';
  return fallbackStatus;
};

const getSubmittedRapportsByDemande = async () => {
  const endpoints = [
    '/demandes/rapports/',
    '/rapports/',
  ];

  for (const endpoint of endpoints) {
    const response = await authFetch(endpoint, { method: 'GET' });
    const data = await readJson(response);

    if (!response.ok) {
      if (response.status === 404) {
        continue;
      }
      ensureOk(response, data, 'Erreur lors de la récuperation des rapports');
    }

    return normalizeCollection(data).reduce((map, rapport) => {
      const demandeId = getRapportDemandeId(rapport);
      if (demandeId == null) return map;

      const existing = map.get(demandeId);
      if (!existing) {
        map.set(demandeId, rapport);
        return map;
      }

      const latest = pickLatestRapport([existing, rapport]);
      map.set(demandeId, latest);
      return map;
    }, new Map());
  }

  return null;
};

const buildSubmittedRapportsByDemandesFallback = async (demandes) => {
  const rapportChecks = await Promise.allSettled(
    demandes.map((demande) => getRapportForDemande(demande.id))
  );

  return rapportChecks.reduce((map, result, index) => {
    if (result.status !== 'fulfilled' || !result.value) return map;
    map.set(demandes[index].id, result.value);
    return map;
  }, new Map());
};

const createSubmittedRapportMap = (rapports) =>
  rapports.reduce((map, rapport) => {
    const demandeId = getRapportDemandeId(rapport);
    if (demandeId == null) return map;

    const existing = map.get(demandeId);
    if (!existing) {
      map.set(demandeId, rapport);
      return map;
    }

    const latest = pickLatestRapport([existing, rapport]);
    map.set(demandeId, latest);
    return map;
  }, new Map());

export const getMesRapports = async () => {
  const demandes = await getDemandesCollection();
  let submittedRapportsByDemande = await getSubmittedRapportsByDemande();

  if (!(submittedRapportsByDemande instanceof Map)) {
    submittedRapportsByDemande = await buildSubmittedRapportsByDemandesFallback(demandes);
  }

  const pending = []; 
  const submitted = [];

  demandes.forEach((demande) => {
    const rapport = submittedRapportsByDemande.get(demande.id) || null;
    const dateFin = demande.date_fin ? new Date(demande.date_fin) : null;
    const dueDate = dateFin
      ? new Date(dateFin.getTime() + 15 * 24 * 60 * 60 * 1000)
      : null;
    const daysLeft = dueDate
      ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const baseData = {
      id: demande.id,
      demandeId: demande.id,
      title: [demande.type_sejour?.code, demande.destination].filter(Boolean).join(' — ') || `Demande ${demande.id}`,
      sejour: [demande.type_sejour?.code, demande.destination].filter(Boolean).join(' — ') || `Demande ${demande.id}`,
      typeSejour: demande.type_sejour?.code || '',
      dates: `${demande.date_debut || '-'} - ${demande.date_fin || '-'}`,
      dateDebut: demande.date_debut,
      dateFin: demande.date_fin,
      pays: demande.pays?.name || demande.pays_name || '',
      destination: demande.destination,
      ville: demande.ville_accueil,
      institution: demande.institution_accueil,
      dueDate: dueDate ? dueDate.toISOString() : null,
      daysLeft,
    };

    if (rapport) {
      const fichiers = Array.isArray(rapport?.fichiers) ? rapport.fichiers : [];
      const latestFile = fichiers
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a?.date_upload || 0).getTime();
          const dateB = new Date(b?.date_upload || 0).getTime();
          if (dateA !== dateB) return dateB - dateA;
          return (b?.id || 0) - (a?.id || 0);
        })[0] || null;

      submitted.push({
        ...baseData,
        rapportId: rapport?.id || `rapport-${demande.id}`,
        submission: rapport?.date_soumission || '',
        status: mapRapportStatus(rapport, 'en_attente'),
        fileUrl: toAbsoluteFileUrl(latestFile?.fichier) || null,
      });
      return;
    }

    if (demande.statut === 'TERMINEE') {
      pending.push({
        ...baseData,
        urgent: typeof daysLeft === 'number' ? daysLeft <= 5 : false,
        remaining: typeof daysLeft === 'number'
          ? (daysLeft >= 0
            ? `${daysLeft} jours restants`
            : `Retard de ${Math.abs(daysLeft)} jours`)
          : 'Echeance indisponible',
        remainingUrgent: typeof daysLeft === 'number' ? daysLeft <= 5 : false,
      });
    }
  });

  return { pending, submitted };
};


export const submitRapport = async (demandeId, payload = {}) => {
  const formData = new FormData();

  formData.append('demande', demandeId);

  if (payload.rapportFile)      formData.append('rapportFile', payload.rapportFile);
  if (payload.attestationFile)  formData.append('attestationFile', payload.attestationFile);
  if (payload.justificatifsFile) formData.append('justificatifsFile', payload.justificatifsFile);
  if (payload.photosFile)       formData.append('photosFile', payload.photosFile);
  if (payload.publicationsFile) formData.append('publicationsFile', payload.publicationsFile);

  const fieldMap = {
    date_depart_reelle:     payload.dateDepart,
    date_retour_reelle:     payload.dateRetour,
    description:            payload.description,
    objectif_formation:     payload.objectifs?.formation,
    objectif_collaboration: payload.objectifs?.collaboration,
    objectif_publication:   payload.objectifs?.publication,
    objectif_presentation:  payload.objectifs?.presentation,
    objectif_autre:         payload.objectifs?.autre,
    objectif_autre_text:    payload.objectifs?.autreText,
    resultats:              payload.resultats,
    publications:           payload.publications,
    collaborations:         payload.collaborations,
    impact:                 payload.impact,
    rating:                 payload.rating,
    points_positifs:        payload.pointsPositifs,
    difficultes:            payload.difficultes,
    recommande:             payload.recommande,
    civilite:               payload.civilite,
    nom_complet:            payload.nomComplet,
    date_signe:             payload.dateSigne,
  };

  Object.entries(fieldMap).forEach(([key, value]) => {
    if (value == null || value === '') return;
    formData.append(key, typeof value === 'boolean' ? String(value) : value);
  });

  const endpoints = [
    `/demandes/${demandeId}/rapport/soumettre/`,
    '/demandes/rapports/soumettre/',
    `/demandes/${demandeId}/rapport/`,
  ];

  let lastResponse = null;
  let lastData = null;

  for (const endpoint of endpoints) {
    const response = await authFetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    const data = await readJson(response);

    if (response.ok) {
      return data;
    }

    lastResponse = response;
    lastData = data;

    if (response.status !== 404 && response.status !== 405) {
      break;
    }
  }

  ensureOk(
    lastResponse || { ok: false },
    lastData,
    getResponseDetail(lastData, 'Erreur lors de la soumission du rapport')
  );
  return null;
};
