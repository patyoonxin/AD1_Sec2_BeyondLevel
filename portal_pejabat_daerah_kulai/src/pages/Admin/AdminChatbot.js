import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  SectionHeader,
  MetricCard,
  Badge,
  Avatar,
  Btn,
} from "../../components/Admin/AdminUI";

const API_BASE = "http://127.0.0.1:8000/api";

const DAY_COLORS = [
  "#b5d4f4",
  "#b5d4f4",
  "#b5d4f4",
  "#b5d4f4",
  "#b5d4f4",
  "#b5d4f4",
  "#1a4fa0",
];

// Dynamic source badge — cycles through a palette per unique category name
const BADGE_PALETTE = [
  { bg: "#e8f0fb", color: "#1a4fa0" },
  { bg: "#eaf3de", color: "#3b6d11" },
  { bg: "#faeeda", color: "#854f0b" },
  { bg: "#fcebeb", color: "#a32d2d" },
  { bg: "#eeedfe", color: "#534ab7" },
  { bg: "#e1f5ee", color: "#1a6648" },
  { bg: "#f1efe8", color: "#555450" },
];
const badgeCache = {};
let badgeIndex = 0;
function getSourceStyle(source) {
  const key = (source || "General").toLowerCase();
  if (!badgeCache[key]) {
    badgeCache[key] = BADGE_PALETTE[badgeIndex % BADGE_PALETTE.length];
    badgeIndex++;
  }
  return badgeCache[key];
}

const TYPE_BADGE = {
  Question: { bg: "#e8f0fb", color: "#1a4fa0" },
  Request: { bg: "#eaf3de", color: "#3b6d11" },
  Complaint: { bg: "#fcebeb", color: "#a32d2d" },
  Feedback: { bg: "#eeedfe", color: "#534ab7" },
  Greeting: { bg: "#e1f5ee", color: "#1a6648" },
  Inquiry: { bg: "#e8f0fb", color: "#1a4fa0" },
  Other: { bg: "#f1efe8", color: "#555450" },
  Unclear: { bg: "#faeeda", color: "#854f0b" },
};

function SourceBadge({ source }) {
  const label = source || "General";
  const s = getSourceStyle(label);
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 9px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.3px",
      }}
    >
      {label}
    </span>
  );
}

function TypeBadge({ type }) {
  const s = TYPE_BADGE[type] || { bg: "#f1efe8", color: "#555" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 9px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {type || "—"}
    </span>
  );
}

