import React from 'react';

/* ── Badge ───────────────────────────────────────────── */
const BADGE_STYLES = {
  success:  { background: '#dcfce7', color: '#15803d' },
  warning:  { background: '#fef9c3', color: '#a16207' },
  info:     { background: '#dbeafe', color: '#1d4ed8' },
  danger:   { background: '#fee2e2', color: '#dc2626' },
  gray:     { background: '#f3f4f6', color: '#6b7280' },
  purple:   { background: '#ede9fe', color: '#6d28d9' },
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
export function MetricCard({ label, value, sub, subColor, accentColor }) {
  const colorMap = { up: '#15803d', down: '#dc2626', neu: '#9ca3af' };
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderLeft: `4px solid ${accentColor || '#2563eb'}`,
      borderRadius: 10,
      padding: '14px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: '#111827' }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, color: colorMap[subColor] || '#9ca3af', marginTop: 4 }}>
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
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
      justifyContent: 'space-between', marginBottom: 16,
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{title}</span>
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
export function Btn({ children, primary, small, onClick, style: extStyle = {}, disabled, type }) {
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? '6px 12px' : '8px 18px',
        fontSize: small ? 12 : 13,
        borderRadius: 8,
        border: primary ? 'none' : '1px solid #e5e7eb',
        background: primary ? '#2563eb' : '#f9fafb',
        color: primary ? '#fff' : '#374151',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        opacity: disabled ? 0.6 : 1,
        boxShadow: primary ? '0 1px 3px rgba(37,99,235,0.25)' : 'none',
        transition: 'background 0.15s, box-shadow 0.15s',
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
        width: 28, height: 28,
        borderRadius: 7,
        border: `1px solid ${danger ? '#fecaca' : '#e5e7eb'}`,
        background: danger ? '#fff5f5' : '#f9fafb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        color: danger ? '#dc2626' : '#6b7280',
        transition: 'background 0.15s',
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
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                textAlign: 'left', padding: '10px 14px',
                fontSize: 12, fontWeight: 600, color: '#6b7280',
                borderBottom: '1px solid #e5e7eb',
                background: '#f9fafb',
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '11px 14px', color: '#374151', verticalAlign: 'middle' }}>
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
export function SearchBar({ placeholder, value, onChange, onClear }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#f9fafb', border: '1px solid #e5e7eb',
      borderRadius: 9, padding: '8px 14px', marginBottom: 14,
    }}>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="#9ca3af" strokeWidth="1.4" />
        <path d="M11 11l3 3" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          border: 'none', background: 'transparent', outline: 'none',
          fontSize: 13, color: '#111827', flex: 1,
        }}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          title="Clear search"
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: '#9ca3af', padding: 2, lineHeight: 1, fontSize: 14,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

/* ── Tabs ────────────────────────────────────────────── */
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: '10px 16px', fontSize: 13,
            color: active === tab.key ? '#2563eb' : '#6b7280',
            background: 'none', border: 'none',
            borderBottom: active === tab.key ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: -1, cursor: 'pointer',
            fontWeight: active === tab.key ? 600 : 400,
            transition: 'color 0.15s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ── ProgressBar ─────────────────────────────────────── */
export function ProgressBar({ value, color = '#2563eb' }) {
  return (
    <div style={{ height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}
