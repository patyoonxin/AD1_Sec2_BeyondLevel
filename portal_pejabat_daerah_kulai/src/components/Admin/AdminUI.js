import React from 'react';

/* ── Badge ───────────────────────────────────────────── */
const BADGE_STYLES = {
  success:  { background: '#eaf3de', color: '#3b6d11' },
  warning:  { background: '#faeeda', color: '#854f0b' },
  info:     { background: '#e8f0fb', color: '#1a4fa0' },
  danger:   { background: '#fcebeb', color: '#a32d2d' },
  gray:     { background: '#f1efe8', color: '#5f5e5a' },
  purple:   { background: '#eeedfe', color: '#534ab7' },
};

export function Badge({ variant = 'gray', children }) {
  const s = BADGE_STYLES[variant] || BADGE_STYLES.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 10,
      fontSize: 11, fontWeight: 600,
      ...s,
    }}>
      {children}
    </span>
  );
}

/* ── StatusBadge helper ──────────────────────────────── */
export function StatusBadge({ status }) {
  const map = {
    'Pending':     { variant: 'warning', label: 'Pending' },
    'In Progress': { variant: 'info',    label: 'In Progress' },
    'Resolved':    { variant: 'success', label: 'Resolved' },
    'Active':      { variant: 'success', label: 'Active' },
    'Banned':      { variant: 'danger',  label: 'Banned' },
    'Published':   { variant: 'success', label: 'Published' },
    'Draft':       { variant: 'gray',    label: 'Draft' },
    'Yes':         { variant: 'success', label: 'Yes' },
    'Escalated':   { variant: 'warning', label: 'Escalated' },
  };
  const { variant, label } = map[status] || { variant: 'gray', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

/* ── MetricCard ──────────────────────────────────────── */
export function MetricCard({ label, value, sub, subColor }) {
  const colorMap = { up: '#3b6d11', down: '#a32d2d', neu: '#aaa89e' };
  return (
    <div style={{
      background: '#f1efe8',
      borderRadius: 8,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: '#888780', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1, color: '#1a1a1a' }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, color: colorMap[subColor] || '#aaa89e', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/* ── Card ────────────────────────────────────────────── */
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #eceae4',
      borderRadius: 12,
      padding: '16px 20px',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── SectionHeader ───────────────────────────────────── */
export function SectionHeader({ title, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 14,
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{title}</span>
      {right && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>}
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────── */
const AVATAR_COLORS = [
  { bg: '#e8f0fb', fg: '#1a4fa0' },
  { bg: '#faeeda', fg: '#854f0b' },
  { bg: '#eaf3de', fg: '#3b6d11' },
  { bg: '#fbeaf0', fg: '#993556' },
  { bg: '#eeedfe', fg: '#534ab7' },
  { bg: '#e1f5ee', fg: '#0f6e56' },
];

export function Avatar({ initials, size = 28 }) {
  const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  const { bg, fg } = AVATAR_COLORS[idx];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      fontSize: size * 0.38, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ── Btn ─────────────────────────────────────────────── */
export function Btn({ children, primary, small, onClick, style: extStyle = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: small ? '5px 11px' : '7px 16px',
        fontSize: small ? 11 : 13,
        borderRadius: 7,
        border: primary ? 'none' : '1px solid #d3d1c7',
        background: primary ? '#1a4fa0' : '#f1efe8',
        color: primary ? '#e8f0fb' : '#1a1a1a',
        cursor: 'pointer',
        fontWeight: 500,
        ...extStyle,
      }}
    >
      {children}
    </button>
  );
}

/* ── IconBtn ─────────────────────────────────────────── */
export function IconBtn({ children, danger, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 27, height: 27,
        borderRadius: 6,
        border: '1px solid #eceae4',
        background: '#f8f7f4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        color: danger ? '#a32d2d' : '#555450',
      }}
    >
      {children}
    </button>
  );
}

/* ── DataTable ───────────────────────────────────────── */
export function DataTable({ columns, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                textAlign: 'left', padding: '8px 12px',
                fontSize: 11, fontWeight: 600, color: '#888780',
                borderBottom: '1px solid #eceae4',
                background: '#f8f7f4',
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? '1px solid #f1efe8' : 'none' }}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '9px 12px', color: '#333', verticalAlign: 'middle' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── SearchBar ───────────────────────────────────────── */
export function SearchBar({ placeholder, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#f8f7f4', border: '1px solid #eceae4',
      borderRadius: 7, padding: '7px 12px', marginBottom: 14,
    }}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="#aaa89e" strokeWidth="1.4" />
        <path d="M11 11l3 3" stroke="#aaa89e" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          border: 'none', background: 'transparent', outline: 'none',
          fontSize: 12, color: '#333', flex: 1,
        }}
      />
    </div>
  );
}

/* ── Tabs ────────────────────────────────────────────── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #eceae4', marginBottom: 16 }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: '9px 16px', fontSize: 12,
            color: active === tab.key ? '#1a4fa0' : '#888780',
            background: 'none', border: 'none',
            borderBottom: active === tab.key ? '2px solid #1a4fa0' : '2px solid transparent',
            marginBottom: -1, cursor: 'pointer',
            fontWeight: active === tab.key ? 600 : 400,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── ProgressBar ─────────────────────────────────────── */
export function ProgressBar({ value, color = '#1a4fa0' }) {
  return (
    <div style={{ height: 5, background: '#f1efe8', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}