function ProgressBar({ value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "#eceae4",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#1a4fa0",
            borderRadius: 4,
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: "#888780", minWidth: 32 }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

function AdminChatbot() {
  // UC022 state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UC023 state
  const [interpreted, setInterpreted] = useState([]);
  const [interpLoading, setInterpLoading] = useState(false);
  const [interpError, setInterpError] = useState("");
  const [interpRan, setInterpRan] = useState(false);

  // UC024 state
  const [catRows, setCatRows] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");
  const [catRan, setCatRan] = useState(false);

  // Expandable category rows
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Generate FAQ state
  // ── UC022: Fetch from DB ──────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/chatbot/analyze`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load data. Please try again.");
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── UC023: Interpret queries via Gemini ───────────────────────────────────
  const fetchInterpret = useCallback(async () => {
    setInterpLoading(true);
    setInterpError("");
    setInterpRan(true);
    try {
      const res = await fetch(`${API_BASE}/admin/chatbot/interpret`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("AI service is currently unavailable.");
      const json = await res.json();
      setInterpreted(json.results || []);
    } catch (err) {
      setInterpError(err.message);
    } finally {
      setInterpLoading(false);
    }
  }, []);

  // ── UC024: Categorize queries via Gemini ──────────────────────────────────
  const fetchCategorize = useCallback(async () => {
    setCatLoading(true);
    setCatError("");
    setCatRan(true);
    try {
      const res = await fetch(`${API_BASE}/admin/chatbot/categorize`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Categorization failed. Please try again.");
      const json = await res.json();
      // Build category rows grouped by topic
      const grouped = {};
      (json.results || []).forEach((r) => {
        const topic = r.topic || "Other";
        if (!grouped[topic])
          grouped[topic] = { topic, count: 0, type: r.type, sample: r.query };
        grouped[topic].count++;
        if (!grouped[topic].type) grouped[topic].type = r.type;
        if (!grouped[topic].sample) grouped[topic].sample = r.query;
      });
      setCatRows(Object.values(grouped).sort((a, b) => b.count - a.count));
    } catch (err) {
      setCatError(err.message);
    } finally {
      setCatLoading(false);
    }
  }, []);

  // ── Generate FAQ from conversations ───────────────────────────────────────
  const [faqGenLoading, setFaqGenLoading] = React.useState(false);
  const [faqGenResult, setFaqGenResult] = React.useState(null);
  const [faqGenError, setFaqGenError] = React.useState("");

  const [faqSelected, setFaqSelected] = React.useState([]);
  const [faqSaveLoading, setFaqSaveLoading] = React.useState(false);
  const [faqSaveResult, setFaqSaveResult] = React.useState("");

  const fetchGenerateFaq = async () => {
    setFaqGenLoading(true);
    setFaqGenError("");
    setFaqGenResult(null);
    setFaqSelected([]);
    setFaqSaveResult("");
    try {
      const res = await fetch(`${API_BASE}/admin/chatbot/generate-faq`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to generate FAQ.");
      setFaqGenResult(json);
      // Pre-select only suggestions that don't already exist in DB
      setFaqSelected(
        (json.suggestions || []).reduce((acc, s, i) => {
          if (!s.already_exists) acc.push(i);
          return acc;
        }, []),
      );
    } catch (err) {
      setFaqGenError(err.message);
    } finally {
      setFaqGenLoading(false);
    }
  };

  const toggleFaqSelect = (idx) => {
    setFaqSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const saveSelectedFaq = async () => {
    const suggestions = faqGenResult?.suggestions || [];
    const selected = suggestions.filter((_, i) => faqSelected.includes(i));
    if (selected.length === 0) return;
    setFaqSaveLoading(true);
    setFaqSaveResult("");
    try {
      const res = await fetch(`${API_BASE}/admin/chatbot/save-faq`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selected }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || "Failed to save.");
      setFaqSaveResult(json.message);
      setFaqGenResult(null);
      setFaqSelected([]);
    } catch (err) {
      setFaqSaveResult("Error: " + err.message);
    } finally {
      setFaqSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // UC023: interpret loaded manually via Refresh button to avoid rate limits
  }, [fetchAnalytics]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const total = data?.total_conversations ?? 0;
  const totalMsgs = data?.total_messages ?? 0;
  const userMsgs = data?.user_messages ?? 0;
  const adminReps = data?.admin_replies ?? 0;
  const stats = data?.stats ?? { open: 0, closed: 0, pending: 0 };
  const daily = data?.daily_sessions ?? [];
  const questions = data?.common_questions ?? [];
  const recent = data?.recent_conversations ?? [];

  const totalCatCount = catRows.reduce((s, r) => s + r.count, 0);

  if (error) {
    return (
      <div
        style={{
          background: "#fcebeb",
          borderRadius: 10,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#a32d2d",
            marginBottom: 8,
          }}
        >
          ⚠ {error}
        </div>
        <Btn primary onClick={fetchAnalytics}>
          Cuba semula
        </Btn>
      </div>
    );
  }

  if (!loading && data?.no_data) {
    return (
      <div
        style={{
          background: "#f8f7f4",
          borderRadius: 10,
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
          No chatbot data available
        </div>
        <div style={{ fontSize: 12, color: "#888780", marginTop: 4 }}>
          Check back once users have started chatbot conversations.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* UC022 A1: Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard
          label="Total conversations"
          value={loading ? "…" : total}
          sub={`${stats.open} active sessions`}
          subColor="up"
        />
        <MetricCard
          label="Total messages"
          value={loading ? "…" : totalMsgs}
          sub={`${userMsgs} from users`}
          subColor="neu"
        />
        <MetricCard
          label="Admin replies"
          value={loading ? "…" : adminReps}
          sub={`${stats.closed} sessions closed`}
          subColor="neu"
        />
        <MetricCard
          label="Pending sessions"
          value={loading ? "…" : stats.pending}
          sub={stats.pending > 0 ? "Need attention" : "All processed"}
          subColor={stats.pending > 0 ? "down" : "up"}
        />
      </div>

      {/* Row: Common questions + Daily chart */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card>
          <SectionHeader title="Common user questions" />
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
          ) : questions.length === 0 ? (
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
              Tiada data
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
                  {["Message", "Frequency", "%"].map((h) => (
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
                {questions.map((q, i) => (
                  <React.Fragment key={i}>
                    <tr
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === q.topic ? null : q.topic,
                        )
                      }
                      style={{
                        borderBottom:
                          expandedCategory === q.topic
                            ? "none"
                            : i < questions.length - 1
                              ? "1px solid #f1efe8"
                              : "none",
                        cursor: "pointer",
                        background:
                          expandedCategory === q.topic
                            ? "#f0f4fc"
                            : "transparent",
                      }}
                    >
                      <td
                        style={{
                          padding: "7px 8px",
                          color:
                            expandedCategory === q.topic ? "#1a4fa0" : "#333",
                          fontWeight: expandedCategory === q.topic ? 700 : 400,
                        }}
                      >
                        <span style={{ marginRight: 5, fontSize: 9 }}>
                          {expandedCategory === q.topic ? "▼" : "▶"}
                        </span>
                        {q.topic}
                      </td>
                      <td
                        style={{
                          padding: "7px 8px",
                          color: "#555",
                          fontWeight: 600,
                        }}
                      >
                        {q.count}
                      </td>
                      <td
                        style={{
                          padding: "7px 8px",
                          fontWeight: 600,
                          color: i < 2 ? "#1a4fa0" : "#888780",
                        }}
                      >
                        {q.pct}
                      </td>
                    </tr>
                    {expandedCategory === q.topic &&
                      q.messages &&
                      q.messages.length > 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              padding: "4px 8px 12px 24px",
                              background: "#f0f4fc",
                              borderBottom:
                                i < questions.length - 1
                                  ? "1px solid #d8e4f5"
                                  : "none",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                color: "#888780",
                                marginBottom: 6,
                              }}
                            >
                              Contoh queries dalam kategori ini:
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                              }}
                            >
                              {q.messages.map((msg, j) => (
                                <div
                                  key={j}
                                  style={{
                                    background: "#fff",
                                    border: "1px solid #d3d1c7",
                                    borderRadius: 6,
                                    padding: "5px 10px",
                                    fontSize: 11,
                                    color: "#333",
                                  }}
                                >
                                  {msg}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <SectionHeader title="Chatbot sessions (30 days)" />
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
              <BarChart data={daily} barSize={22}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1efe8"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
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
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(v) => [`${v} sessions`]}
                />
                <Bar dataKey="sessions" radius={[3, 3, 0, 0]}>
                  {daily.map((_, i) => (
                    <Cell key={i} fill={DAY_COLORS[i] ?? "#b5d4f4"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* UC023: Recent chatbot conversations (AI interpreted) */}
      <Card style={{ marginBottom: 16 }}>
        <SectionHeader
          title="Recent chatbot conversations (AI interpreted)"
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {interpError && (
                <span style={{ fontSize: 11, color: "#a32d2d" }}>
                  {interpError}
                </span>
              )}
              <Btn
                primary
                small
                onClick={fetchInterpret}
                style={{ opacity: interpLoading ? 0.6 : 1 }}
              >
                {interpLoading ? "Loading..." : "Refresh"}
              </Btn>
            </div>
          }
        />
        {!interpRan ? (
          /* Auto-load on first render — trigger immediately */
          <div
            style={{
              padding: "16px 0",
              textAlign: "center",
              fontSize: 12,
              color: "#888780",
            }}
          >
            <Btn primary small onClick={fetchInterpret}>
              Load AI Interpretations
            </Btn>
          </div>
        ) : interpLoading ? (
          <div
            style={{
              padding: "16px 0",
              textAlign: "center",
              color: "#aaa",
              fontSize: 12,
            }}
          >
            Processing via Gemini API...
          </div>
        ) : interpreted.length === 0 ? (
          <div
            style={{
              padding: "16px 0",
              textAlign: "center",
              color: "#aaa",
              fontSize: 12,
            }}
          >
            No chatbot data available.
          </div>
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr>
                {[
                  "User Message",
                  "Bot Response",
                  "Source",
                  "Intent (AI)",
                  "Time",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "7px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#888780",
                      borderBottom: "1px solid #eceae4",
                      background: "#f8f7f4",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interpreted.map((r, i) => {
                // Derive source label from message keywords
                const msg = (r.query || "").toLowerCase();
                const srcKey =
                  msg.includes("sampah") ||
                  msg.includes("sarap") ||
                  msg.includes("waste")
                    ? "waste"
                    : msg.includes("complaint") || msg.includes("aduan")
                      ? "complaint"
                      : msg.includes("faq") ||
                          msg.includes("how") ||
                          msg.includes("apa")
                        ? "faq"
                        : r.source || "general";
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < interpreted.length - 1
                          ? "1px solid #f1efe8"
                          : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "9px 10px",
                        color: "#333",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.query}
                    </td>
                    <td
                      style={{
                        padding: "9px 10px",
                        color: "#888780",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.interpreted}
                    </td>
                    <td style={{ padding: "9px 10px" }}>
                      <SourceBadge source={srcKey} />
                    </td>
                    <td style={{ padding: "9px 10px", color: "#555" }}>
                      {r.intent || "—"}
                    </td>
                    <td
                      style={{
                        padding: "9px 10px",
                        color: "#aaa89e",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* UC024: Categorize user queries using AI */}
      <Card style={{ marginBottom: 16 }}>
        <SectionHeader
          title="Categorize user queries using AI"
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {catError && (
                <span style={{ fontSize: 11, color: "#a32d2d" }}>
                  ⚠ {catError}
                </span>
              )}
              <Btn
                primary
                small
                onClick={fetchCategorize}
                style={{ opacity: catLoading ? 0.6 : 1 }}
              >
                {catLoading ? "Running..." : "Run Categorization"}
              </Btn>
            </div>
          }
        />
        {!catRan ? (
          <div
            style={{
              padding: "16px 0",
              textAlign: "center",
              color: "#888780",
              fontSize: 12,
            }}
          >
            Click <strong>"Run Categorization"</strong> to classify user queries
            by topic and type using Gemini AI.
          </div>
        ) : catLoading ? (
          <div
            style={{
              padding: "16px 0",
              textAlign: "center",
              color: "#aaa",
              fontSize: 12,
            }}
          >
            Categorizing via Gemini API...
          </div>
        ) : catRows.length === 0 ? (
          <div
            style={{
              padding: "16px 0",
              textAlign: "center",
              color: "#aaa",
              fontSize: 12,
            }}
          >
            No query data available for categorization.
          </div>
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr>
                {[
                  "Category",
                  "Queries",
                  "Distribution",
                  "Query Type",
                  "Sample Message",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "7px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#888780",
                      borderBottom: "1px solid #eceae4",
                      background: "#f8f7f4",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catRows.map((r, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      i < catRows.length - 1 ? "1px solid #f1efe8" : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "10px 10px",
                      fontWeight: 700,
                      color: "#1a1a1a",
                    }}
                  >
                    {r.topic}
                  </td>
                  <td style={{ padding: "10px 10px", color: "#888780" }}>
                    {r.count} {r.count === 1 ? "query" : "queries"}
                  </td>
                  <td style={{ padding: "10px 10px", minWidth: 200 }}>
                    <ProgressBar value={r.count} max={totalCatCount} />
                  </td>
                  <td style={{ padding: "10px 10px" }}>
                    {r.type ? (
                      <TypeBadge type={r.type} />
                    ) : (
                      <span style={{ color: "#aaa89e" }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 10px",
                      color: "#555",
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.sample || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Generate FAQ from Conversations */}
      <Card>
        <SectionHeader
          title="Generate FAQ from chatbot conversations (AI)"
          right={
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {faqGenError && (
                <span style={{ fontSize: 11, color: "#a32d2d" }}>
                  {faqGenError}
                </span>
              )}
              {faqGenResult && (
                <Btn
                  primary
                  small
                  onClick={fetchGenerateFaq}
                  style={{ opacity: faqGenLoading ? 0.6 : 1 }}
                >
                  Regenerate
                </Btn>
              )}
              <Btn
                primary
                small
                onClick={fetchGenerateFaq}
                style={{
                  opacity: faqGenLoading ? 0.6 : 1,
                  display: faqGenResult ? "none" : undefined,
                }}
              >
                {faqGenLoading ? "Generating..." : "Generate FAQ Suggestions"}
              </Btn>
            </div>
          }
        />

        {/* Initial state */}
        {!faqGenResult && !faqGenLoading && !faqGenError && !faqSaveResult && (
          <div
            style={{
              padding: "16px 0",
              textAlign: "center",
              color: "#888780",
              fontSize: 12,
            }}
          >
            Click <strong>"Generate FAQ Suggestions"</strong> — Gemini will
            analyse chatbot conversations and suggest FAQ entries. You choose
            which ones to save.
          </div>
        )}

        {/* Loading */}
        {faqGenLoading && (
          <div
            style={{
              padding: "16px 0",
              textAlign: "center",
              color: "#aaa",
              fontSize: 12,
            }}
          >
            Gemini is analysing conversations...
          </div>
        )}

        {/* Save success */}
        {faqSaveResult && !faqGenResult && (
          <div
            style={{
              padding: "10px 12px",
              background: "#f0f7e6",
              borderRadius: 8,
              fontSize: 12,
              color: "#2563eb",
              fontWeight: 600,
            }}
          >
            {faqSaveResult}
          </div>
        )}

        {/* Suggestions with checkboxes */}
        {faqGenResult && (
          <div>
            <div
              style={{
                marginBottom: 12,
                padding: "8px 12px",
                background: "#f0f5ff",
                borderRadius: 8,
                fontSize: 12,
                color: "#2563eb",
              }}
            >
              {faqGenResult.message} — Tick the ones you want to save, then
              click <strong>"Save Selected"</strong>.
            </div>

            {/* Select all / deselect all */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 10,
                fontSize: 12,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  color: "#555",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    faqSelected.length ===
                    (faqGenResult.suggestions || []).length
                  }
                  onChange={() => {
                    const all = (faqGenResult.suggestions || []).map(
                      (_, i) => i,
                    );
                    setFaqSelected(
                      faqSelected.length === all.length ? [] : all,
                    );
                  }}
                />
                Select all
              </label>
              <span style={{ color: "#888780" }}>
                {faqSelected.length} of{" "}
                {(faqGenResult.suggestions || []).length} selected
              </span>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  {[
                    "",
                    "Category",
                    "Question (EN)",
                    "Question (BM)",
                    "Keywords",
                  ].map((h) => (
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
                {(faqGenResult.suggestions || []).map((f, i) => (
                  <tr
                    key={i}
                    onClick={() => toggleFaqSelect(i)}
                    style={{
                      borderBottom:
                        i < faqGenResult.suggestions.length - 1
                          ? "1px solid #f1efe8"
                          : "none",
                      background: faqSelected.includes(i)
                        ? "#f0f7e6"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <td style={{ padding: "8px", width: 32 }}>
                      <input
                        type="checkbox"
                        checked={faqSelected.includes(i)}
                        onChange={() => toggleFaqSelect(i)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: "#1a4fa0",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.category}
                      {f.already_exists && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 9,
                            background: "#f5c6c6",
                            color: "#a32d2d",
                            borderRadius: 4,
                            padding: "2px 5px",
                            fontWeight: 600,
                          }}
                        >
                          DUPLICATE
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: f.already_exists ? "#aaa" : "#333",
                      }}
                    >
                      {f.question_eng}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: f.already_exists ? "#aaa" : "#555",
                      }}
                    >
                      {f.question_malay}
                    </td>
                    <td
                      style={{ padding: "8px", color: "#888780", fontSize: 11 }}
                    >
                      {f.keywords}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Save button */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                alignItems: "center",
              }}
            >
              {faqSaveResult && (
                <span
                  style={{
                    fontSize: 11,
                    color: faqSaveResult.startsWith("Error")
                      ? "#a32d2d"
                      : "#2563eb",
                  }}
                >
                  {faqSaveResult}
                </span>
              )}
              <Btn
                primary
                small
                onClick={saveSelectedFaq}
                style={{
                  opacity: faqSaveLoading || faqSelected.length === 0 ? 0.5 : 1,
                  background: "#2563eb",
                  pointerEvents: faqSelected.length === 0 ? "none" : undefined,
                }}
              >
                {faqSaveLoading
                  ? "Saving..."
                  : `Save Selected (${faqSelected.length})`}
              </Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminChatbot;
