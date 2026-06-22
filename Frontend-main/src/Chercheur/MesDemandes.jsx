// FORCE RELOAD v4
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './MesDemandes.css';
import { getMesDemandes } from '../api/chercheur';
import { annulerDemande, terminerDemande } from '../api/demandes';
import { useDemande } from './DemandeContext';

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconInstitution = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PER_PAGE = 6;
const CANCELLABLE_STATUSES = ['APPROUVEE'];

const STATUS_CONFIG = {
  BROUILLON: 'status-gray',
  SOUMISE: 'status-orange',
  VERIFICATION_AUTOMATIQUE: 'status-orange',
  PREPARATION_CS: 'status-orange',
  DELIBERATION_CS: 'status-orange',
  APPROUVEE: 'status-green',
  REJETEE: 'status-red',
  EN_ATTENTE: 'status-orange',
  TERMINEE: 'status-gray',
  DEMANDE_ANNULATION: 'status-red',
  DELIBERATION_CS_FIN: 'status-orange',
  CLOTUREE: 'status-gray',
  ANNULEE: 'status-red',
};

const EN_COURS_STATUTS = ['SOUMISE', 'VERIFICATION_AUTOMATIQUE', 'PREPARATION_CS', 'DELIBERATION_CS', 'EN_ATTENTE', 'DELIBERATION_CS_FIN'];

