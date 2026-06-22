import { useState, useRef, useEffect } from 'react';

const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconChevron = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ── Shared Dropdown UI ── */
function Dropdown({ value, onChange, options, placeholder, loading }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const filtered = options.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const select = (item) => { onChange(item); setOpen(false); setSearch(''); };

  return (
    <div className="cs-wrap" ref={ref}>
      <div
        className={`cs-trigger${open ? ' cs-trigger--open' : ''}`}
        onClick={() => !loading && setOpen(v => !v)}
      >
        <span className="cs-icon"><IconLocation /></span>
        <span className={`cs-value${!value ? ' cs-placeholder' : ''}`}>
          {loading ? 'Chargement...' : value || placeholder}
        </span>
        <span className={`cs-chevron${open ? ' cs-chevron--up' : ''}`}><IconChevron /></span>
      </div>

      {open && (
        <div className="cs-dropdown">
          <div className="cs-search-wrap">
            <input
              className="cs-search"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              onClick={e => e.stopPropagation()}
            />
          </div>
          <ul className="cs-list">
            {filtered.length === 0 && <li className="cs-empty">Aucun résultat</li>}
            {filtered.map(c => (
              <li
                key={c}
                className={`cs-item${value === c ? ' cs-item--selected' : ''}`}
                onClick={() => select(c)}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Country Dropdown ── */
export function CountrySelect({ value, onChange }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://countriesnow.space/api/v0.1/countries')
      .then(r => r.json())
      .then(data => {
        const names = data.data.map(c => c.country).sort();
        setCountries(names);
        setLoading(false);
      });
  }, []);

  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={countries}
      placeholder="Sélectionner un pays"
      loading={loading}
    />
  );
}

/* ── City Dropdown ── */
export function CitySelect({ country, value, onChange }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!country) { setCities([]); return; }
    setLoading(true);
    fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country })
    })
      .then(r => r.json())
      .then(data => {
        setCities(data.data || []);
        setLoading(false);
      });
  }, [country]);

  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={cities}
      placeholder={country ? 'Sélectionner une ville' : "Choisir un pays d'abord"}
      loading={loading}
    />
  );
}
