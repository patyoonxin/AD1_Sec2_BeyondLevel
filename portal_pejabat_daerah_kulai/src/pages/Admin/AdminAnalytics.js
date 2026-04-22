import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Card, SectionHeader, MetricCard, Btn } from '../../components/Admin/AdminUI';

const monthlyData = [
  { month: 'May', count: 38 }, { month: 'Jun', count: 42 }, { month: 'Jul', count: 47 },
  { month: 'Aug', count: 55 }, { month: 'Sep', count: 60 }, { month: 'Oct', count: 48 },
  { month: 'Nov', count: 38 }, { month: 'Dec', count: 42 }, { month: 'Jan', count: 51 },
  { month: 'Feb', count: 49 }, { month: 'Mar', count: 58 }, { month: 'Apr', count: 42 },
];

const resolutionData = [
  { category: 'Waste',     rate: 88, color: '#639922' },
  { category: 'Water',     rate: 84, color: '#639922' },
  { category: 'Noise',     rate: 81, color: '#ba7517' },
  { category: 'Lighting',  rate: 79, color: '#ba7517' },
  { category: 'Drainage',  rate: 74, color: '#e24b4a' },
  { category: 'Roads',     rate: 65, color: '#e24b4a' },
];

const REPORT_CARDS = [
  {
    icon: '📄',
    title: 'Monthly Summary',
    desc: 'Complaint statistics overview',
    bg: '#e8f0fb',
  },
  {
    icon: '📈',
    title: 'Chatbot Analytics',
    desc: 'AI query insights & trends',
    bg: '#eaf3de',
  },
  {
    icon: '⏱',
    title: 'Resolution Times',
    desc: 'Department performance report',
    bg: '#faeeda',
  },
  {
    icon: '👥',
    title: 'User Activity',
    desc: 'Registrations & active users',
    bg: '#eeedfe',
  },
  {
    icon: '❓',
    title: 'FAQ Usage Report',
    desc: 'Most viewed knowledge base entries',
    bg: '#e1f5ee',
  },
  {
    icon: '🔔',
    title: 'Escalation Report',
    desc: 'Chatbot escalation breakdown',
    bg: '#fcebeb',
  },
];

function AdminAnalytics() {
  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Avg resolution time"   value="2.4 days" sub="↓ improved 0.3d"    subColor="up" />
        <MetricCard label="User satisfaction"      value="87%"      sub="↑ 3% this month"    subColor="up" />
        <MetricCard label="Repeat complaints"      value="14%"      sub="needs attention"     subColor="down" />
        <MetricCard label="Reports exported (30d)" value="23"       />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Monthly volume */}
        <Card>
          <SectionHeader
            title="Monthly complaint volume"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#888780' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#1a4fa0', display: 'inline-block' }} />
                Complaints received
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1efe8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#aaa89e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#aaa89e' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eceae4' }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.count === Math.max(...monthlyData.map(d => d.count)) ? '#1a4fa0' : '#b5d4f4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Resolution rate by category */}
        <Card>
          <SectionHeader
            title="Resolution rate by category"
            right={
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#888780' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#639922', display: 'inline-block' }} />High (&gt;80%)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#ba7517', display: 'inline-block' }} />Mid</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#e24b4a', display: 'inline-block' }} />Low</span>
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resolutionData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1efe8" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#aaa89e' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#555' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eceae4' }} formatter={(v) => [`${v}%`, 'Resolution rate']} />
              <Bar dataKey="rate" radius={[0, 3, 3, 0]}>
                {resolutionData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Export reports */}
      <Card>
        <SectionHeader
          title="Generate & export reports"
          right={<Btn primary small>+ Generate Report</Btn>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
          {REPORT_CARDS.map((r) => (
            <div
              key={r.title}
              style={{
                background: '#f8f7f4',
                border: '1px solid #eceae4',
                borderRadius: 8,
                padding: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: r.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{r.title}</div>
                <div style={{ fontSize: 11, color: '#aaa89e', marginTop: 2 }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8f7f4', borderRadius: 8, fontSize: 12, color: '#555450' }}>
          <strong style={{ color: '#1a1a1a' }}>Last export:</strong> Monthly Summary Report — 1 Apr 2026, 9:14 AM &nbsp;·&nbsp;
          <span style={{ color: '#1a4fa0', cursor: 'pointer' }}>Download again</span>
        </div>
      </Card>
    </div>
  );
}

export default AdminAnalytics;
