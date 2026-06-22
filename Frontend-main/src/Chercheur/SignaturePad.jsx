import { useRef, useState } from 'react';

export default function SignaturePad({ signed, onSign, onClear }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const syncSize = () => {
    const canvas = canvasRef.current;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const start = (e) => {
    syncSize();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.strokeStyle = '#1A3A6B';
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    onSign();
  };

  const stop = () => setDrawing(false);

  const clear = (e) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="sp-wrap">
      <p className="sp-label">Signature électronique</p>
      <div className="sp-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="sp-canvas"
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
        />
        {!signed && <p className="sp-placeholder">Signez ici...</p>}
      </div>
      <div className="sp-footer">
        {signed && <span className="sp-done">✔ Signé électroniquement</span>}
        <button className="sp-clear-btn" onClick={clear}>Effacer</button>
      </div>
    </div>
  );
}
