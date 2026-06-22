import { useState } from 'react';
import './DatePicker.css';

const DAYS   = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];
const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];


export default function DatePicker({ value, onChange, onClose }) {
  const today   = new Date();
  const initial = value ? new Date(value) : today;

  const [viewYear,  setViewYear]  = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

 
  const [pending, setPending] = useState(value || null); 

  const confirmed = value ? new Date(value) : null;

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toIso = (d) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

 
  const clickDay = (d) => {
    if (!d) return;
    setPending(toIso(d));
  };

 
  const handleOk = () => {
    if (pending) onChange(pending);
    onClose();
  };


  const handleCancel = () => {
    setPending(value || null);
    onClose();
  };

  const isPending = (d) => {
    if (!pending || !d) return false;
    const [py, pm, pd] = pending.split('-').map(Number);
    return py === viewYear && pm - 1 === viewMonth && pd === d;
  };

  const isConfirmed = (d) => {
    if (!confirmed || !d) return false;
    return (
      confirmed.getFullYear() === viewYear &&
      confirmed.getMonth()    === viewMonth &&
      confirmed.getDate()     === d
    );
  };

  const isToday = (d) =>
    d &&
    today.getFullYear() === viewYear &&
    today.getMonth()    === viewMonth &&
    today.getDate()     === d;

  return (
    <div className="dp-wrapper">
      <div className="dp-header">
        <button className="dp-nav" onClick={prevMonth}>‹</button>
        <span className="dp-month-label">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="dp-nav" onClick={nextMonth}>›</button>
      </div>

      <div className="dp-grid dp-day-names">
        {DAYS.map(d => <span key={d} className="dp-day-name">{d}</span>)}
      </div>

      <div className="dp-grid dp-days">
        {cells.map((d, i) => {
         const classes = [
           'dp-day',
           !d ? 'dp-empty' : '',
           isPending(d) ? 'dp-pending' : '',
           isConfirmed(d) && !pending ? 'dp-selected' : '',  
           isToday(d) && !isPending(d) && !isConfirmed(d) ? 'dp-today' : '',
         ].filter(Boolean).join(' ');

          return (
            <button
              key={i}
              className={classes}
              onClick={() => clickDay(d)}
              disabled={!d}
            >
              {d || ''}
            </button>
          );
        })}
      </div>

      <div className="dp-footer">
        <button className="dp-cancel-btn" onClick={handleCancel}>Annuler</button>
        <button
          className="dp-ok-btn"
          onClick={handleOk}
          disabled={!pending}
        >
          OK
        </button>
      </div>
    </div>
  );
}
