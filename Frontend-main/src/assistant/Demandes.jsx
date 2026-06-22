
// Side effect hook for handling data or state updates.
import React, { useState, useMemo, useEffect } from 'react';
import './Demandes.css';
import { getAllDemandes } from '../api/assistant';

// Small UI icon used in the interface.
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);
// Small UI icon used in the interface.
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
  </svg>
);
// Small UI icon used in the interface.
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);
// Small UI icon used in the interface.
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#6b7280">
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
);

const statusMeta = {
  'A verifier': { bg: '#f59e0b', color: '#fff' },
  Approuve: { bg: '#16a34a', color: '#fff' },
  'En CS': { bg: '#3b82f6', color: '#fff' },
  'En attente': { bg: '#94a3b8', color: '#fff' },
  Brouillon: { bg: '#6b7280', color: '#fff' },
  Rejete: { bg: '#ef4444', color: '#fff' },
  'En cours': { bg: '#8b5cf6', color: '#fff' },
  Termine: { bg: '#0d9488', color: '#fff' },
  Cloture: { bg: '#374151', color: '#fff' },
  Annule: { bg: '#9ca3af', color: '#fff' },
};

const parseApiDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const matchesDateFilter = (d, filter) => {
  if (filter === 'Toutes dates') return true;
  const startStr = d.dates?.split('->')[0]?.trim();
  const startDate = parseApiDate(startStr);
  if (!startDate) return true;
  const now = new Date();
  if (filter === 'Cette semaine') {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return startDate >= monday && startDate <= sunday;
  }
  if (filter === 'Ce mois') {
    return startDate.getFullYear() === now.getFullYear() && startDate.getMonth() === now.getMonth();
  }
  return true;
};

const ITEMS_PER_PAGE = 6;

// React component: DemandeCard.
const DemandeCard = ({ id, initials, name, status, type, location, dates, onSelectDemande }) => {
  const meta = statusMeta[status] || { bg: '#94a3b8', color: '#fff' };
// Render the component JSX.
  return (
    <div className="tld-card">
      <div className="tld-card-top">
        <div className="tld-avatar">{initials}</div>
        <div className="tld-card-info">
          <div className="tld-card-name">{name}</div>
          <span className="tld-badge" style={{ background: meta.bg, color: meta.color }}>{status}</span>
        </div>
      </div>
      <div className="tld-card-type">{type}</div>
      <div className="tld-card-meta">
        <span className="tld-meta-item"><PinIcon /> {location}</span>
        <span className="tld-meta-item"><CalIcon /> {dates}</span>
      </div>
      <button className="tld-btn-voir" onClick={() => onSelectDemande?.(id)}>
        Voir dossier
      </button>
    </div>
  );
};

// React component: CustomSelect.
const CustomSelect = ({ value, onChange, options }) => {
// State management using React hooks.
  const [open, setOpen] = useState(false);
// Render the component JSX.
  return (
    <div className="tld-select-wrap">
      <button className="tld-select-btn" onClick={() => setOpen((o) => !o)}>
        {value}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
      {open && (
        <div className="tld-select-dropdown">
          {options.map((opt) => (
            <div
              key={opt}
              className={`tld-select-option ${opt === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// React component: Demandes.
const Demandes = ({ onSelectDemande }) => {
// State management using React hooks.
  const [search, setSearch] = useState('');
// State management using React hooks.
  const [statusFilter, setStatus] = useState('Tous les statuts');
// State management using React hooks.
  const [typeFilter, setType] = useState('Tous les types');
// State management using React hooks.
  const [dateFilter, setDate] = useState('Toutes dates');
// State management using React hooks.
  const [page, setPage] = useState(1);
// State management using React hooks.
  const [demandes, setDemandes] = useState([]);
// State management using React hooks.
  const [loading, setLoading] = useState(true);
// State management using React hooks.
  const [error, setError] = useState('');

// Side effect hook for handling data or state updates.
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllDemandes();
        if (!cancelled) setDemandes(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erreur lors du chargement des demandes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
// Render the component JSX.
    return () => {
      cancelled = true;
    };
  }, []);

  const statusOptions = ['Tous les statuts', 'A verifier', 'Approuve', 'En CS', 'En attente', 'Rejete', 'Termine', 'Cloture', 'Annule'];
  const typeOptions = useMemo(() => {
    const types = demandes
      .map((d) => d.type)
      .filter((type) => typeof type === 'string' && type.trim() !== '');
    return ['Tous les types', ...Array.from(new Set(types))];
  }, [demandes]);
  const dateOptions = ['Toutes dates', 'Cette semaine', 'Ce mois'];

  const filtered = useMemo(() => {
    return demandes.filter((d) => {
      const matchSearch = search === '' || d.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'Tous les statuts' || d.status === statusFilter;
      const matchType = typeFilter === 'Tous les types' || d.type === typeFilter;
      const matchDate = matchesDateFilter(d, dateFilter);
      return matchSearch && matchStatus && matchType && matchDate;
    });
  }, [search, statusFilter, typeFilter, dateFilter, demandes]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const handleFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

// Side effect hook for handling data or state updates.
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

// Render the component JSX.
  return (
    <div className="tld-page">
      <div className="tld-filters">
        <div className="tld-search-wrap">
          <SearchIcon />
          <input
            className="tld-search"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <CustomSelect value={statusFilter} onChange={handleFilter(setStatus)} options={statusOptions} />
        <CustomSelect value={typeFilter} onChange={handleFilter(setType)} options={typeOptions} />
        <CustomSelect value={dateFilter} onChange={handleFilter(setDate)} options={dateOptions} />
        
      </div>

      {loading && <div className="tld-empty">Chargement...</div>}

      {!loading && error && (
        <div className="tld-empty" style={{ color: '#ef4444' }}>
          {error}
          {error.includes('reconnecter') && (
            <>
              <br />
              <a href="/login" style={{ color: '#3b82f6' }}>Se reconnecter</a>
            </>
          )}
        </div>
      )}

      {!loading && !error && paginated.length > 0 && (
        <div className="tld-grid">
          {paginated.map((d) => (
            <DemandeCard key={d.id} {...d} onSelectDemande={onSelectDemande} />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="tld-empty">Aucune demande trouvee.</div>
      )}

      {totalPages > 1 && (
        <div className="tld-pagination">
          <button
            className="tld-page-btn tld-page-nav"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft /> Precedent
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`tld-page-btn ${p === page ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="tld-page-btn tld-page-nav"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Demandes;