function DemandeCard({ demande, setActive, setSelectedDemande, onCancel, cancelling, onTerminer, termining }) {
  const { t } = useTranslation();
  const statusClass = STATUS_CONFIG[demande.status] || 'status-gray';

  const STATUS_LABELS_INTERNAL = {
    BROUILLON: t('Brouillon'),
    SOUMISE: t('Soumise'),
    VERIFICATION_AUTOMATIQUE: t('Verification automatique'),
    PREPARATION_CS: t('Preparation CS'),
    DELIBERATION_CS: t('Deliberation CS'),
    APPROUVEE: t('Approuvee'),
    REJETEE: t('Rejetee'),
    EN_ATTENTE: t('En attente'),
    TERMINEE: t('Terminee'),
    DEMANDE_ANNULATION: t('Demande annulation'),
    DELIBERATION_CS_FIN: t('Deliberation CS fin'),
    CLOTUREE: t('Cloturee'),
    ANNULEE: t('Annulee'),
  };

  return (
    <div className="md-card">
      <div className="md-card-top">
        <div className="md-card-title-row">
          <h3 className="md-card-title">{demande.title}</h3>
          <span className="md-type-badge">{demande.type}</span>
        </div>
        <span className={`md-status ${statusClass}`}>{STATUS_LABELS_INTERNAL[demande.status] || demande.status}</span>
      </div>

      <div className="md-card-meta">
        <span>Ref: {demande.ref}</span>
        <span>{t("Soumise le")} {demande.submitted}</span>
      </div>

      <div className="md-card-details">
        <div className="md-detail">
          <IconLocation />
          <div>
            <p className="md-detail-label">{t("destination")}</p>
            <p className="md-detail-value">{demande.destination}</p>
          </div>
        </div>
        <div className="md-detail">
          <IconCalendar />
          <div>
            <p className="md-detail-label">{t("Periode")}</p>
            <p className="md-detail-value">{demande.period}</p>
            <p className="md-detail-sub">{demande.duration}</p>
          </div>
        </div>
        <div className="md-detail">
          <IconInstitution />
          <div>
            <p className="md-detail-label">{t("Institution")}</p>
            <p className="md-detail-value">{demande.institution}</p>
          </div>
        </div>
      </div>

      <div className="md-card-footer">
        <div className="md-tags">
          <span className="md-tag"><IconDoc /> {demande.docs}</span>
          {demande.verified && <span className="md-tag md-tag--verified"><IconCheck /> {demande.verified}</span>}
        </div>

        <div className="md-card-actions">
          
          {CANCELLABLE_STATUSES.includes(demande.status) && (
            <button className="md-cancel-btn" type="button" disabled={cancelling} onClick={() => onCancel(demande)}>
              {cancelling ? t('Annulation...') : t('Annuler la demande')}
            </button>
          )}
          {demande.status === 'BROUILLON' && (
            <button className="md-edit-btn" type="button" onClick={() => {  setSelectedDemande(demande); setActive('nouvelle');     }}  > <IconEdit /> {t("Modifier")}
            </button>
         )}
         {demande.status === 'APPROUVEE' && (
            <button   className="md-terminer-btn"   type="button"   disabled={termining}  onClick={() => onTerminer(demande)}>  {termining ? t('En cours...') : t('Terminer la demande')}
            </button>
          )}
          <button
            className="md-details-btn"
            type="button"
            onClick={() => {
              setSelectedDemande(demande);
              setActive('demandeDetails');
            }}
          >
            <IconEye /> {t("Voir details")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MesDemandes({ setActive, setSelectedDemande }) {
  const { t } = useTranslation();
  const { resetDemande } = useDemande();

  const STATUS_LABELS = {
    BROUILLON: t('Brouillon'),
    SOUMISE: t('Soumise'),
    VERIFICATION_AUTOMATIQUE: t('Verification automatique'),
    PREPARATION_CS: t('Preparation CS'),
    DELIBERATION_CS: t('Deliberation CS'),
    APPROUVEE: t('Approuvee'),
    REJETEE: t('Rejetee'),
    EN_ATTENTE: t('En attente'),
    TERMINEE: t('Terminee'),
    DEMANDE_ANNULATION: t('Demande annulation'),
    DELIBERATION_CS_FIN: t('Deliberation CS fin'),
    CLOTUREE: t('Cloturee'),
    ANNULEE: t('Annulee'),
  };
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(1);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [terminingId, setTerminingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMesDemandes();
        setDemandes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancelDemande = async (demande) => {
    const confirmed = window.confirm(`Annuler la demande ${demande.ref} ?`);
    if (!confirmed) return;

    try {
      setError('');
      setCancellingId(demande.id);
      const updated = await annulerDemande(demande.id);

      setDemandes((prev) =>
        prev.map((item) =>
          item.id === demande.id
            ? {
                ...item,
                status: updated.statut,
              }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleTerminerDemande = async (demande) => {
  const confirmed = window.confirm(`Confirmer la clôture de la demande ${demande.ref} ?`);
  if (!confirmed) return;

  try {
    setError('');
    setTerminingId(demande.id);
    const updated = await terminerDemande(demande.id);

    const updatedDemande = { ...demande, status: updated.statut };

    setDemandes((prev) =>
      prev.map((item) =>
        item.id === demande.id ? updatedDemande : item
      )
    );

    setSelectedDemande(updatedDemande);

  } catch (err) {
    setError(err.message);
  } finally {
    setTerminingId(null);
  }
};

  const YEARS = ['2026', '2025', '2024', '2023'];
  const STATUSES = [...new Set(demandes.map((demande) => demande.status))];

  const filtered = demandes.filter((demande) => {
    const query = search.toLowerCase();
    const matchSearch =
      !query ||
      demande.title.toLowerCase().includes(query) ||
      demande.destination.toLowerCase().includes(query);
    const matchStatus = !statusFilter || demande.status === statusFilter;
    const matchYear = !yearFilter ||
  (demande.submitted && demande.submitted.includes(yearFilter)) ||
  (demande.dateDepart && demande.dateDepart.includes(yearFilter));

    return matchSearch && matchStatus && matchYear;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleYear = (value) => {
    setYearFilter(value);
    setPage(1);
  };

  return (
    <main className="md-body">
      <div className="md-page-header">
        <div>
          <h2 className="md-page-title">{t("Toutes mes demandes")}</h2>
          <p className="md-page-sub">{t("Suivez l etat d avancement de vos demandes")}</p>
        </div>
        <button className="md-new-btn" type="button" onClick={() => {
          resetDemande();
          setSelectedDemande(null);   
          setActive('nouvelle');
          }}>
         <IconPlus /> {t("Nouvelle demande")}
        </button>
      </div>

      <div className="md-stats">
        {[
          { color: '#3b82f6', value: demandes.length, label: t('Total des demandes') },
          { color: '#f59e0b', value: demandes.filter((demande) => EN_COURS_STATUTS.includes(demande.status)).length, label: t('En cours') },
          { color: '#22c55e', value: demandes.filter((demande) => demande.status === 'APPROUVEE').length, label: t('Approuvees') },
          { color: '#ef4444', value: demandes.filter((demande) => demande.status === 'REJETEE').length, label: t('Rejetees') },
        ].map(({ color, value, label }) => (
          <div key={label} className="md-stat-card">
            <div className="md-stat-icon" style={{ background: color }}><IconDoc /></div>
            <div>
              <p className="md-stat-value">{value}</p>
              <p className="md-stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="md-filters">
        <div className="md-search-wrap">
          <IconSearch />
          <input
            className="md-search-input"
            placeholder={t("Rechercher par destination, type de sejour...")}
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />
        </div>
        <button className="md-filter-btn" type="button"><IconFilter /> {t("Filtrer")} </button>
        <select className="md-select" value={statusFilter} onChange={(event) => handleStatus(event.target.value)}>
          <option value="">{t("Tous les status")}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status] || status}
            </option>
          ))}
        </select>
        <select className="md-select" value={yearFilter} onChange={(event) => handleYear(event.target.value)}>
          <option value="">{t("Toutes les annees")}</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="md-list">
        {loading && <p style={{ textAlign: 'center' }}>{t("Chargement...")}</p>}
        {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
        {!loading && paginated.map((demande) => (
          <DemandeCard
           key={demande.id}
           demande={demande}
           setActive={setActive}
           setSelectedDemande={setSelectedDemande}
           onCancel={handleCancelDemande}
           cancelling={cancellingId === demande.id}
           onTerminer={handleTerminerDemande}
           termining={terminingId === demande.id}
          />
        ))}
        {!loading && !error && filtered.length === 0 && (
          <p style={{ textAlign: 'center' }}>{t("Aucune demande trouvee.")}</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="md-pagination">
          <span className="md-pagination-info">
            {t("Affichage de")} {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} {t("sur")} {filtered.length} {t("demandes")}
          </span>
          <div className="md-pagination-btns">
            <button className="md-page-btn" type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
              {t("Precedent")}
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`md-page-btn md-page-num${page === pageNumber ? ' md-page-num--active' : ''}`}
                type="button"
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button className="md-page-btn" type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>
              {t("Suivant")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
