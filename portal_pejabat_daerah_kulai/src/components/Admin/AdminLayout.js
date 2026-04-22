import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    label: 'Overview',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    ],
  },
  {
    label: 'Modules',
    items: [
      { path: '/admin/complaints',  label: 'Complaint Management',  icon: 'complaint',  badge: 5 },
      { path: '/admin/chatbot',     label: 'AI Chatbot',            icon: 'chatbot' },
      { path: '/admin/users',       label: 'User Management',       icon: 'users' },
      { path: '/admin/faq',         label: 'FAQs & Knowledge Base', icon: 'faq' },
      { path: '/admin/analytics',   label: 'Analytics & Reports',   icon: 'analytics' },
    ],
  },
];

function NavIcon({ name }) {
  const icons = {
    dashboard: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".45" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".45" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".45" />
      </svg>
    ),
    complaint: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 14l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    chatbot: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="5.5" cy="8" r="1" fill="currentColor" />
        <circle cx="8" cy="8" r="1" fill="currentColor" />
        <circle cx="10.5" cy="8" r="1" fill="currentColor" />
      </svg>
    ),
    users: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 13c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    faq: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M8 2C5.239 2 3 4.239 3 7c0 1.38.56 2.63 1.464 3.536L4 14l3.5-1.5A5 5 0 108 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M7.5 6.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .69-.467 1.27-1.1 1.44A.5.5 0 009 8.4V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="9" cy="10.5" r=".6" fill="currentColor" />
      </svg>
    ),
    analytics: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L6 8l3 3 5-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function AdminLayout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f7f4', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: 224,
        background: '#fff',
        borderRight: '1px solid #eceae4',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #eceae4' }}>
          <div style={{
            display: 'inline-block',
            background: '#1a4fa0',
            color: '#c8ddf5',
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            letterSpacing: '.6px',
            marginBottom: 7,
          }}>
            PDK ADMIN
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.35 }}>
            Portal Pejabat<br />Daerah Kulai
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {NAV_ITEMS.map((section) => (
            <div key={section.label} style={{ marginBottom: 6 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#aaa89e',
                letterSpacing: '.8px',
                textTransform: 'uppercase',
                padding: '6px 20px 4px',
              }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 20px',
                      fontSize: 13,
                      color: active ? '#1a4fa0' : '#555450',
                      background: active ? '#e8f0fb' : 'transparent',
                      borderLeft: active ? '2px solid #1a4fa0' : '2px solid transparent',
                      textDecoration: 'none',
                      transition: 'background .15s, color .15s',
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    <NavIcon name={item.icon} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        background: '#e24b4a',
                        color: '#fff',
                        fontSize: 10,
                        padding: '1px 6px',
                        borderRadius: 10,
                        fontWeight: 600,
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Admin user */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #eceae4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1a4fa0', color: '#c8ddf5',
              fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              AM
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>Ahmad Mazlan</div>
              <div style={{ fontSize: 10, color: '#aaa89e' }}>Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 54,
          background: '#fff',
          borderBottom: '1px solid #eceae4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
              {NAV_ITEMS.flatMap(s => s.items).find(i => isActive(i.path))?.label || 'Admin'}
            </span>
            <span style={{ fontSize: 11, color: '#aaa89e' }}>
              Portal PDK › {NAV_ITEMS.flatMap(s => s.items).find(i => isActive(i.path))?.label || ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Bell */}
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid #eceae4', background: '#f8f7f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a4.5 4.5 0 00-4.5 4.5c0 2-.5 3.5-1.5 4.5h12c-1-1-1.5-2.5-1.5-4.5A4.5 4.5 0 008 2zM6.5 13a1.5 1.5 0 003 0" stroke="#555450" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{
                width: 6, height: 6, background: '#e24b4a', borderRadius: '50%',
                position: 'absolute', top: 7, right: 7,
              }} />
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1a4fa0', color: '#c8ddf5',
              fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              AM
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
