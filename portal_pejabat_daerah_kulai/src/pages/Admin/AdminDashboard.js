import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MetricCard,
  Card,
  SectionHeader,
  StatusBadge,
  Avatar,
  Btn,
  ProgressBar,
} from "../../components/Admin/AdminUI";

const API_BASE = "http://127.0.0.1:8000/api";

const CATEGORY_COLORS = [
  "#1a4fa0",
  "#639922",
  "#ba7517",
  "#d4537e",
  "#888780",
  "#e24b4a",
  "#534ab7",
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);

  // ── UC026: Fetch real stats from API ─────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [compRes, chatRes] = await Promise.allSettled([
        fetch(`${API_BASE}/admin/analytics/generate?type=monthly`, {
          headers: { Accept: "application/json" },
        }),
        fetch(`${API_BASE}/conversations`, {
          headers: { Accept: "application/json" },
        }),
      ]);

      // Complaints data
      if (compRes.status === "fulfilled" && compRes.value.ok) {
        const data = await compRes.value.json();
        setComplaints(data.rows || []);
        if (data.monthly_breakdown) setMonthlyBreakdown(data.monthly_breakdown);
      } else {
        // Fallback to complaints endpoint
        const res2 = await fetch(
          `${API_BASE}/admin/complaints?page=1&per_page=100`,
          { headers: { Accept: "application/json" } },
        );
        const data2 = await res2.json();
        setComplaints(Array.isArray(data2) ? data2 : data2.data || []);
      }

      // Chat sessions
      if (chatRes.status === "fulfilled" && chatRes.value.ok) {
        const chatData = await chatRes.value.json();
        setChatSessions(Array.isArray(chatData) ? chatData : []);
      }
    } catch {
      setError("Failed to load statistics. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ── UC026: Derived statistics ─────────────────────────────────────────────
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const pending = complaints.filter((c) => c.status === "Pending").length;
  const inProgress = complaints.filter(
    (c) => c.status === "In Progress",
  ).length;
  const resRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : "0";

  // UC026 A1: Chatbot summaries
  const totalChatSessions = chatSessions.length;
  const openSessions = chatSessions.filter((s) => s.status === "open").length;

  // UC026 A2: Complaint summaries by category
  const categoryMap = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({ name, value, color: CATEGORY_COLORS[i] }));
  const categoryTotal = categoryData.reduce((s, c) => s + c.value, 0);

  // UC026 A3: Monthly trend — use monthly_breakdown from API
  const trendData =
    monthlyBreakdown.length > 0
      ? monthlyBreakdown.slice(-6).map((d) => ({
          month: d.month ? d.month.split(" ")[0] : "",
          received: d.received ?? d.count ?? 0,
          resolved: d.resolved ?? 0,
        }))
      : Array.from({ length: 6 }, (_, i) => {
          const now = new Date();
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return {
            month: d.toLocaleString("en-MY", { month: "short" }),
            received: 0,
            resolved: 0,
          };
        });

  // Recent complaints (latest 5)
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div>
      {/* UC026 A5: Error banner */}
      {error && (
        <div
          style={{
            background: "#fcebeb",
            border: "1px solid #f5c6c6",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 16,
            fontSize: 12,
            color: "#a32d2d",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚠ {error}</span>
          <Btn small onClick={fetchStats}>
            Refresh
          </Btn>
        </div>
      )}

      {/* UC026: Metric cards — statistical summaries */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard
          label="Total Complaints"
          value={loading ? "…" : total}
          sub={
            total === 0 ? "No data available yet." : `${inProgress} in progress`
          }
          subColor={total === 0 ? "neu" : "neu"}
        />
        <MetricCard
          label="Resolved"
          value={loading ? "…" : resolved}
          sub={loading ? "" : `${resRate}% resolution rate`}
          subColor="up"
        />
        <MetricCard
          label="Unprocessed"
          value={loading ? "…" : pending}
          sub={pending > 0 ? "Needs attention" : "All processed"}
          subColor={pending > 0 ? "down" : "up"}
        />
        <MetricCard
          label="Chatbot Sessions"
          value={loading ? "…" : totalChatSessions}
          sub={`${openSessions} active sessions`}
          subColor="up"
        />
      </div>

      {/* Row 1: Trend chart + Category breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* UC026 A3: Trend chart — complaint volume over time */}
        <Card>
          <SectionHeader
            title="Complaint trend (6 months)"
            right={
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 11,
                  color: "#888780",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: "#1a4fa0",
                      display: "inline-block",
                    }}
                  />
                  Diterima
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: "#639922",
                      display: "inline-block",
                    }}
                  />
                  Diselesaikan
                </span>
              </div>
            }
          />
          {loading ? (
            <div
              style={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 12,
              }}
            >
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1efe8" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#aaa89e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#aaa89e" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #eceae4",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="received"
                  stroke="#1a4fa0"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#639922"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* UC026 A2: Category breakdown */}
        <Card>
          <SectionHeader title="Complaints by category" />
          {loading ? (
            <div
              style={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 12,
              }}
            >
              Loading...
            </div>
          ) : categoryData.length === 0 ? (
            <div
              style={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 12,
              }}
            >
              No data available yet.
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <PieChart width={120} height={120}>
                <Pie
                  data={categoryData}
                  cx={55}
                  cy={55}
                  innerRadius={35}
                  outerRadius={55}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v) => [`${v} aduan`]}
                />
              </PieChart>
              <div style={{ flex: 1, fontSize: 11 }}>
                {categoryData.map((c) => (
                  <div key={c.name} style={{ marginBottom: 7 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 3,
                        color: "#333",
                      }}
                    >
                      <span>{c.name}</span>
                      <span style={{ fontWeight: 600 }}>
                        {categoryTotal > 0
                          ? Math.round((c.value / categoryTotal) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        categoryTotal > 0 ? (c.value / categoryTotal) * 100 : 0
                      }
                      color={c.color}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Row 2: Chatbot summary + Recent complaints */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* UC026 A1: Chatbot summaries */}
        <Card>
          <SectionHeader
            title="Chatbot summary"
            right={
              <span
                style={{
                  fontSize: 11,
                  background: "#e8f0fb",
                  color: "#1a4fa0",
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                Live
              </span>
            }
          />
          {loading ? (
            <div
              style={{
                color: "#aaa",
                fontSize: 12,
                padding: "20px 0",
                textAlign: "center",
              }}
            >
              Loading...
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    label: "Total sessions",
                    value: totalChatSessions,
                    color: "#1a4fa0",
                  },
                  {
                    label: "Active sessions",
                    value: openSessions,
                    color: "#639922",
                  },
                  {
                    label: "Closed sessions",
                    value: chatSessions.filter((s) => s.status === "closed")
                      .length,
                    color: "#888780",
                  },
                  {
                    label: "Pending sessions",
                    value: chatSessions.filter((s) => s.status === "pending")
                      .length,
                    color: "#ba7517",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "#f8f7f4",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{ fontSize: 18, fontWeight: 700, color: s.color }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{ fontSize: 10, color: "#888780", marginTop: 2 }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat list with last update */}
              {chatSessions.length === 0 ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "#aaa89e",
                    textAlign: "center",
                    padding: "8px 0",
                  }}
                >
                  No data available yet.
                </div>
              ) : (
                <div style={{ borderTop: "1px solid #eceae4", paddingTop: 10 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#555",
                      marginBottom: 8,
                    }}
                  >
                    Recent chat sessions
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      maxHeight: 150,
                      overflowY: "auto",
                    }}
                  >
                    {chatSessions.slice(0, 5).map((s, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "6px 8px",
                          background: "#f8f7f4",
                          borderRadius: 7,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: "#e8f0fb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#1a4fa0",
                              flexShrink: 0,
                            }}
                          >
                            {(s.user?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#1a1a1a",
                              }}
                            >
                              {s.user?.name || "User"}
                            </div>
                            <div style={{ fontSize: 10, color: "#aaa89e" }}>
                              {s.updated_at
                                ? new Date(s.updated_at).toLocaleString(
                                    "en-MY",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )
                                : "—"}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 6,
                            fontWeight: 600,
                            background:
                              s.status === "open"
                                ? "#e8f0fb"
                                : s.status === "pending"
                                  ? "#faeeda"
                                  : "#f1efe8",
                            color:
                              s.status === "open"
                                ? "#1a4fa0"
                                : s.status === "pending"
                                  ? "#854f0b"
                                  : "#555",
                          }}
                        >
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* UC026 A2: Recent complaints */}
        <Card>
          <SectionHeader
            title="Recent complaints"
            right={
              <Btn small onClick={() => navigate("/admin/complaints")}>
                View all
              </Btn>
            }
          />
          {loading ? (
            <div
              style={{
                color: "#aaa",
                fontSize: 12,
                padding: "20px 0",
                textAlign: "center",
              }}
            >
              Loading...
            </div>
          ) : recentComplaints.length === 0 ? (
            <div
              style={{
                color: "#aaa",
                fontSize: 12,
                padding: "20px 0",
                textAlign: "center",
              }}
            >
              No data available yet.
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  {["Title", "Category", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "6px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#888780",
                        borderBottom: "1px solid #eceae4",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((c, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < recentComplaints.length - 1
                          ? "1px solid #f1efe8"
                          : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "8px 8px",
                        color: "#333",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.title}
                    </td>
                    <td style={{ padding: "8px 8px", color: "#888780" }}>
                      {c.category}
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
