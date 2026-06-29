"use client";

import { useState, useEffect } from "react";
import { theme, font } from "../../theme";
import { Badge } from "../../components/ui/Badge";
import { Btn } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { IconClock, IconTrash } from "../../icons";

export const Scheduled = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { fetchScheduled(); }, []);

  const fetchScheduled = async () => {
    try {
      const response = await fetch("/api/schedule?status=pending", {
        headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_INTERNAL_API_KEY}` },
      });
      const result = await response.json();
      if (result.data) setMessages(result.data);
    } catch (error) {
      console.error("Failed to fetch scheduled messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setCancelling(true);
    try {
      await fetch(`/api/schedule/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${process.env.NEXT_PUBLIC_INTERNAL_API_KEY}` },
      });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setCancelConfirm(null);
    } catch (error) {
      console.error("Failed to cancel:", error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
      <p style={{ fontSize: 14, color: theme.textSecondary, fontFamily: font }}>Loading scheduled messages…</p>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text, margin: "0 0 4px", fontFamily: font, letterSpacing: "-0.01em" }}>Scheduled</h1>
        <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0, fontFamily: font }}>Pending messages queued for future delivery.</p>
      </div>

      {messages.length === 0 ? (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
          <IconClock size={32} color={theme.textMuted} />
          <p style={{ fontSize: 15, fontWeight: 500, color: theme.text, margin: "16px 0 6px", fontFamily: font }}>No scheduled messages</p>
          <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0, fontFamily: font }}>Messages scheduled by connected apps will appear here.</p>
        </div>
      ) : (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden" }}>
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: i < messages.length - 1 ? `1px solid ${theme.border}` : "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = theme.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: theme.text, margin: 0, fontFamily: font }}>{msg.templates?.name || "Unknown template"}</p>
                  <Badge type={msg.templates?.type || "sms"} />
                </div>
                <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0, fontFamily: font }}>
                  To: {msg.contacts?.name || msg.contacts?.email || msg.contacts?.phone || "Unknown contact"}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 12, color: theme.textMuted, margin: "0 0 2px", fontFamily: font }}>Scheduled for</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: 0, fontFamily: font }}>
                  {new Date(msg.send_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button
                onClick={() => setCancelConfirm(msg.id)}
                style={{ display: "flex", padding: 7, background: "none", border: `1px solid ${theme.border}`, borderRadius: 6, cursor: "pointer", color: theme.textSecondary, transition: "all 0.15s", flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.error.text; e.currentTarget.style.color = theme.error.text; e.currentTarget.style.background = theme.error.bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.background = "none"; }}
              >
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {cancelConfirm && (
        <Modal
          title="Cancel Scheduled Message"
          subtitle="This cannot be undone."
          onClose={() => setCancelConfirm(null)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setCancelConfirm(null)}>Keep It</Btn>
              <Btn variant="danger" onClick={() => handleCancel(cancelConfirm)} disabled={cancelling} icon={<IconTrash size={14} />}>
                {cancelling ? "Cancelling…" : "Cancel Message"}
              </Btn>
            </>
          }
        >
          <p style={{ fontSize: 14, color: theme.textSecondary, fontFamily: font, margin: 0, lineHeight: 1.6 }}>
            Are you sure you want to cancel this scheduled message? It will not be sent.
          </p>
        </Modal>
      )}
    </div>
  );
};