import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SoumettreRapport from './SoumettreRapport';
import './MesRapports.css';
import { getMesRapports } from '../api/chercheur';

/* ── Icons ── */
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconDocument = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);
const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// Status labels moved inside component to support translation


export default function MesRapports() {
  const { t } = useTranslation();
  const STATUS_LABELS = { valide: t('Validé'), corriger: t('À corriger') };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [selectedPending, setSelectedPending] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRapports = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMesRapports();
      setPending(data.pending || []);
      setSubmitted(data.submitted || []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRapports();
  }, []);

  const stats = useMemo(() => {
    const total = pending.length + submitted.length;
    const validated = submitted.filter((item) => item.status === 'valide').length;
    const toFix = submitted.filter((item) => item.status !== 'valide').length;
    return [
      { value: total, label: t('Total rapports'), color: 'stat-navy' },
      { value: pending.length, label: t('En attente'), color: 'stat-orange' },
      { value: validated, label: t('Validés'), color: 'stat-green' },
      { value: toFix, label: t('À corriger'), color: 'stat-red' },
    ];
  }, [pending, submitted]);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('fr-FR');
  };

  if (submitting) {
    return (
      <SoumettreRapport
        demande={selectedPending}
        onBack={() => {
          setSubmitting(false);
          setSelectedPending(null);
        }}
        onSubmitted={async () => {
          setSubmitting(false);
          setSelectedPending(null);
          await loadRapports();
        }}
      />
    );
  }

  return (
    <main className="mr-page-body">

      {/* Alert banner */}
      <div className="mr-alert-banner">
        <span className="mr-alert-icon"><IconWarning /></span>
        <div>
          <p className="mr-alert-title">{pending.length} {t("rapports en attente de soumission")}</p>
          <p className="mr-alert-sub">{t("Vous devez soumettre vos rapports dans les 15 jours suivant la fin du séjour")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mr-stats">
        {stats.map(({ value, label, color }) => (
          <div key={label} className={`mr-stat-card ${color}`}>
            <span className="mr-stat-value">{value}</span>
            <span className="mr-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Rapports à soumettre */}
      <h2 className="mr-section-title">{t("Rapports à soumettre")}</h2>
      <div className="mr-pending-grid">
        {loading && <p>{t("Chargement...")}</p>}
        {!loading && error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        {!loading && !error && pending.length === 0 && <p>{t("Aucun rapport en attente.")}</p>}
        {pending.map((r) => (
          <div key={r.id} className={`mr-pending-card${r.urgent ? ' mr-pending-card--urgent' : ''}`}>
            {r.urgent && (
              <span className="mr-urgent-badge"><IconAlert /> {t("Urgent")}</span>
            )}
            <p className="mr-pending-title">{r.title}</p>
            <p className="mr-pending-dates"><IconCalendar /> {r.dates}</p>
            <p className={`mr-pending-remaining${r.remainingUrgent ? ' mr-remaining--urgent' : ''}`}>
              <IconClock /> {r.remaining}
            </p>
            <button
              className="mr-submit-btn"
              onClick={() => {
                setSelectedPending(r);
                setSubmitting(true);
              }}
            >
              <IconUpload /> {t("Soumettre le rapport")}
            </button>
          </div>
        ))}
      </div>

      {/* Rapports soumis */}
      <h2 className="mr-section-title">{t("Rapports soumis")}</h2>
      <div className="mr-table-wrap">
        <table className="mr-table">
          <thead>
            <tr>
              <th>{t("Séjour")}</th>
              <th>{t("Dates")}</th>
              <th>{t("Date de soumission")}</th>
              <th>{t("Statut")}</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && submitted.length === 0 && (
              <tr>
                <td colSpan={5}>{t("Aucun rapport soumis.")}</td>
              </tr>
            )}
            {submitted.map((r) => (
              <tr key={r.id}>
                <td className="mr-td-sejour">{r.sejour}</td>
                <td>{r.dates}</td>
                <td>{formatDate(r.submission)}</td>
                <td>
                  <span className={`mr-badge mr-badge--${r.status}`}>
                    {STATUS_LABELS[r.status] || 'En attente'}
                  </span>
                </td>
                <td>
                  <button
                    className="mr-download-btn"
                    disabled={!r.fileUrl}
                    onClick={() => r.fileUrl && window.open(r.fileUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <IconDocument /> {t("Voir document")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </main>
  );
}
