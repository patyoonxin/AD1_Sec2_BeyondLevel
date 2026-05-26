import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Card,
  SectionHeader,
  MetricCard,
  Btn,
} from "../../components/Admin/AdminUI";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000/api";

const REPORT_CARDS = [
  {
    id: "monthly",
    icon: "📄",
    title: "Monthly Summary",
    desc: "Complaint statistics & resolution trends",
    bg: "#e8f0fb",
  },
  {
    id: "chatbot",
    icon: "📈",
    title: "Chatbot Analytics",
    desc: "AI query insights & chatbot usage",
    bg: "#eaf3de",
  },
  {
    id: "full",
    icon: "📊",
    title: "Full Report",
    desc: "Compile both reports into one download",
    bg: "#eeedfe",
  },
];

const STATUS_COLORS = {
  Pending: "#ba7517",
  "In Progress": "#1a4fa0",
  Resolved: "#639922",
  Rejected: "#e24b4a",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nowLabel() {
  return new Date().toLocaleString("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Build CSV content from array of objects
function buildCSV(rows, columns) {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  return [header, ...body].join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDFViaprint(reportTitle, tableHtml) {
  const win = window.open("", "_blank");
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>${reportTitle}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 24px; }
      h2 { color: #1a4fa0; border-bottom: 2px solid #1a4fa0; padding-bottom: 8px; }
      p.meta { font-size: 11px; color: #888; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #1a4fa0; color: #fff; padding: 8px 10px; text-align: left; }
      td { padding: 7px 10px; border-bottom: 1px solid #eceae4; }
      tr:nth-child(even) td { background: #f8f7f4; }
    </style>
    </head><body>
    <h2>${reportTitle}</h2>
    <p class="meta">Dijana pada: ${nowLabel()} · Portal Pejabat Daerah Kulai</p>
    ${tableHtml}
    </body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 28,
          minWidth: 480,
          maxWidth: 620,
          width: "90%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── ReportPreviewModal ───────────────────────────────────────────────────────
function ReportPreviewModal({
  open,
  report,
  complaints,
  chatbotData,
  onClose,
  onExport,
}) {
  if (!open || !report) return null;

  const isChatbot = report.id === "chatbot" || report.id === "full";

  // ── Chatbot report content ────────────────────────────────────────────────
  if (isChatbot) {
    const total = chatbotData?.total_conversations ?? 0;
    const msgs = chatbotData?.total_messages ?? 0;
    const open_ = chatbotData?.stats?.open ?? 0;
    const closed = chatbotData?.stats?.closed ?? 0;
    const questions = chatbotData?.common_questions ?? [];
    const recent = chatbotData?.recent_conversations ?? [];
    const isFull = report.id === "full";
    const compTotal = complaints.length;
    const compResolved = complaints.filter(
      (c) => c.status === "Resolved",
    ).length;

    return (
      <Modal open onClose={onClose}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
              {report.title}
            </div>
            <div style={{ fontSize: 11, color: "#888780", marginTop: 3 }}>
              {report.desc}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "#888",
            }}
          >
            ✕
          </button>
        </div>

        {/* Full Report: show complaints summary too */}
        {isFull && (
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#555",
                marginBottom: 8,
              }}
            >
              Monthly Summary — Aduan
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
                marginBottom: 10,
              }}
            >
              {[
                { label: "Jumlah Aduan", value: compTotal, color: "#1a4fa0" },
                { label: "Resolved", value: compResolved, color: "#639922" },
                {
                  label: "In Progress",
                  value: complaints.filter((c) => c.status === "In Progress")
                    .length,
                  color: "#ba7517",
                },
                {
                  label: "Pending",
                  value: complaints.filter((c) => c.status === "Pending")
                    .length,
                  color: "#888780",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#f8f7f4",
                    borderRadius: 7,
                    padding: "8px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ fontSize: 18, fontWeight: 700, color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 10, color: "#888780" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#555",
                marginBottom: 6,
              }}
            >
              Chatbot Analytics
            </div>
          </div>
        )}

        {/* Chatbot stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 18,
          }}
        >
          {[
            { label: "Jumlah Perbualan", value: total, color: "#1a4fa0" },
            { label: "Jumlah Mesej", value: msgs, color: "#534ab7" },
            { label: "Sesi Aktif", value: open_, color: "#639922" },
            { label: "Sesi Ditutup", value: closed, color: "#888780" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#f8f7f4",
                borderRadius: 8,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: "#888780" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Soalan lazim + contoh queries */}
        {questions.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#555",
                marginBottom: 10,
              }}
            >
              Soalan lazim pengguna
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {/* Table */}
              <div
                style={{
                  border: "1px solid #eceae4",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 11,
                  }}
                >
                  <thead>
                    <tr>
                      {["Kategori", "Bil.", "%"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "6px 10px",
                            background: "#1a4fa0",
                            color: "#fff",
                            fontSize: 10,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q, i) => (
                      <tr
                        key={i}
                        style={{
                          background: i % 2 === 0 ? "#fff" : "#f8f7f4",
                          borderBottom: "1px solid #f1efe8",
                        }}
                      >
                        <td
                          style={{
                            padding: "6px 10px",
                            color: "#333",
                            fontWeight: 500,
                          }}
                        >
                          {q.topic}
                        </td>
                        <td
                          style={{
                            padding: "6px 10px",
                            color: "#555",
                            fontWeight: 600,
                          }}
                        >
                          {q.count}
                        </td>
                        <td
                          style={{
                            padding: "6px 10px",
                            color: "#1a4fa0",
                            fontWeight: 600,
                          }}
                        >
                          {q.pct}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Contoh queries per category */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 180,
                  overflowY: "auto",
                }}
              >
                {questions
                  .filter((q) => q.messages && q.messages.length > 0)
                  .map((q, i) => {
                    const colors = [
                      { bg: "#e8f0fb", color: "#1a4fa0" },
                      { bg: "#fcebeb", color: "#a32d2d" },
                      { bg: "#eaf3de", color: "#3b6d11" },
                      { bg: "#faeeda", color: "#854f0b" },
                      { bg: "#eeedfe", color: "#534ab7" },
                      { bg: "#f1efe8", color: "#555450" },
                    ];
                    const c = colors[i % colors.length];
                    return (
                      <div
                        key={i}
                        style={{
                          border: "1px solid #eceae4",
                          borderRadius: 7,
                          padding: "8px 10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 5,
                          }}
                        >
                          <span
                            style={{
                              background: c.bg,
                              color: c.color,
                              padding: "2px 7px",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {q.topic}
                          </span>
                          <span style={{ fontSize: 10, color: "#aaa89e" }}>
                            {q.count} {q.count === 1 ? "query" : "queries"}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#555",
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {q.messages.slice(0, 3).join(", ")}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn onClick={onClose}>Batal</Btn>
          <Btn
            onClick={() => {
              const cols = [
                { key: "topic", label: "Kategori" },
                { key: "count", label: "Kekerapan" },
                { key: "pct", label: "%" },
              ];
              const header = cols.map((c) => '"' + c.label + '"').join(",");
              const body = questions
                .map((q) =>
                  cols.map((c) => '"' + (q[c.key] ?? "") + '"').join(","),
                )
                .join("\n");
              const csv = header + "\n" + body;
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "Chatbot_Analytics.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            &#8595; Export Excel (CSV)
          </Btn>
          <Btn
            primary
            onClick={() => {
              const win = window.open("", "_blank");
              const tableRows = questions
                .map(
                  (q) =>
                    "<tr><td>" +
                    q.topic +
                    "</td><td>" +
                    q.count +
                    "</td><td>" +
                    q.pct +
                    "</td><td>" +
                    (q.messages || []).slice(0, 3).join(", ") +
                    "</td></tr>",
                )
                .join("");
              const compRows = isFull
                ? complaints
                    .map(
                      (c) =>
                        "<tr><td>" +
                        (c.record_id || "") +
                        "</td><td>" +
                        (c.title || "") +
                        "</td><td>" +
                        (c.category || "") +
                        "</td><td>" +
                        (c.status || "") +
                        "</td></tr>",
                    )
                    .join("")
                : "";
              const compSection = isFull
                ? "<h3>Monthly Summary — Aduan</h3>" +
                  "<table><thead><tr><th>No. Rekod</th><th>Tajuk</th><th>Kategori</th><th>Status</th></tr></thead>" +
                  "<tbody>" +
                  compRows +
                  "</tbody></table><br/>"
                : "";
              const html =
                "<!DOCTYPE html><html><head><title>" +
                (isFull ? "Full Report" : "Chatbot Analytics Report") +
                "</title>" +
                "<style>body{font-family:Arial,sans-serif;font-size:13px;padding:24px;}" +
                "h2{color:#1a4fa0;border-bottom:2px solid #1a4fa0;padding-bottom:8px;}" +
                "h3{color:#1a4fa0;margin-top:20px;}" +
                ".stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}" +
                ".stat{background:#f8f7f4;border-radius:8px;padding:12px;text-align:center;}" +
                ".stat-val{font-size:22px;font-weight:700;color:#1a4fa0;}" +
                ".stat-lbl{font-size:11px;color:#888;}" +
                "table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;}" +
                "th{background:#1a4fa0;color:#fff;padding:8px 10px;text-align:left;}" +
                "td{padding:7px 10px;border-bottom:1px solid #eceae4;}" +
                "p.meta{font-size:11px;color:#888;margin-bottom:16px;}</style>" +
                "</head><body>" +
                "<h2>" +
                (isFull ? "Full Report" : "Chatbot Analytics Report") +
                "</h2>" +
                '<p class="meta">Dijana pada: ' +
                new Date().toLocaleString("ms-MY") +
                " &middot; Portal Pejabat Daerah Kulai</p>" +
                compSection +
                "<h3>Chatbot Analytics</h3>" +
                '<div class="stats">' +
                '<div class="stat"><div class="stat-val">' +
                total +
                '</div><div class="stat-lbl">Jumlah Perbualan</div></div>' +
                '<div class="stat"><div class="stat-val">' +
                msgs +
                '</div><div class="stat-lbl">Jumlah Mesej</div></div>' +
                '<div class="stat"><div class="stat-val">' +
                open_ +
                '</div><div class="stat-lbl">Sesi Aktif</div></div>' +
                '<div class="stat"><div class="stat-val">' +
                closed +
                '</div><div class="stat-lbl">Sesi Ditutup</div></div>' +
                "</div>" +
                "<h3>Soalan lazim pengguna</h3>" +
                "<table><thead><tr><th>Kategori</th><th>Kekerapan</th><th>%</th><th>Contoh queries</th></tr></thead>" +
                "<tbody>" +
                tableRows +
                "</tbody></table>" +
                "</body></html>";
              win.document.write(html);
              win.document.close();
              setTimeout(() => win.print(), 400);
            }}
          >
            Export PDF
          </Btn>
        </div>
      </Modal>
    );
  }

  // ── Complaint / Monthly / Full report content ─────────────────────────────
  const total = complaints.length;
  const byStatus = {};
  complaints.forEach((c) => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  });

  const cols = [
    { key: "record_id", label: "No. Rekod" },
    { key: "title", label: "Tajuk" },
    { key: "category", label: "Kategori" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Tarikh" },
  ];

  const rows = complaints.slice(0, 30).map((c) => ({
    ...c,
    created_at: formatDate(c.created_at),
  }));

  return (
    <Modal open onClose={onClose}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 18,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
            {report.title}
          </div>
          <div style={{ fontSize: 11, color: "#888780", marginTop: 3 }}>
            {report.desc}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "none",
            fontSize: 18,
            cursor: "pointer",
            color: "#888",
          }}
        >
          ✕
        </button>
      </div>

      {/* Summary stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            background: "#f8f7f4",
            borderRadius: 8,
            padding: "10px 12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a4fa0" }}>
            {total}
          </div>
          <div style={{ fontSize: 10, color: "#888780" }}>Jumlah</div>
        </div>
        {["Pending", "In Progress", "Resolved"].map((s) => (
          <div
            key={s}
            style={{
              background: "#f8f7f4",
              borderRadius: 8,
              padding: "10px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: 20, fontWeight: 700, color: STATUS_COLORS[s] }}
            >
              {byStatus[s] || 0}
            </div>
            <div style={{ fontSize: 10, color: "#888780" }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Table preview */}
      <div
        style={{
          maxHeight: 250,
          overflowY: "auto",
          border: "1px solid #eceae4",
          borderRadius: 8,
          marginBottom: 18,
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}
        >
          <thead style={{ position: "sticky", top: 0 }}>
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key}
                  style={{
                    textAlign: "left",
                    padding: "7px 10px",
                    background: "#1a4fa0",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 10,
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: 16, textAlign: "center", color: "#888" }}
                >
                  Tiada data
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  style={{ background: i % 2 === 0 ? "#fff" : "#f8f7f4" }}
                >
                  {cols.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        padding: "6px 10px",
                        color: "#333",
                        borderBottom: "1px solid #f1efe8",
                      }}
                    >
                      {c.key === "status" ? (
                        <span
                          style={{
                            color: STATUS_COLORS[row[c.key]] || "#555",
                            fontWeight: 600,
                          }}
                        >
                          {row[c.key]}
                        </span>
                      ) : (
                        row[c.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Export buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn onClick={onClose}>Batal</Btn>
        <Btn onClick={() => onExport("csv", report, complaints, cols)}>
          ⬇ Export Excel (CSV)
        </Btn>
        <Btn primary onClick={() => onExport("pdf", report, complaints, cols)}>
          🖨 Export PDF
        </Btn>
      </div>
    </Modal>
  );
}

// ─── GenerateModal ────────────────────────────────────────────────────────────
function GenerateModal({ open, onClose, complaints, onGenerated }) {
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    setError("");
    try {
      // Simulate brief compile step
      await new Promise((r) => setTimeout(r, 800));
      onGenerated(selected);
    } catch {
      setError("Penjanaan laporan gagal. Sila cuba lagi.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>
          Jana Laporan Baharu
        </div>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "none",
            fontSize: 18,
            cursor: "pointer",
            color: "#888",
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>
        Pilih jenis laporan yang ingin dijana:
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {REPORT_CARDS.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelected(r)}
            style={{
              border:
                selected?.id === r.id
                  ? "2px solid #1a4fa0"
                  : "1px solid #eceae4",
              borderRadius: 9,
              padding: 12,
              background: selected?.id === r.id ? "#e8f0fb" : "#f8f7f4",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 7,
                background: r.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {r.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>
                {r.title}
              </div>
              <div style={{ fontSize: 10, color: "#888780" }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div
          style={{
            fontSize: 12,
            color: "#a32d2d",
            background: "#fcebeb",
            borderRadius: 7,
            padding: "8px 12px",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn onClick={onClose}>Batal</Btn>
        <Btn
          primary
          onClick={handleGenerate}
          style={{ opacity: !selected || generating ? 0.6 : 1 }}
        >
          {generating ? "⏳ Menjana..." : "✦ Jana Laporan"}
        </Btn>
      </div>
    </Modal>
  );
}

// ─── ExportModal ──────────────────────────────────────────────────────────────
function ExportFormatModal({ open, report, complaints, onClose, onConfirm }) {
  const [format, setFormat] = useState("csv");
  return (
    <Modal open={open} onClose={onClose}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700 }}>Export Laporan</div>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "none",
            fontSize: 18,
            cursor: "pointer",
            color: "#888",
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>
        Pilih format untuk export <strong>{report?.title}</strong>:
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          {
            val: "csv",
            label: "📊 Excel (CSV)",
            desc: "Sesuai untuk analisis data",
          },
          { val: "pdf", label: "🖨 PDF", desc: "Sesuai untuk cetakan" },
        ].map((f) => (
          <div
            key={f.val}
            onClick={() => setFormat(f.val)}
            style={{
              flex: 1,
              border:
                format === f.val ? "2px solid #1a4fa0" : "1px solid #eceae4",
              borderRadius: 9,
              padding: 14,
              cursor: "pointer",
              background: format === f.val ? "#e8f0fb" : "#f8f7f4",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>
              {f.label.split(" ")[0]}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>
              {f.label.split(" ").slice(1).join(" ")}
            </div>
            <div style={{ fontSize: 10, color: "#888780", marginTop: 3 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn onClick={onClose}>Batal</Btn>
        <Btn primary onClick={() => onConfirm(format)}>
          ⬇ Export
        </Btn>
      </div>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AdminAnalytics() {
  const [complaints, setComplaints] = useState([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // UC025 - Trend filters
  const [monthRange, setMonthRange] = useState(6);
  const [filterCategory, setFilterCategory] = useState("");

  // UC027 - Generate Report
  const [generateOpen, setGenerateOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [reportPreviewOpen, setReportPreviewOpen] = useState(false);
  const [chatbotData, setChatbotData] = useState(null);

  // UC028 - Export
  const [exportOpen, setExportOpen] = useState(false);
  const [exportReport, setExportReport] = useState(null);
  const [lastExport, setLastExport] = useState(null);
  const [exportError, setExportError] = useState("");

  // ── Fetch complaints from API ──────────────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      // UC027: use dedicated analytics endpoint
      const res = await fetch(
        `${API_BASE}/admin/analytics/generate?type=monthly`,
        { headers: { Accept: "application/json" } },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal memuat data");
      // analytics endpoint returns { rows: [...], summary: {...} }
      setComplaints(data.rows || []);
      if (data.monthly_breakdown) setMonthlyBreakdown(data.monthly_breakdown);
    } catch {
      // Fallback: complaints paginator
      try {
        const res2 = await fetch(
          `${API_BASE}/admin/complaints?page=1&per_page=100`,
          { headers: { Accept: "application/json" } },
        );
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2?.message || "Gagal memuat data");
        const rows = Array.isArray(data2) ? data2 : data2.data || [];
        setComplaints(rows);
      } catch {
        setFetchError("Tidak dapat memuatkan data. Semak sambungan ke server.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalComplaints = complaints.length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const inProgress = complaints.filter(
    (c) => c.status === "In Progress",
  ).length;
  const pending = complaints.filter((c) => c.status === "Pending").length;

  const byStatus = ["Pending", "In Progress", "Resolved", "Rejected"]
    .map((s) => ({
      name: s,
      value: complaints.filter((c) => c.status === s).length,
    }))
    .filter((d) => d.value > 0);

  const byCategory = Object.entries(
    complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {}),
  ).map(([cat, count]) => ({ cat, count }));

  const resolutionRate =
    totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;

  // UC025: filtered complaints by category
  const filteredComplaints = filterCategory
    ? complaints.filter((c) => c.category === filterCategory)
    : complaints;

  // UC025 A2: Trend by month — use API monthly_breakdown if available
  const now = new Date();
  const trendByMonth = (() => {
    if (monthlyBreakdown.length > 0 && !filterCategory) {
      // Use API data — take last monthRange months
      const data = monthlyBreakdown.slice(-monthRange);
      return data.map((d) => ({
        month: d.month ? d.month.split(" ")[0] : "",
        received: d.count || 0,
        resolved: 0, // not available from monthly_breakdown, use 0
      }));
    }
    // Fallback: calculate from rows
    return Array.from({ length: monthRange }, (_, i) => {
      const d = new Date(
        now.getFullYear(),
        now.getMonth() - (monthRange - 1 - i),
        1,
      );
      const label = d.toLocaleString("en-MY", { month: "short" });
      const monthName = d.toLocaleString("en-MY", {
        month: "long",
        year: "numeric",
      });
      const monthRows = filteredComplaints.filter((c) => {
        const ca = c.created_at || "";
        return (
          ca.includes(d.toLocaleString("en-MY", { month: "short" })) &&
          ca.includes(String(d.getFullYear()))
        );
      });
      return {
        month: label,
        received: monthRows.length,
        resolved: monthRows.filter((c) => c.status === "Resolved").length,
      };
    });
  })();

  // UC025 A3: Resolution rate by category
  const resolutionByCategory = Object.entries(
    filteredComplaints.reduce((acc, c) => {
      if (!acc[c.category]) acc[c.category] = { total: 0, resolved: 0 };
      acc[c.category].total++;
      if (c.status === "Resolved") acc[c.category].resolved++;
      return acc;
    }, {}),
  )
    .map(([cat, { total, resolved: res }]) => ({
      cat,
      total,
      rate: total > 0 ? Math.round((res / total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate);

  // ── UC027: handle card click to preview then generate ────────────────────
  const handleCardClick = async (card) => {
    setActiveReport(card);
    if (card.id === "chatbot" || card.id === "full") {
      try {
        const res = await fetch(`${API_BASE}/admin/chatbot/analyze`, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        setChatbotData(data);
      } catch (err) {
        console.error("Chatbot fetch error:", err);
      }
    }
    setReportPreviewOpen(true);
  };

  const handleGenerated = (card) => {
    setActiveReport(card);
    setGenerateOpen(false);
    setReportPreviewOpen(true);
  };

  // ── UC028: Export logic ──────────────────────────────────────────────────
  const doExport = (format, report, data, cols) => {
    setExportError("");
    try {
      const filename =
        report.title.replace(/\s+/g, "_") +
        "_" +
        new Date().toISOString().slice(0, 10);

      // Full Report — gabung complaints + chatbot data
      if (report.id === "full") {
        const cb = chatbotData || {};
        const questions = cb.common_questions || [];

        if (format === "csv") {
          // Section 1: complaints
          const compCols = [
            { key: "record_id", label: "No. Rekod" },
            { key: "title", label: "Tajuk" },
            { key: "category", label: "Kategori" },
            { key: "status", label: "Status" },
            { key: "created_at", label: "Tarikh" },
          ];
          const compCsv = buildCSV(
            data.map((c) => ({ ...c, created_at: formatDate(c.created_at) })),
            compCols,
          );

          // Section 2: chatbot
          const chatCols = [
            { key: "topic", label: "Kategori" },
            { key: "count", label: "Kekerapan" },
            { key: "pct", label: "%" },
          ];
          const chatHeader = chatCols.map((c) => '"' + c.label + '"').join(",");
          const chatBody = questions
            .map((q) =>
              chatCols.map((c) => '"' + (q[c.key] ?? "") + '"').join(","),
            )
            .join("\n");
          const fullCsv =
            "=== Monthly Summary ===\n" +
            compCsv +
            "\n\n=== Chatbot Analytics ===\n" +
            chatHeader +
            "\n" +
            chatBody;
          downloadCSV(fullCsv, filename + ".csv");
        } else {
          // PDF: gabung kedua-dua sections
          const compRows = data
            .map(
              (c) =>
                "<tr><td>" +
                (c.record_id || "") +
                "</td><td>" +
                (c.title || "") +
                "</td><td>" +
                (c.category || "") +
                "</td><td>" +
                (c.status || "") +
                "</td><td>" +
                formatDate(c.created_at) +
                "</td></tr>",
            )
            .join("");
          const chatRows = questions
            .map(
              (q) =>
                "<tr><td>" +
                q.topic +
                "</td><td>" +
                q.count +
                "</td><td>" +
                q.pct +
                "</td><td>" +
                (q.messages || []).slice(0, 3).join(", ") +
                "</td></tr>",
            )
            .join("");

          const tableHtml =
            "<h3>Monthly Summary — Aduan</h3>" +
            "<table><thead><tr><th>No. Rekod</th><th>Tajuk</th><th>Kategori</th><th>Status</th><th>Tarikh</th></tr></thead>" +
            "<tbody>" +
            compRows +
            "</tbody></table>" +
            "<br/><h3>Chatbot Analytics</h3>" +
            "<table><thead><tr><th>Kategori</th><th>Kekerapan</th><th>%</th><th>Contoh Queries</th></tr></thead>" +
            "<tbody>" +
            chatRows +
            "</tbody></table>";
          downloadPDFViaprint("Full Report", tableHtml);
        }
        setLastExport({ report, format, time: nowLabel() });
        setReportPreviewOpen(false);
        setExportOpen(false);
        return;
      }

      // Monthly Summary / default — complaints only
      if (format === "csv") {
        const csv = buildCSV(
          data.map((c) => ({ ...c, created_at: formatDate(c.created_at) })),
          cols,
        );
        downloadCSV(csv, filename + ".csv");
      } else {
        const tableHtml =
          "<table><thead><tr>" +
          cols.map((c) => "<th>" + c.label + "</th>").join("") +
          "</tr></thead>" +
          "<tbody>" +
          data
            .map(
              (c) =>
                "<tr>" +
                cols
                  .map(
                    (col) =>
                      "<td>" +
                      (col.key === "created_at"
                        ? formatDate(c[col.key])
                        : (c[col.key] ?? "—")) +
                      "</td>",
                  )
                  .join("") +
                "</tr>",
            )
            .join("") +
          "</tbody></table>";
        downloadPDFViaprint(report.title, tableHtml);
      }
      setLastExport({ report, format, time: nowLabel() });
      setReportPreviewOpen(false);
      setExportOpen(false);
    } catch {
      setExportError("Export gagal. Sila cuba lagi.");
    }
  };

  const handleExportFromPreview = (format, report, data, cols) => {
    doExport(format, report, data, cols);
  };

  const handleExportFormatConfirm = (format) => {
    if (!exportReport) return;
    const cols = [
      { key: "record_id", label: "No. Rekod" },
      { key: "title", label: "Tajuk" },
      { key: "category", label: "Kategori" },
      { key: "status", label: "Status" },
      { key: "created_at", label: "Tarikh" },
    ];
    doExport(format, exportReport, complaints, cols);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Error banner */}
      {fetchError && (
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
          <span>⚠ {fetchError}</span>
          <Btn small onClick={fetchComplaints}>
            Cuba semula
          </Btn>
        </div>
      )}

      {/* UC025: Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <MetricCard
          label="Total complaints"
          value={loading ? "…" : totalComplaints}
          sub="Overall system"
        />
        <MetricCard
          label="Resolution rate"
          value={loading ? "…" : `${resolutionRate}%`}
          sub={`${resolved} diselesaikan`}
          subColor="up"
        />
        <MetricCard
          label="In progress"
          value={loading ? "…" : inProgress}
          sub={`${pending} belum diproses`}
          subColor={pending > 0 ? "down" : "neu"}
        />
        <MetricCard
          label="Reports exported"
          value={lastExport ? "1+" : "0"}
          sub={lastExport ? lastExport.time : "Belum ada eksport"}
        />
      </div>

      {/* UC025 A1: Filter bar — by time period & category */}
      <Card style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>
            Filter trend:
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {["3", "6", "12"].map((m) => (
              <button
                key={m}
                onClick={() => setMonthRange(Number(m))}
                style={{
                  padding: "4px 12px",
                  fontSize: 11,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 500,
                  border:
                    monthRange === Number(m) ? "none" : "1px solid #d3d1c7",
                  background: monthRange === Number(m) ? "#1a4fa0" : "#f1efe8",
                  color: monthRange === Number(m) ? "#fff" : "#1a1a1a",
                }}
              >
                {m} months
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
            <span
              style={{ fontSize: 11, color: "#888780", alignSelf: "center" }}
            >
              Category:
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                fontSize: 11,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #d3d1c7",
                background: "#f8f7f4",
                color: "#1a1a1a",
                cursor: "pointer",
              }}
            >
              <option value="">All</option>
              {[
                ...new Set(complaints.map((c) => c.category).filter(Boolean)),
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {filterCategory && (
            <button
              onClick={() => setFilterCategory("")}
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid #d3d1c7",
                background: "#f1efe8",
                color: "#888780",
                cursor: "pointer",
              }}
            >
              ✕ Reset
            </button>
          )}
        </div>
      </Card>

      {/* UC025 A2 + A3: Charts row — category patterns + resolution trends */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* UC025 A1 + A2: Complaint trend over time (line chart) */}
        <Card>
          <SectionHeader
            title={`Complaint trend (last ${monthRange} months)`}
            right={
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 11,
                  color: "#888780",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "#1a4fa0",
                      display: "inline-block",
                    }}
                  />
                  Received
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: "#639922",
                      display: "inline-block",
                    }}
                  />
                  Resolved
                </span>
              </div>
            }
          />
          {loading ? (
            <div
              style={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 12,
              }}
            >
              Memuatkan...
            </div>
          ) : trendByMonth.every((d) => d.received === 0) ? (
            <div
              style={{
                height: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 12,
                gap: 6,
              }}
            >
              <span style={{ fontSize: 24 }}>📭</span>
              No complaint data available to analyze.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1efe8" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#aaa89e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#aaa89e" }}
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
                  name="Received"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#639922"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* UC025 A1: Frequent complaint categories (bar chart) */}
        <Card>
          <SectionHeader title="Most frequent complaint categories" />
          {loading ? (
            <div
              style={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 12,
              }}
            >
              Memuatkan...
            </div>
          ) : byCategory.length === 0 ? (
            <div
              style={{
                height: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 12,
                gap: 6,
              }}
            >
              <span style={{ fontSize: 24 }}>📭</span>
              No complaint data available to analyze.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCategory} barSize={20}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1efe8"
                  vertical={false}
                />
                <XAxis
                  dataKey="cat"
                  tick={{ fontSize: 10, fill: "#aaa89e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#aaa89e" }}
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
                  formatter={(v) => [`${v} aduan`]}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#1a4fa0" : "#b5d4f4"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* UC025 A3: Resolution trend by status */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card>
          <SectionHeader title="Complaint status distribution" />
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
              Memuatkan...
            </div>
          ) : byStatus.length === 0 ? (
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
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  fontSize={10}
                >
                  {byStatus.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[entry.name] || "#b5d4f4"}
                    />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* UC025 A3: Resolution rate by category */}
        <Card>
          <SectionHeader title="Resolution rate by category" />
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
              Memuatkan...
            </div>
          ) : resolutionByCategory.length === 0 ? (
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
            <div style={{ padding: "4px 0" }}>
              {resolutionByCategory.map((r, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: "#333", fontWeight: 500 }}>
                      {r.cat}
                    </span>
                    <span
                      style={{
                        color:
                          r.rate >= 80
                            ? "#639922"
                            : r.rate >= 50
                              ? "#ba7517"
                              : "#e24b4a",
                        fontWeight: 600,
                      }}
                    >
                      {r.rate}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "#f1efe8",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${r.rate}%`,
                        borderRadius: 3,
                        background:
                          r.rate >= 80
                            ? "#639922"
                            : r.rate >= 50
                              ? "#ba7517"
                              : "#e24b4a",
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Generate & Export reports section */}
      <Card>
        <SectionHeader
          title="Generate & export reports"
          right={
            <div style={{ display: "flex", gap: 8 }}>
              {exportError && (
                <span style={{ fontSize: 11, color: "#a32d2d" }}>
                  ⚠ {exportError}
                </span>
              )}
            </div>
          }
        />

        {/* Report cards — click to generate & preview (UC027) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
            gap: 12,
          }}
        >
          {REPORT_CARDS.map((r) => (
            <div
              key={r.id}
              onClick={() => handleCardClick(r)}
              style={{
                background: "#f8f7f4",
                border: "1px solid #eceae4",
                borderRadius: 8,
                padding: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#1a4fa0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#eceae4")
              }
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: r.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {r.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}
                >
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: "#aaa89e", marginTop: 2 }}>
                  {r.desc}
                </div>
              </div>
              <span style={{ fontSize: 10, color: "#1a4fa0" }}>▶</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── UC027: Generate Report Modal ── */}
      <GenerateModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        complaints={complaints}
        onGenerated={handleGenerated}
      />

      {/* ── UC027 + UC028: Report Preview (after generate) ── */}
      <ReportPreviewModal
        open={reportPreviewOpen}
        report={activeReport}
        complaints={complaints}
        chatbotData={chatbotData}
        onClose={() => setReportPreviewOpen(false)}
        onExport={handleExportFromPreview}
      />

      {/* ── UC028: Export Format Picker ── */}
      <ExportFormatModal
        open={exportOpen}
        report={exportReport}
        complaints={complaints}
        onClose={() => setExportOpen(false)}
        onConfirm={handleExportFormatConfirm}
      />
    </div>
  );
}

export default AdminAnalytics;
