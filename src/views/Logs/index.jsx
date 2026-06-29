"use client";

import { useState, useEffect } from "react";
import { theme, font } from "../../theme";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import { IconList } from "../../icons";

export const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/logs");
      const result = await response.json();
      if (result.data) setLogs(result.data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "all" ? logs : logs.filter((l) => l.type === filter || l.status === filter);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
      <p style={{ fontSize: 14, color: theme.textSecondary, fontFamily: font }}>Loading logs…</p>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text, margin: "0 0 4px", fontFamily: font, letterSpacing: "-0.01em" }}>Message Logs</h1>
        <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0, fontFamily: font }}>Full history of every message sent through Notifyio.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { v: "all", l: "All" },
          { v: "sms", l: "SMS" },
          { v: "email", l: "Email" },
          { v: "delivered", l: "Delivered" },
          { v: "failed", l: "Failed" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            style={{
              padding: "6px 14px", fontSize: 13, fontFamily: font, fontWeight: 500, borderRadius: 6, cursor: "pointer",
              border: `1px solid ${filter === f.v ? "#111111" : theme.border}`,
              background: filter === f.v ? "#111111" : "transparent",
              color: filter === f.v ? "#FFFFFF" : theme.textSecondary,
              transition: "all 0.15s",
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
          <IconList size={32} color={theme.textMuted} />
          <p style={{ fontSize: 15, fontWeight: 500, color: theme.text, margin: "16px 0 6px", fontFamily: font }}>No logs yet</p>
          <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0, fontFamily: font }}>Logs will appear here after messages are sent.</p>
        </div>
      ) : (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                {["Template", "Channel", "Recipient", "Status", "Sent"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, padding: "12px 16px", fontFamily: font }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${theme.border}` : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = theme.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 500, color: theme.text, fontFamily: font }}>{log.templates?.name || "—"}</td>
                  <td style={{ padding: "14px 16px" }}><Badge type={log.type} /></td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: theme.textSecondary, fontFamily: font }}>{log.recipient}</td>
                  <td style={{ padding: "14px 16px" }}><StatusBadge status={log.status} /></td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: theme.textMuted, fontFamily: font }}>
                    {new Date(log.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};