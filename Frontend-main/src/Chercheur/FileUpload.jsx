import { useState, useRef } from 'react';

const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FileUpload({ label, hint, subHint, required, value, onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file) onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => onChange(null);

  return (
    <div className="fu-wrap">
      <div className="fu-label-row">
        <span className="fu-label">
          {label}
          {required && <span className="fu-required">  <span className="fu-required-star">*</span></span>}
        </span>
        {hint && <span className="fu-hint">{hint}</span>}
      </div>
      {subHint && <span className="fu-sub-hint">{subHint}</span>}

      {value ? (
        <div className="fu-success">
          <span className="fu-success-icon"><IconCheck /></span>
          <div className="fu-success-info">
            <span className="fu-file-name">{value.name}</span>
            <span className="fu-file-status">Téléchargé avec succès</span>
          </div>
          <div className="fu-success-actions">
            <button className="fu-action-btn fu-replace" onClick={() => inputRef.current.click()}>Remplacer</button>
            <button className="fu-action-btn fu-delete" onClick={handleRemove}>Supprimer</button>
          </div>
          <input ref={inputRef} type="file" hidden onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div
          className={`fu-dropzone${dragging ? ' fu-dropzone--active' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <span className="fu-drop-icon"><IconUpload /></span>
          <p className="fu-drop-text">
            <span className="fu-drop-link">Cliquer pour télécharger</span> ou glisser-déposer
          </p>
          {hint && <p className="fu-drop-hint">{hint}</p>}
          <input ref={inputRef} type="file" hidden onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}
