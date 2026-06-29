"use client";

import { useState, useEffect } from "react";
import { theme, font } from "../../theme";
import { Btn } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { IconGrid, IconPlus, IconTrash, IconCopy, IconRefresh, IconCheck } from "../../icons";

export const Apps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [saving, setSaving] = useState(false);
  const [newApiKey, setNewApiKey] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    try {
      const response = await fetch("/api/apps");
      const result = await response.json();
      if (result.data) setApps(result.data);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAppName.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAppName }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setNewApiKey(result.data.api_key);
      setApps((prev) => [result.data, ...prev]);
      setNewAppName("");
    } catch (error) {
      console.error("Failed to create app:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/apps/${id}`, { method: "DELETE" });
      setApps((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete app:", error);
    }
  };

  const handleRegenerate = async (id) => {
    try {
      const response = await fetch(`/api/apps/${id}`, { method: "PATCH" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setNewApiKey(result.data.api_key);
    } catch (error) {
      console.error("Failed to regenerate key:", error);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
      <p style={{ fontSize: 14, color: theme.textSecondary, fontFamily: font }}>Loading apps…</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text, margin: "0 0 4px", fontFamily: font, letterSpacing: "-0.01em" }}>Connected Apps</h1>
          <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0, fontFamily: font }}>Register apps and manage their API keys.</p>
        </div>
        <Btn onClick={() => { setNewApiKey(null); setShowModal(true); }} icon={<IconPlus size={14} />}>Register App</Btn>
      </div>

      {apps.length === 0 ? (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "48px 24px", textAlign: "center" }}>
          <IconGrid size={32} color={theme.textMuted} />
          <p style={{ fontSize: 15, fontWeight: 500, color: theme.text, margin: "16px 0 6px", fontFamily: font }}>No apps registered yet</p>
          <p style={{ fontSize: 13, color: theme.textSecondary, margin: "0 0 20px", fontFamily: font }}>Register your first app to get an API key.</p>
          <Btn onClick={() => { setNewApiKey(null); setShowModal(true); }} icon={<IconPlus size={14} />}>Register App</Btn>
        </div>
      ) : (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden" }}>
          {apps.map((app, i) => (
            <div key={app.id} style={{ padding: "20px 24px", borderBottom: i < apps.length - 1 ? `1px solid ${theme.border}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: theme.text, margin: "0 0 4px", fontFamily: font }}>{app.name}</p>
                  <p style={{ fontSize: 12, color: theme.textMuted, margin: 0, fontFamily: font }}>
                    Registered {new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="secondary" size="sm" onClick={() => handleRegenerate(app.id)} icon={<IconRefresh size={13} />}>Regenerate Key</Btn>
                  <button
                    onClick={() => setDeleteConfirm(app.id)}
                    style={{ display: "flex", padding: 7, background: "none", border: `1px solid ${theme.border}`, borderRadius: 6, cursor: "pointer", color: theme.textSecondary, transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.error.text; e.currentTarget.style.color = theme.error.text; e.currentTarget.style.background = theme.error.bg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.background = "none"; }}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px 14px" }}>
                <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0, fontFamily: "monospace", flex: 1 }}>nfy_••••••••••••••••••••••••••••••••</p>
                <button
                  onClick={() => handleCopy(app.api_key, app.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: copiedId === app.id ? theme.success.text : theme.textSecondary, fontFamily: font, padding: 0 }}
                >
                  {copiedId === app.id ? <IconCheck size={13} color={theme.success.text} /> : <IconCopy size={13} />}
                  {copiedId === app.id ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={newApiKey ? "App Registered" : "Register New App"}
          subtitle={newApiKey ? "Save this API key now — it won't be shown again." : "Give your app a name to generate an API key."}
          onClose={() => { setShowModal(false); setNewApiKey(null); setNewAppName(""); }}
          footer={
            newApiKey ? (
              <Btn onClick={() => { setShowModal(false); setNewApiKey(null); setNewAppName(""); }}>Done</Btn>
            ) : (
              <>
                <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
                <Btn onClick={handleCreate} disabled={saving || !newAppName.trim()} icon={<IconPlus size={14} />}>
                  {saving ? "Creating…" : "Create App"}
                </Btn>
              </>
            )
          }
        >
          {newApiKey ? (
            <div>
              <p style={{ fontSize: 14, color: theme.textSecondary, margin: "0 0 16px", fontFamily: font, lineHeight: 1.6 }}>
                Copy this API key and store it securely. You won't be able to see it again.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "12px 16px" }}>
                <p style={{ fontSize: 13, color: theme.text, margin: 0, fontFamily: "monospace", flex: 1, wordBreak: "break-all" }}>{newApiKey}</p>
                <button
                  onClick={() => handleCopy(newApiKey, "modal")}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: copiedId === "modal" ? theme.success.text : theme.textSecondary, fontFamily: font, padding: 0, flexShrink: 0 }}
                >
                  {copiedId === "modal" ? <IconCheck size={13} color={theme.success.text} /> : <IconCopy size={13} />}
                  {copiedId === "modal" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <Input label="App Name" value={newAppName} onChange={setNewAppName} placeholder="e.g. EHR Platform" required />
          )}
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          title="Delete App"
          subtitle="This action cannot be undone."
          onClose={() => setDeleteConfirm(null)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => handleDelete(deleteConfirm)} icon={<IconTrash size={14} />}>Delete App</Btn>
            </>
          }
        >
          <p style={{ fontSize: 14, color: theme.textSecondary, fontFamily: font, margin: 0, lineHeight: 1.6 }}>
            Deleting this app will revoke its API key immediately. Any connected app using this key will stop working.
          </p>
        </Modal>
      )}
    </div>
  );
};