import { useEffect, useRef } from 'react';

// ── Donut Pie Chart ──────────────────────────────────────
export function PieChart({ data, colors, width = 220, height = 220 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = width / 2, cy = height / 2;
    const radius = Math.min(cx, cy) - 16;
    const total = data.reduce((s, d) => s + d.value, 0);
    let startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, width, height);
    data.forEach((item, i) => {
      const slice = (item.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(8,13,26,0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
      const mid = startAngle + slice / 2;
      const lx = cx + Math.cos(mid) * radius * 0.65;
      const ly = cy + Math.sin(mid) * radius * 0.65;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Inter,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (slice > 0.3) ctx.fillText(Math.round((item.value / total) * 100) + '%', lx, ly);
      startAngle += slice;
    });
    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#0e1628';
    ctx.fill();
    ctx.fillStyle = '#f0f4ff';
    ctx.font = 'bold 13px Outfit,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Budget', cx, cy - 9);
    ctx.font = '11px Inter,sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Split', cx, cy + 9);
  }, [data, colors, width, height]);
  return <canvas ref={ref} width={width} height={height} />;
}

// ── Line Chart ───────────────────────────────────────────
export function LineChart({ labels, datasets, width = 400, height = 220 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const padL = 48, padR = 16, padT = 16, padB = 36;
    const cW = width - padL - padR, cH = height - padT - padB;
    const all = datasets.flatMap(d => d.data);
    const maxV = Math.max(...all) * 1.15 || 100;
    const gridN = 5;
    ctx.clearRect(0, 0, width, height);
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridN; i++) {
      const y = padT + (cH / gridN) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + cW, y); ctx.stroke();
      ctx.fillStyle = '#4b5563'; ctx.font = '10px Inter,sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(maxV - (maxV / gridN) * i).toLocaleString(), padL - 6, y);
    }
    labels.forEach((l, i) => {
      const x = padL + (cW / (labels.length - 1)) * i;
      ctx.fillStyle = '#4b5563'; ctx.font = '10px Inter,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(l, x, height - padB + 6);
    });
    datasets.forEach(ds => {
      const pts = ds.data.map((v, i) => ({
        x: padL + (cW / (labels.length - 1)) * i,
        y: padT + cH - (v / maxV) * cH,
      }));
      // Area
      const grad = ctx.createLinearGradient(0, padT, 0, padT + cH);
      grad.addColorStop(0, ds.color + '40');
      grad.addColorStop(1, ds.color + '00');
      ctx.beginPath();
      ctx.moveTo(pts[0].x, padT + cH);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, padT + cH);
      ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
      // Line
      ctx.beginPath(); ctx.strokeStyle = ds.color; ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      // Dots
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = ds.color; ctx.fill();
        ctx.strokeStyle = '#0e1628'; ctx.lineWidth = 2; ctx.stroke();
      });
    });
  }, [labels, datasets, width, height]);
  return <canvas ref={ref} width={width} height={height} />;
}

// ── Bar Chart ────────────────────────────────────────────
export function BarChart({ labels, values, colors, width = 400, height = 220 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const padL = 48, padR = 16, padT = 16, padB = 40;
    const cW = width - padL - padR, cH = height - padT - padB;
    const maxV = Math.max(...values) * 1.2 || 100;
    const bW = (cW / labels.length) * 0.58;
    const bG = (cW / labels.length) * 0.42;
    const gridN = 5;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i <= gridN; i++) {
      const y = padT + (cH / gridN) * i;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + cW, y); ctx.stroke();
      ctx.fillStyle = '#4b5563'; ctx.font = '10px Inter,sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(maxV - (maxV / gridN) * i).toLocaleString(), padL - 6, y);
    }
    values.forEach((v, i) => {
      const x = padL + (cW / labels.length) * i + bG / 2;
      const bH = (v / maxV) * cH;
      const y = padT + cH - bH;
      const color = Array.isArray(colors) ? colors[i % colors.length] : colors;
      const grad = ctx.createLinearGradient(0, y, 0, y + bH);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '80');
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, bW, bH, [6, 6, 0, 0]);
      else ctx.rect(x, y, bW, bH);
      ctx.fillStyle = grad; ctx.fill();
      ctx.fillStyle = '#4b5563'; ctx.font = '10px Inter,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(labels[i], x + bW / 2, height - padB + 6);
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px Inter,sans-serif';
      ctx.textBaseline = 'bottom';
      ctx.fillText(v.toLocaleString(), x + bW / 2, y - 2);
    });
  }, [labels, values, colors, width, height]);
  return <canvas ref={ref} width={width} height={height} />;
}
