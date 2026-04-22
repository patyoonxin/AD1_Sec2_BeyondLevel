import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Card, SectionHeader, MetricCard, Badge, StatusBadge, Avatar, Btn, DataTable,
} from '../../components/Admin/AdminUI';

const sessionData = [
  { day: 'Mon', sessions: 142 },
  { day: 'Tue', sessions: 187 },
  { day: 'Wed', sessions: 214 },
  { day: 'Thu', sessions: 196 },
  { day: 'Fri', sessions: 223 },
  { day: 'Sat', sessions: 98 },
  { day: 'Sun', sessions: 144 },
];

const topQueries = [
  { topic: 'Complaint submission process', count: 312, pct: '25.9%', color: '#1a4fa0' },
  { topic: 'Complaint status tracking',    count: 287, pct: '23.8%', color: '#1a4fa0' },
  { topic: 'Business license renewal',     count: 198, pct: '16.4%', color: '#639922' },
  { topic: 'Office hours & location',      count: 154, pct: '12.8%', color: '#639922' },
  { topic: 'Waste collection schedule',    count: 142, pct: '11.8%', color: '#ba7517' },
  { topic: 'Others',                       count: 111, pct: '9.2%',  color: '#888780' },
];

const recentConversations = [
  { initials: 'RH', name: 'Razif H.',      message: 'Bagaimana nak buat aduan jalan rosak?',   summary: 'Directed to complaint form with step-by-step guide', resolved: 'Yes',      time: '2m ago' },
  { initials: 'NI', name: 'Norhayati I.',  message: 'Status aduan #ADU-230 macam mana?',        summary: 'Retrieved complaint status: In Progress',            resolved: 'Yes',      time: '8m ago' },
  { initials: 'ZA', name: 'Zulkifli A.',   message: 'Nak renew lesen perniagaan',               summary: 'Escalated to business licensing officer',            resolved: 'Escalated',time: '14m ago' },
  { initials: 'FM', name: 'Faridah M.',    message: 'Sampah tak dikutip sudah 3 hari',          summary: 'Logged as new complaint ADU-249',                    resolved: 'Yes',      time: '22m ago' },
];

const convoColumns = [
  {
    key: 'name', label: 'User',
    render: (v, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar initials={row.initials} size={26} />
        <span style={{ fontWeight: 500 }}>{v}</span>
      </div>
    ),
  },
  { key: 'message', label: 'Message',          render: (v) => <span style={{ color: '#555450', maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
  { key: 'summary', label: 'Bot response',     render: (v) => <span style={{ color: '#888780', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
  { key: 'resolved',label: 'Resolved',         render: (v) => <StatusBadge status={v} /> },
  { key: 'time',    label: 'Time',             render: (v) => <span style={{ color: '#aaa89e' }}>{v}</span> },
];

function AdminChatbot() {
  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total Sessions"       value="1,204" sub="↑ 28% this week"      subColor="up" />
        <MetricCard label="Avg Response Time"    value="1.3s"  sub="↓ 0.2s improved"      subColor="up" />
        <MetricCard label="Resolved by AI"       value="78%"   sub="of total queries"      subColor="neu" />
        <MetricCard label="Escalated to Staff"   value="264"   sub="22% escalation rate"   subColor="down" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Top queries table */}
        <Card>
          <SectionHeader
            title="Common user questions"
            right={<Badge variant="gray">AI Categorized</Badge>}
          />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Query topic', 'Count', '% of total'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#888780', borderBottom: '1px solid #eceae4' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topQueries.map((q, i) => (
                <tr key={i} style={{ borderBottom: i < topQueries.length - 1 ? '1px solid #f1efe8' : 'none' }}>
                  <td style={{ padding: '8px 8px', color: '#333' }}>{q.topic}</td>
                  <td style={{ padding: '8px 8px', color: '#555' }}>{q.count}</td>
                  <td style={{ padding: '8px 8px', fontWeight: 600, color: q.color }}>{q.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Daily sessions bar chart */}
        <Card>
          <SectionHeader title="Chatbot sessions (daily)" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1efe8" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#aaa89e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#aaa89e' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eceae4' }} />
              <Bar dataKey="sessions" fill="#1a4fa0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Conversation history */}
      <Card>
        <SectionHeader
          title="Recent chatbot conversations"
          right={<Btn small>View all history</Btn>}
        />
        <DataTable columns={convoColumns} rows={recentConversations} />
      </Card>
    </div>
  );
}

export default AdminChatbot;
