import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { MetricCard, Card, SectionHeader, StatusBadge, Avatar, Btn, ProgressBar } from '../../components/Admin/AdminUI';

const trendData = [
  { month: 'Nov', received: 38, resolved: 32 },
  { month: 'Dec', received: 42, resolved: 38 },
  { month: 'Jan', received: 51, resolved: 44 },
  { month: 'Feb', received: 49, resolved: 46 },
  { month: 'Mar', received: 58, resolved: 51 },
  { month: 'Apr', received: 42, resolved: 38 },
];

const categoryData = [
  { name: 'Roads & Infrastructure', value: 32, color: '#1a4fa0' },
  { name: 'Waste Management',       value: 24, color: '#639922' },
  { name: 'Water Supply',           value: 18, color: '#ba7517' },
  { name: 'Noise Pollution',        value: 14, color: '#d4537e' },
  { name: 'Others',                 value: 12, color: '#888780' },
];

const recentComplaints = [
  { id: 'ADU-248', title: 'Jalan berlubang Taman Kulai Jaya', category: 'Roads',    status: 'Pending' },
  { id: 'ADU-247', title: 'Lampu jalan mati sejak 3 hari',    category: 'Lighting', status: 'In Progress' },
  { id: 'ADU-246', title: 'Sampah tidak dikutip 3 hari',      category: 'Waste',    status: 'Resolved' },
  { id: 'ADU-245', title: 'Air kotor dari paip rumah',        category: 'Water',    status: 'Pending' },
  { id: 'ADU-244', title: 'Bising kilang waktu malam',        category: 'Noise',    status: 'In Progress' },
];

const chatActivity = [
  { initials: 'RH', name: 'Razif Hamdan',    msg: 'Bagaimana cara nak buat aduan jalan rosak?',  time: '2m ago' },
  { initials: 'NI', name: 'Norhayati Ismail', msg: 'Status aduan saya bila nak selesai?',          time: '8m ago' },
  { initials: 'ZA', name: 'Zulkifli Ahmad',   msg: 'Nak renew lesen perniagaan macam mana?',       time: '14m ago' },
  { initials: 'FM', name: 'Faridah Mokhtar',  msg: 'Sampah tak dikutip sudah 3 hari',              time: '21m ago' },
];

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total Complaints"  value="248"   sub="↑ 12% this month"  subColor="up" />
        <MetricCard label="Resolved"          value="183"   sub="73.8% resolution rate" subColor="up" />
        <MetricCard label="Pending Review"    value="42"    sub="↑ 5 from yesterday" subColor="down" />
        <MetricCard label="Chatbot Sessions"  value="1,204" sub="↑ 28% this week"   subColor="up" />
      </div>

      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Trend chart */}
        <Card>
          <SectionHeader
            title="Complaint trends (6 months)"
            right={
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#888780' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#1a4fa0', display: 'inline-block' }} />
                  Received
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#639922', display: 'inline-block' }} />
                  Resolved
                </span>
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1efe8" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#aaa89e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#aaa89e' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eceae4' }} />
              <Line type="monotone" dataKey="received" stroke="#1a4fa0" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="resolved" stroke="#639922" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category pie */}
        <Card>
          <SectionHeader title="Complaints by category" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PieChart width={120} height={120}>
              <Pie data={categoryData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div style={{ flex: 1, fontSize: 11 }}>
              {categoryData.map((c) => (
                <div key={c.name} style={{ marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, color: '#333' }}>
                    <span>{c.name}</span>
                    <span style={{ fontWeight: 600 }}>{c.value}%</span>
                  </div>
                  <ProgressBar value={c.value} color={c.color} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Live chatbot */}
        <Card>
          <SectionHeader
            title="Recent chatbot activity"
            right={<span style={{ fontSize: 11, background: '#e8f0fb', color: '#1a4fa0', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>Live</span>}
          />
          {chatActivity.map((c, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              padding: '9px 0',
              borderBottom: i < chatActivity.length - 1 ? '1px solid #f1efe8' : 'none',
            }}>
              <Avatar initials={c.initials} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#888780', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.msg}</div>
              </div>
              <div style={{ fontSize: 10, color: '#aaa89e', whiteSpace: 'nowrap' }}>{c.time}</div>
            </div>
          ))}
        </Card>

        {/* Recent complaints */}
        <Card>
          <SectionHeader
            title="Recent complaints"
            right={<Btn small onClick={() => navigate('/admin/complaints')}>View all</Btn>}
          />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Title', 'Category', 'Status'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#888780', borderBottom: '1px solid #eceae4' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((c, i) => (
                <tr key={i} style={{ borderBottom: i < recentComplaints.length - 1 ? '1px solid #f1efe8' : 'none' }}>
                  <td style={{ padding: '8px 8px', color: '#333', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                  <td style={{ padding: '8px 8px', color: '#888780' }}>{c.category}</td>
                  <td style={{ padding: '8px 8px' }}><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
