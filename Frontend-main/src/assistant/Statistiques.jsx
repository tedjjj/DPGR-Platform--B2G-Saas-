
// Side effect hook for handling data or state updates.
import React, { useState, useEffect } from 'react';
import './Statistiques.css';

// ── API ──
const BASE_URL = 'http://127.0.0.1:8000/api';
const getToken   = () => localStorage.getItem('access_token');
const getRefresh = () => localStorage.getItem('refresh_token');

class SessionExpiredError extends Error {
  constructor() {
    super('Session expirée. Veuillez vous reconnecter.');
    this.sessionExpired = true;
  }
}

const safeJson = async (res) => {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  return res.json().catch(() => null);
};

const refreshAccessToken = async () => {
  const refresh = getRefresh();
  if (!refresh) { localStorage.removeItem('access_token'); throw new SessionExpiredError(); }
  const res = await fetch(`${BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw new SessionExpiredError();
  }
  const data = await safeJson(res);
  if (!data?.access) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw new SessionExpiredError();
  }
  localStorage.setItem('access_token', data.access);
  return data.access;
};

const apiFetch = async (path) => {
  let token = getToken();
  let res;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  } catch {
    // Network-level failure: server down, CORS preflight blocked, no internet
    throw new Error(
      `Impossible de contacter le serveur (${BASE_URL}). ` +
      `Vérifiez que le backend Django est démarré et que CORS autorise cette origine.`
    );
  }

  if (res.status === 401) {
    token = await refreshAccessToken();
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch {
      throw new Error(`Impossible de contacter le serveur (${BASE_URL}).`);
    }
  }

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error((err && err.detail) || `Erreur ${res.status}`);
  }
  const data = await safeJson(res);
  if (!data) throw new Error('Réponse inattendue du serveur.');
  return data;
};

// ── Icons ──
const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

// Small UI icon used in the interface.
const DocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

// Small UI icon used in the interface.
const PeopleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

// Small UI icon used in the interface.
const TrendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
  </svg>
);

// ── Static / decorative data (no API equivalent) ──
const annualBarData = [
  { year: '2021', stagePerf: 8,  sejourSci: 5  },
  { year: '2022', stagePerf: 12, sejourSci: 8  },
  { year: '2023', stagePerf: 14, sejourSci: 9  },
  { year: '2024', stagePerf: 16, sejourSci: 10 },
  { year: '2025', stagePerf: 18, sejourSci: 11 },
  { year: '2026', stagePerf: 20, sejourSci: 14 },
];

const departements = [
  { name: 'Intelligence Artificielle', total: 12, approved: 10, pending: 1, rejected: 1, rate: 83, delay: '2.5j', trend: 'up' },
  { name: 'Réseaux & Sécurité',        total: 9,  approved: 8,  pending: 0, rejected: 1, rate: 89, delay: '2.1j', trend: 'up' },
  { name: 'Génie Logiciel',            total: 8,  approved: 6,  pending: 1, rejected: 1, rate: 75, delay: '3.2j', trend: 'down' },
  { name: 'Systèmes Embarqués',        total: 7,  approved: 6,  pending: 0, rejected: 1, rate: 86, delay: '2.8j', trend: 'up' },
  { name: "Systèmes d'Information",    total: 6,  approved: 5,  pending: 1, rejected: 0, rate: 83, delay: '2.4j', trend: 'up' },
];

const durees = [
  { range: '7-10 jours',   type: 'Séjour', count: 8,  pct: 19 },
  { range: '11-15 jours',  type: 'Séjour', count: 7,  pct: 17 },
  { range: '15-20 jours',  type: 'Stage',  count: 9,  pct: 21 },
  { range: '21-25 jours',  type: 'Stage',  count: 6,  pct: 14 },
  { range: '26-30 jours',  type: 'Stage',  count: 12, pct: 29 },
];

// ── Helpers ──

/**
 * Format a delta number as a percentage badge string.
 * e.g. 5 → "+5%", -3 → "-3%", 0 → "0%"
 */
const formatDelta = (delta) => {
  if (delta === 0) return '0%';
  return delta > 0 ? `+${delta}%` : `${delta}%`;
};

/**
 * Derive a CSS class from the delta value for the KPI badge.
 */
const deltaClass = (delta) => {
  if (delta > 0) return 'positive';
  if (delta < 0) return 'negative';
  return 'neutral';
};

/**
 * Build donut segments from the repartition_statut API object.
 * Returns an array compatible with DonutChart.
 */
const buildDonutData = (rep) => {
  const raw = [
    { label: 'En attente', count: rep.en_attente,  color: '#f59e0b' },
    { label: 'Approuvées', count: rep.approuvees,  color: '#22c55e' },
    { label: 'En CS',      count: rep.en_cs,       color: '#1A3A6B' },
    { label: 'Rejetées',   count: rep.rejetees,    color: '#ef4444' },
  ];
  const total = raw.reduce((s, d) => s + d.count, 0) || 1; // avoid /0
  return raw.map((d) => ({ ...d, pct: Math.round((d.count / total) * 100) }));
};

/**
 * Compute the max value across all evolution_mensuelle entries.
 */
const buildTrendSeries = (evolution) => {
  // The API returns a single "value" per month (total submitted).
  // We expose it as "Demandes soumises"; approuvées/rejetées are not
  // available from this endpoint so we omit them here.
  return evolution.map((e) => ({ label: e.label, value: e.value }));
};

// ── Donut SVG ──
// React component: DonutChart.
const DonutChart = ({ data, total }) => {
  const r = 58, cx = 70, cy = 70, strokeW = 20;
  const circ = 2 * Math.PI * r;

  const grandTotal = data.reduce((s, d) => s + d.count, 0);

  // Build arc segments from actual counts so rounding never leaves gaps
  let cumulative = 0;
  const arcs = grandTotal > 0
    ? data.map((s) => {
        const dash = (s.count / grandTotal) * circ;
        const arc = {
          ...s,
          dasharray: `${dash} ${circ - dash}`,
          dashoffset: circ - cumulative,
        };
        cumulative += dash;
        return arc;
      })
    : [];

// Render the component JSX.
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Always-visible gray background ring — shows when all counts are 0 */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f2f5" strokeWidth={strokeW} />
      {arcs.map((a, i) => (
        <circle
          key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={a.color} strokeWidth={strokeW}
          strokeDasharray={a.dasharray}
          strokeDashoffset={a.dashoffset}
          strokeLinecap="butt"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1a2332">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#6b7280">Total</text>
    </svg>
  );
};

// ── Evolution Line Chart (replaces TrendLineChart with real API data) ──
// React component: EvolutionLineChart.
const EvolutionLineChart = ({ data }) => {
  const W = 580, H = 140, padL = 30, padR = 16, padT = 10, padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const values = data.map((d) => d.value);
  const maxV = Math.max(...values, 1) + 2;
  const minV = 0;
  const xs = data.map((_, i) => padL + (i / Math.max(data.length - 1, 1)) * plotW);
  const ys = values.map((v) => padT + plotH - ((v - minV) / (maxV - minV)) * plotH);
  const pathD = xs.map((x, i) => (i === 0 ? `M${x},${ys[i]}` : `L${x},${ys[i]}`)).join(' ');

// State management using React hooks.
  const [tooltip, setTooltip] = useState(null);

// Render the component JSX.
  return (
    <div style={{ position: 'relative' }}>
      <svg className="st-trend-svg" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padT + plotH * (1 - t);
          const v = Math.round(minV + t * (maxV - minV));
// Render the component JSX.
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f0f2f5" strokeWidth="1" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="8" fill="#9ca3af">{v}</text>
            </g>
          );
        })}

        {/* Month labels */}
        {data.map((d, i) => (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.label}</text>
        ))}

        {/* Line */}
        <path d={pathD} fill="none" stroke="#1A3A6B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {xs.map((x, i) => (
          <circle
            key={i} cx={x} cy={ys[i]} r="4"
            fill="#fff" stroke="#1A3A6B" strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setTooltip({ x, y: ys[i], label: data[i].label, value: data[i].value })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Tooltip */}
        {tooltip && (() => {
          const tx = tooltip.x + 10;
          const ty = tooltip.y - 44;
// Render the component JSX.
          return (
            <g>
              <rect x={tx} y={ty} width="130" height="36" rx="6" fill="#1a2332" opacity="0.92" />
              <text x={tx + 10} y={ty + 14} fontSize="9" fill="#fff" fontWeight="700">{tooltip.label}</text>
              <text x={tx + 10} y={ty + 28} fontSize="8.5" fill="#22c55e">
                Demandes soumises : {tooltip.value}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="st-trend-legend">
        <div className="st-trend-legend-item">
          <div className="st-trend-legend-line" style={{ background: '#1A3A6B' }} />
          <span>Demandes soumises</span>
        </div>
      </div>
    </div>
  );
};

// ── Loading skeleton ──
// React component: Skeleton.
const Skeleton = ({ className, style }) => (
  <div className={`st-skeleton ${className || ''}`} style={style} />
);

// ── Main Component ──
const Statistiques = () => {
// State management using React hooks.
  const [stats, setStats]       = useState(null);
// State management using React hooks.
  const [loading, setLoading]   = useState(true);
// State management using React hooks.
  const [error, setError]       = useState(null);
// State management using React hooks.
  const [sessionExpired, setSessionExpired] = useState(false);
// State management using React hooks.
  const [fetchKey, setFetchKey] = useState(0);

  const retry = () => { setError(null); setSessionExpired(false); setLoading(true); setFetchKey((k) => k + 1); };

// State management using React hooks.
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    const overrideStyle = document.createElement('style');
    overrideStyle.id = 'st-pdf-override';

    try {
      const pageEl = document.querySelector('.st-page');
      if (!pageEl) return;

      const loadScript = (src) =>
        new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
          const s = document.createElement('script');
          s.src = src; s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });

      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const JsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if (!JsPDF) throw new Error('jsPDF failed to load');

      const CAPTURE_W   = 1200;
      const SCALE       = 2;
      const PDF_W_MM    = 210;
      const PDF_H_MM    = 297;
      const MARGIN_MM   = 10;
      const contentW_MM = PDF_W_MM - MARGIN_MM * 2;
      const contentH_MM = PDF_H_MM - MARGIN_MM * 2;

      // Inject stylesheet: forces wide layout, removes all overflow clipping,
      // hides the export button, shows the print header
      overrideStyle.textContent = `
        .st-page {
          width: ${CAPTURE_W}px !important;
          min-width: ${CAPTURE_W}px !important;
          overflow: visible !important;
        }
        .st-page * {
          overflow: visible !important;
          overflow-x: visible !important;
          overflow-y: visible !important;
          max-height: none !important;
        }
        .st-kpi-row    { display: grid !important; grid-template-columns: repeat(4,1fr) !important; }
        .st-charts-row { display: grid !important; grid-template-columns: 1fr 1fr !important; }
        .st-three-row  { display: grid !important; grid-template-columns: 1fr 1fr 1fr !important; }
        .st-bottom-row { display: grid !important; grid-template-columns: 1fr 1fr !important; }
        .st-export-btn { display: none !important; }
        .st-print-header { display: flex !important; }
      `;
      document.head.appendChild(overrideStyle);

      // Wait for full reflow at the new width
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // Measure child positions AFTER reflow using scrollHeight for true heights
      const pageTop  = pageEl.getBoundingClientRect().top + window.scrollY;
      const children = Array.from(pageEl.children);
      const childBots = children.map((c) => {
        const top = c.getBoundingClientRect().top + window.scrollY - pageTop;
        return top + c.scrollHeight;
      });
      const totalHeight = Math.max(pageEl.scrollHeight, ...childBots);

      // Single full-page capture
      const canvas = await window.html2canvas(pageEl, {
        scale:           SCALE,
        useCORS:         true,
        backgroundColor: '#ffffff',
        logging:         false,
        width:           CAPTURE_W,
        height:          totalHeight,
        windowWidth:     CAPTURE_W,
        windowHeight:    totalHeight,
        scrollX:         -(pageEl.getBoundingClientRect().left + window.scrollX),
        scrollY:         -(pageEl.getBoundingClientRect().top  + window.scrollY),
      });

      // Remove override stylesheet — restores live UI instantly
      overrideStyle.remove();

      // Smart slicing: cut only between direct children, never through one
      const mmPerPx  = contentW_MM / CAPTURE_W;
      const pageH_px = contentH_MM / mmPerPx;

      const slices = [];
      let sliceStart = 0;
      let sliceEnd   = 0;

      for (const bot of childBots) {
        if (bot - sliceStart > pageH_px && sliceEnd > sliceStart) {
          slices.push({ start: sliceStart, end: sliceEnd });
          sliceStart = sliceEnd;
        }
        sliceEnd = bot;
      }
      if (sliceEnd > sliceStart) slices.push({ start: sliceStart, end: sliceEnd });

      // Render pages
      const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      slices.forEach(({ start, end }, idx) => {
        const realH   = end - start;
        const canvasY = Math.floor(start * SCALE);
        const canvasH = Math.min(Math.ceil(realH * SCALE), canvas.height - canvasY);
        if (canvasH <= 0) return;

        const tmp = document.createElement('canvas');
        tmp.width  = canvas.width;
        tmp.height = canvasH;
        tmp.getContext('2d').drawImage(canvas, 0, canvasY, tmp.width, canvasH, 0, 0, tmp.width, canvasH);

        if (idx > 0) pdf.addPage();
        pdf.addImage(tmp.toDataURL('image/jpeg', 0.93), 'JPEG', MARGIN_MM, MARGIN_MM, contentW_MM, realH * mmPerPx);
      });

      const dateStr = new Date()
        .toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        .replace(/\//g, '-');
      pdf.save(`Rapport_DPGR_${dateStr}.pdf`);

    } catch (err) {
      console.error('Export PDF failed:', err);
      overrideStyle.remove();
      alert("Échec de l'export PDF. Veuillez réessayer.");
    } finally {
      overrideStyle.remove(); // safety net in case of early exit
      setExporting(false);
    }
  };

// Side effect hook for handling data or state updates.
  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        setSessionExpired(false);
        // Fetch the admin dashboard which contains all required statistics.
        // Adjust the endpoint to match the authenticated user's role if needed:
        //   Chercheur  → /dashboard/chercheur/
        //   Assistant  → /dashboard/assistant/
        //   AdminDPGR  → /dashboard/admin/
        //   SuperAdmin → /dashboard/super-admin/
        const data = await apiFetch('/dashboard/assistant/');
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          if (err.sessionExpired) setSessionExpired(true);
          setError(err.message || 'Erreur lors du chargement des statistiques.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
// Render the component JSX.
    return () => { cancelled = true; };
  }, [fetchKey]);

  // ── Derived data (computed once stats are loaded) ──
  const donutData   = stats ? buildDonutData(stats.repartition_statut) : [];
  const donutTotal  = stats
    ? Object.values(stats.repartition_statut).reduce((s, v) => s + v, 0)
    : 0;
  const trendData   = stats ? buildTrendSeries(stats.evolution_mensuelle) : [];
  const barMax      = Math.max(...annualBarData.map((d) => d.stagePerf + d.sejourSci));

  // ── KPI config (maps API fields → display props) ──
  const kpiCards = stats
    ? [
        {
          icon: <DocIcon />,
          value: stats.kpis.demandes_ce_mois.value,
          delta: stats.kpis.demandes_ce_mois.delta,
          label: 'Demandes ce mois',
        },
        {
          icon: <DocIcon />,
          value: stats.kpis.demandes_traitees.value,
          delta: stats.kpis.demandes_traitees.delta,
          label: 'Demandes traitées',
        },
        {
          icon: <PeopleIcon />,
          value: stats.kpis.chercheurs_actifs.value,
          delta: stats.kpis.chercheurs_actifs.delta,
          label: 'Chercheurs actifs',
        },
        {
          icon: <TrendIcon />,
          value: stats.kpis.delai_moyen.value
            ? `${stats.kpis.delai_moyen.value}j`
            : '—',
          delta: stats.kpis.delai_moyen.delta,
          label: 'Délai moyen',
        },
      ]
    : [];

  // ── Par type de séjour ──
  const parType     = stats ? stats.par_type : [];
  const parTypeMax  = parType.length ? Math.max(...parType.map((t) => t.value), 1) : 1;
  const typeColors  = ['#1A3A6B', '#b5953b', '#22c55e', '#ef4444', '#f59e0b'];

  // ── Par zone géographique ──
  const parZone    = stats ? stats.par_zone : [];
  const parZoneMax = parZone.length ? Math.max(...parZone.map((z) => z.value), 1) : 1;
  const zoneColors = ['#1A3A6B', '#22c55e', '#f59e0b', '#ef4444'];

  // ── Top destinations ──
  const topDest    = stats ? stats.top_destinations : [];
  const destTotal  = topDest.reduce((s, d) => s + d.value, 0) || 1;

  // ── Délai de traitement ──
  const delaiItems = stats
    ? [
        { label: '< 24h',     count: stats.delai_traitement.moins_24h,  color: '#22c55e' },
        { label: '1-3 jours', count: stats.delai_traitement['1_3_jours'], color: '#1A3A6B' },
        { label: '3-7 jours', count: stats.delai_traitement['3_7_jours'], color: '#f59e0b' },
        { label: '> 7 jours', count: stats.delai_traitement.plus_7_jours, color: '#ef4444' },
      ]
    : [];

  // ── Error state ──
  if (error) {
// Render the component JSX.
    return (
      <div className="st-page">
        <div className="st-error-banner">
          <span>⚠️ {error}</span>
          {sessionExpired ? (
            <button
              className="st-retry-btn"
              onClick={() => { window.location.href = '/login'; }}
            >
              Se reconnecter
            </button>
          ) : (
            <button className="st-retry-btn" onClick={retry}>
              Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }

// Render the component JSX.
  return (
    <div className="st-page">

      {/* Page header */}
      <div className="st-page-header">
        {/* Print-only title row */}
        <div className="st-print-header" style={{ display: 'none' }}>
          Rapport DPGR — Généré le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
        <div>
          <h1 className="st-page-title">Tableau de bord statistiques</h1>
          <p className="st-page-sub">Vue d'ensemble de l'activité DPGR</p>
        </div>
        <button className="st-export-btn" onClick={handleExport} disabled={exporting} style={{ opacity: exporting ? 0.7 : 1, cursor: exporting ? 'wait' : 'pointer' }}>
          <DownloadIcon />
          {exporting ? 'Export en cours…' : 'Exporter le rapport'}
        </button>
      </div>

      {/* KPI row */}
      <div className="st-kpi-row">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="st-kpi-card">
                <Skeleton style={{ height: '14px', width: '60%', marginBottom: '12px' }} />
                <Skeleton style={{ height: '32px', width: '40%', marginBottom: '8px' }} />
                <Skeleton style={{ height: '12px', width: '80%' }} />
              </div>
            ))
          : kpiCards.map((kpi, i) => (
              <div key={i} className="st-kpi-card">
                <div className="st-kpi-top">
                  <div className="st-kpi-icon">{kpi.icon}</div>
                </div>
                <div className="st-kpi-value">{kpi.value}</div>
                <div className="st-kpi-label">{kpi.label}</div>
              </div>
            ))}
      </div>

      {/* Charts row: annual bar (static) + donut (live) */}
      <div className="st-charts-row">
        {/* Annual bar chart — static historical data */}
        <div className="st-card">
          <div className="st-card-title">Évolution annuelle des demandes</div>
          <div className="st-bar-chart">
            {annualBarData.map((d, i) => {
              const h1 = (d.stagePerf / barMax) * 110;
              const h2 = (d.sejourSci / barMax) * 110;
// Render the component JSX.
              return (
                <div key={i} className="st-bar-group">
                  <div className="st-bar-bars">
                    <div className="st-bar-single" style={{ height: `${h1}px`, background: '#1A3A6B' }} title={`Stages: ${d.stagePerf}`} />
                    <div className="st-bar-single" style={{ height: `${h2}px`, background: '#b5953b' }} title={`Séjours: ${d.sejourSci}`} />
                  </div>
                  <span className="st-bar-xlabel">{d.year}</span>
                </div>
              );
            })}
          </div>
          <div className="st-legend-row">
            <div className="st-legend-item"><div className="st-legend-dot" style={{ background: '#1A3A6B' }} /><span>Stages perfectionnement</span></div>
            <div className="st-legend-item"><div className="st-legend-dot" style={{ background: '#b5953b' }} /><span>Séjours scientifiques</span></div>
          </div>
        </div>

        {/* Donut chart — live repartition_statut */}
        <div className="st-card">
          <div className="st-card-title">Répartition par statut</div>
          {loading ? (
            <div className="st-donut-wrap">
              <Skeleton style={{ width: '140px', height: '140px', borderRadius: '50%' }} />
              <div className="st-donut-legend">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} style={{ height: '14px', width: '120px', marginBottom: '8px' }} />
                ))}
              </div>
            </div>
          ) : (
            <div className="st-donut-wrap">
              <DonutChart data={donutData} total={donutTotal} />
              <div className="st-donut-legend">
                {donutData.map((d, i) => (
                  <div key={i} className="st-donut-legend-item">
                    <span className="st-donut-dot" style={{ background: d.color }} />
                    <span>{d.label} ({d.count})</span>
                    <span className="st-donut-pct" style={{ color: d.color }}>{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Three-column row */}
      <div className="st-three-row">
        {/* Par type de séjour — live par_type */}
        <div className="st-card">
          <div className="st-card-title">Par type de séjour</div>
          {loading ? (
            <div className="st-hbar-list">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} style={{ height: '36px', marginBottom: '10px' }} />
              ))}
            </div>
          ) : parType.length === 0 ? (
            <p className="st-empty">Aucune donnée disponible.</p>
          ) : (
            <div className="st-hbar-list">
              {parType.map((t, i) => (
                <div key={i} className="st-hbar-item">
                  <div className="st-hbar-label-row">
                    <span>{t.label}</span>
                    <span style={{ fontWeight: 700 }}>{t.value}</span>
                  </div>
                  <div className="st-hbar-track">
                    <div
                      className="st-hbar-fill"
                      style={{
                        width: `${Math.round((t.value / parTypeMax) * 100)}%`,
                        background: typeColors[i % typeColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Par zone géographique — live par_zone + top_destinations */}
        <div className="st-card">
          <div className="st-card-title">Par zone géographique</div>
          {loading ? (
            <>
              <Skeleton style={{ height: '36px', marginBottom: '10px' }} />
              <Skeleton style={{ height: '36px', marginBottom: '10px' }} />
            </>
          ) : (
            <>
              <div className="st-geo-list">
                {parZone.map((z, i) => (
                  <div key={i} className="st-geo-item">
                    <div className="st-geo-label-row">
                      <span>{z.label}</span>
                      <span style={{ fontWeight: 700 }}>{z.value}</span>
                    </div>
                    <div className="st-geo-track">
                      <div
                        className="st-geo-fill"
                        style={{
                          width: `${Math.round((z.value / parZoneMax) * 100)}%`,
                          background: zoneColors[i % zoneColors.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {topDest.length > 0 && (
                <div className="st-geo-destinations">
                  <div className="st-geo-dest-title">Destinations les plus demandées :</div>
                  <div className="st-geo-dest-tags">
                    {topDest.slice(0, 5).map((d, i) => (
                      <span key={i} className="st-geo-tag">{d.label} ({d.value})</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Délai de traitement — live delai_traitement */}
        <div className="st-card">
          <div className="st-card-title">Délai de traitement</div>
          {loading ? (
            <div className="st-delay-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} style={{ height: '28px', marginBottom: '8px' }} />
              ))}
            </div>
          ) : (
            <div className="st-delay-list">
              {delaiItems.map((item, i) => (
                <div key={i} className="st-delay-item">
                  <span className="st-delay-label">{item.label}</span>
                  <span className="st-delay-badge" style={{ background: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Evolution mensuelle line chart — live */}
      <div className="st-card">
        <div className="st-card-title">Évolution mensuelle des demandes</div>
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <Skeleton style={{ height: '140px' }} />
          ) : (
            <EvolutionLineChart data={trendData} />
          )}
        </div>
      </div>

      {/* Department table — static (no API equivalent) */}
      <div className="st-card">
        <div className="st-card-title">Tableau détaillé - Activité par département</div>
        <div className="st-table-wrap" style={{ marginTop: '12px' }}>
          <table className="st-table">
            <thead>
              <tr>
                <th>Département</th>
                <th>Total demandes</th>
                <th>Approuvées</th>
                <th>En attente</th>
                <th>Rejetées</th>
                <th>Taux approbation</th>
                <th>Délai moyen</th>
                <th>Tendance</th>
              </tr>
            </thead>
            <tbody>
              {departements.map((d, i) => (
                <tr key={i}>
                  <td>{d.name}</td>
                  <td style={{ fontWeight: 600 }}>{d.total}</td>
                  <td className="st-table-num">{d.approved}</td>
                  <td className={d.pending === 0 ? 'st-table-num' : 'st-table-orange'}>{d.pending}</td>
                  <td className={d.rejected === 0 ? 'st-table-num' : 'st-table-red'}>{d.rejected}</td>
                  <td>
                    <span className={`st-table-pct ${d.rate >= 80 ? 'high' : 'mid'}`}>{d.rate}%</span>
                  </td>
                  <td style={{ color: '#6b7280' }}>{d.delay}</td>
                  <td>
                    <span className={`st-trend-arrow ${d.trend}`}>
                      {d.trend === 'up' ? '↑' : '↓'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom two tables */}
      <div className="st-bottom-row">
        {/* Top destinations table — live */}
        <div className="st-card">
          <div className="st-card-title">Tableau - Destinations principales</div>
          <div className="st-table-wrap" style={{ marginTop: '12px' }}>
            <table className="st-table">
              <thead>
                <tr>
                  <th>Pays</th>
                  <th>Demandes</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3}><Skeleton style={{ height: '20px' }} /></td></tr>
                ) : topDest.length === 0 ? (
                  <tr><td colSpan={3} style={{ color: '#9ca3af', textAlign: 'center' }}>Aucune donnée</td></tr>
                ) : (
                  topDest.map((d, i) => (
                    <tr key={i}>
                      <td>{d.label}</td>
                      <td style={{ fontWeight: 600 }}>{d.value}</td>
                      <td style={{ color: '#6b7280' }}>
                        {Math.round((d.value / destTotal) * 100)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Durées table — static */}
        <div className="st-card">
          <div className="st-card-title">Tableau - Durée des missions</div>
          <div className="st-table-wrap" style={{ marginTop: '12px' }}>
            <table className="st-table">
              <thead>
                <tr>
                  <th>Durée</th>
                  <th>Type</th>
                  <th>Nombre</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {durees.map((d, i) => (
                  <tr key={i}>
                    <td>{d.range}</td>
                    <td>
                      <span className={`st-badge-tag ${d.type === 'Séjour' ? 'st-type-sejour' : 'st-type-stage'}`}>{d.type}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.count}</td>
                    <td style={{ color: '#6b7280' }}>{d.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Statistiques;
