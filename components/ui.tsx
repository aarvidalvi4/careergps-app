'use client';
import type { CSSProperties, ReactNode, MouseEvent } from 'react';

export const C = {
  bg: '#f5f6fa', panel: '#ffffff', panel2: '#eef0f6', line: '#e2e5ee',
  text: '#1e1b3a', dim: '#5b6072', faint: '#9499a8',
  lime: '#4f46e5', amber: '#d97706', cyan: '#0d9488', coral: '#e11d62', violet: '#7c3aed',
};
export const FONT_DISPLAY = "'Fraunces', Georgia, serif";
export const FONT_BODY = "'Geist', 'Segoe UI', system-ui, sans-serif";
export const FONT_MONO = "'Geist Mono', 'SF Mono', monospace";

export const btnPrimary: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: C.lime, color: '#fff', padding: '9px 15px',
  borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  textDecoration: 'none', border: 'none', fontFamily: FONT_BODY,
};
export const btnGhost: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'transparent', color: C.text, padding: '9px 14px',
  borderRadius: 10, fontSize: 12.5, cursor: 'pointer',
  textDecoration: 'none', border: `1px solid ${C.line}`, fontFamily: FONT_BODY,
};
export const inputStyle: CSSProperties = {
  width: '100%', background: C.panel2, border: `1px solid ${C.line}`,
  borderRadius: 10, color: C.text, padding: '11px 13px',
  fontFamily: FONT_BODY, fontSize: 14, outline: 'none',
};
export const selStyle: CSSProperties = {
  width: '100%', background: C.panel2, border: `1px solid ${C.line}`,
  borderRadius: 9, color: C.text, padding: '9px 11px',
  fontFamily: FONT_BODY, fontSize: 13, cursor: 'pointer',
};

interface PanelProps {
  children: ReactNode;
  style?: CSSProperties;
  accent?: string;
  className?: string;
  id?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}
export function Panel({ children, style, accent, className, id, onClick }: PanelProps) {
  return (
    <div id={id} onClick={onClick} className={className} style={{
      background: C.panel, border: `1px solid ${C.line}`,
      borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden',
      ...(accent ? { boxShadow: `inset 3px 0 0 ${accent}` } : {}),
      ...(onClick ? { cursor: 'pointer' } : {}),
      ...style,
    }}>{children}</div>
  );
}

export function Pill({ children, color = C.dim, bg, style }: { children: ReactNode; color?: string; bg?: string; style?: CSSProperties }) {
  return (
    <span style={{
      fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 0.5, color,
      background: bg || `${color}1a`, padding: '3px 9px', borderRadius: 20,
      border: `1px solid ${color}33`, whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

export function Ring({ pct, size = 132, stroke = 11, color = C.lime, label, sub }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string; sub?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: size * 0.26, lineHeight: 1, color: C.text }}>{label ?? `${pct}%`}</div>
          {sub && <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.dim, marginTop: 4 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export function Bar({ pct, color = C.lime, h = 8 }: { pct: number; color?: string; h?: number }) {
  return (
    <div style={{ background: C.line, borderRadius: 20, height: h, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 20, transition: 'width 1s cubic-bezier(.2,.8,.2,1)' }} />
    </div>
  );
}

export function Lbl({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 12, color: C.dim, marginBottom: 6 }}>{children}</div>;
}

export function Head({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2, color: C.lime, marginBottom: 8 }}>{kicker}</div>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 500, margin: 0, lineHeight: 1.05 }}>{title}</h1>
      {desc && <p style={{ color: C.dim, fontSize: 14, maxWidth: 660, marginTop: 10, lineHeight: 1.5 }}>{desc}</p>}
    </div>
  );
}

export const VIS_OPTIONS = [
  { id: 'public' as const, icon: 'Globe', label: 'Public profile', desc: 'Visible to everyone — students and verified recruiters.', color: C.lime },
  { id: 'recruiter' as const, icon: 'BadgeCheck', label: 'Recruiter only', desc: 'Visible only to verified recruiters. Hidden from public.', color: C.cyan },
  { id: 'private' as const, icon: 'Lock', label: 'Private', desc: 'Visible only to you. You won\'t appear in recruiter search.', color: C.amber },
];
