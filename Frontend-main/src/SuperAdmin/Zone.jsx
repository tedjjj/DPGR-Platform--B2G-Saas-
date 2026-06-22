
// Side effect hook for handling data or state updates.
import React, { useEffect, useMemo, useState } from 'react';
import SideBarAdmin from './SideBarAdmin';
import './Zone.css';
import { createPays, createZone, deletePays, deleteZone, getPays, getZones } from '../api/superAdmin';

const buildZoneCards = (zones, pays) =>
  zones.map((zone) => ({
    id: zone.id,
    nom: zone.name,
    pays: pays
      .filter((country) => country.zone === zone.id)
      .map((country) => ({ id: country.id, name: country.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

// Function: Zone.
function Zone({ onNavigate }) {
// State management using React hooks.
  const [zones, setZones] = useState([]);
// State management using React hooks.
  const [pays, setPays] = useState([]);
// State management using React hooks.
  const [draftZones, setDraftZones] = useState({});
// State management using React hooks.
  const [newZoneName, setNewZoneName] = useState('');
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [saving, setSaving] = useState(false);
// State management using React hooks.
  const [error, setError] = useState('');
// State management using React hooks.
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [zonesData, paysData] = await Promise.all([getZones(), getPays()]);
      setZones(zonesData);
      setPays(paysData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des zones geographiques.');
    } finally {
      setLoading(false);
    }
  };

// Side effect hook for handling data or state updates.
  useEffect(() => {
    loadData();
  }, []);

  const savedZones = useMemo(() => buildZoneCards(zones, pays), [zones, pays]);

  const addDraftPays = (zoneId) => {
    setDraftZones((prev) => ({
      ...prev,
      [zoneId]: [...(prev[zoneId] || []), { id: Date.now() + Math.random(), nom: '' }],
    }));
  };

  const updateDraftPays = (zoneId, draftId, value) => {
    setDraftZones((prev) => ({
      ...prev,
      [zoneId]: (prev[zoneId] || []).map((item) =>
        item.id === draftId ? { ...item, nom: value } : item
      ),
    }));
  };

  const handleCreateZone = async () => {
    const name = newZoneName.trim();
    if (!name) {
      setError('Veuillez saisir un nom de zone.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');
      await createZone({ name });
      setNewZoneName('');
      setStatusMessage('Zone geographique creee avec succes.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la creation de la zone.');
    } finally {
      setSaving(false);
    }
  };

  const saveZones = async () => {
    const pendingCountries = Object.entries(draftZones).flatMap(([zoneId, drafts]) =>
      (drafts || [])
        .map((draft) => draft.nom.trim())
        .filter(Boolean)
        .map((name) => ({ zone: Number(zoneId), name }))
    );

    if (!pendingCountries.length) {
      setError('Aucun pays valide a enregistrer.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');
      await Promise.all(pendingCountries.map((country) => createPays(country)));
      setDraftZones({});
      setStatusMessage('Pays ajoutes aux zones avec succes.');
      await loadData();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement des pays.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteZone = async (zoneId) => {
    const confirmed = window.confirm('Supprimer cette zone et ses pays ?');
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');
      await deleteZone(zoneId);
      setDraftZones((prev) => {
        const next = { ...prev };
        delete next[zoneId];
        return next;
      });
      setStatusMessage('Zone supprimee du backend.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression de la zone.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePays = async (paysId) => {
    const confirmed = window.confirm('Supprimer ce pays ?');
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      setStatusMessage('');
      await deletePays(paysId);
      setStatusMessage('Pays supprime du backend.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du pays.');
    } finally {
      setSaving(false);
    }
  };

// Render the component JSX.
  return (
    <SideBarAdmin title="Zones Geographiques" activeItem="zones" onNavigate={onNavigate}>
      <div className="zones-page">
        <section className="zone-card zone-card--create">
          <div className="zone-card-head">
            <h2>Nouvelle zone</h2>
            <span>{zones.length} zones</span>
          </div>
          <div className="zone-create-row">
            <input
              type="text"
              placeholder="Nom de la zone"
              value={newZoneName}
              onChange={(event) => setNewZoneName(event.target.value)}
            />
            <button type="button" className="zone-create-btn" onClick={handleCreateZone} disabled={saving}>
              Ajouter la zone
            </button>
          </div>
        </section>

        {error && <p className="zone-feedback zone-feedback--error">{error}</p>}
        {statusMessage && <p className="zone-feedback zone-feedback--success">{statusMessage}</p>}
        {loading && <p className="zone-feedback">Chargement des zones...</p>}

        {!loading &&
          savedZones.map((zone) => (
            <section key={zone.id} className="zone-card">
              <div className="zone-card-head">
                <h2>{zone.nom}</h2>
                <div className="zone-card-actions">
                  <span>{zone.pays.length} pays</span>
                  <button
                    type="button"
                    className="zone-delete-btn"
                    onClick={() => handleDeleteZone(zone.id)}
                    disabled={saving}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="zone-tags">
                {zone.pays.map((country) => (
                  <span key={country.id} className="zone-tag">
                    {country.name}
                    <button
                      type="button"
                      onClick={() => handleDeletePays(country.id)}
                      disabled={saving}
                      aria-label={`Supprimer ${country.name}`}
                    >
                      Supprimer
                    </button>
                  </span>
                ))}
                {zone.pays.length === 0 && <span className="zone-empty-tag">Aucun pays</span>}
              </div>

              {(draftZones[zone.id] || []).map((draft) => (
                <div key={draft.id} className="zone-draft-row">
                  <input
                    type="text"
                    placeholder="Nom du pays"
                    value={draft.nom}
                    onChange={(event) => updateDraftPays(zone.id, draft.id, event.target.value)}
                  />
                </div>
              ))}

              <button type="button" className="add-country-btn" onClick={() => addDraftPays(zone.id)}>
                + Ajouter un pays
              </button>
            </section>
          ))}

        <button type="button" className="save-zones-btn" onClick={saveZones} disabled={saving || loading}>
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </SideBarAdmin>
  );
}

export default Zone;
