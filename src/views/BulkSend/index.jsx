"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { theme, font } from "../../theme";
import { Select } from "../../components/ui/Select";
import { Btn } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { IconSend, IconSMS, IconMail, IconCheck, IconAlert, IconUpload, IconX } from "../../icons";

const resolveBody = (text, variables) =>
  text?.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] || `{{${k}}}`);

export const BulkSend = ({ templates, setHistory }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ type: "sms", templateId: "" });
  const [recipients, setRecipients] = useState([]);
  const [csvError, setCsvError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [results, setResults] = useState([]);
  const [fileName, setFileName] = useState(null);
  const fileRef = useRef();

  const selectedTemplate = templates.find((t) => String(t.id) === String(form.templateId));
  const typeTemplates = templates.filter((t) => t.type === form.type);

  const handleFileUpload = (file) => {
    if (!file) return;
    setCsvError(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          setCsvError("Could not parse CSV. Make sure it has a header row.");
          return;
        }

        const rows = result.data;
        const hasPhone = rows[0]?.phone || rows[0]?.Phone;
        const hasEmail = rows[0]?.email || rows[0]?.Email;

        if (form.type === "sms" && !hasPhone) {
          setCsvError('CSV must have a "phone" column for SMS sends.');
          return;
        }
        if (form.type === "email" && !hasEmail) {
          setCsvError('CSV must have an "email" column for email sends.');
          return;
        }

        setRecipients(rows);
      },
      error: () => {
        setCsvError("Failed to read file. Make sure it is a valid CSV.");
      },
    });
  };

  const handleSend = async () => {
    setSending(true);
    const endpoint = form.type === "sms" ? "/api/send/sms" : "/api/send/email";
    const sendResults = [];

    for (const row of recipients) {
      const recipient = form.type === "sms"
        ? (row.phone || row.Phone)
        : (row.email || row.Email);

      const resolvedBody = resolveBody(selectedTemplate?.body, row);
      const resolvedSubject = resolveBody(selectedTemplate?.subject, row);

      try {
        const payload = form.type === "sms"
          ? { to: recipient, body: resolvedBody }
          : { to: recipient, subject: resolvedSubject, body: resolvedBody };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Failed");

        sendResults.push({ recipient, status: "delivered" });
        setHistory((prev) => [{
          id: Date.now() + Math.random(),
          template: selectedTemplate.name,
          type: form.type,
          recipient,
          status: "delivered",
          time: "Just now",
        }, ...prev]);
      } catch (err) {
        sendResults.push({ recipient, status: "failed", error: err.message });
      }
    }

    setResults(sendResults);
    setSending(false);
    setSent(true);
  };

  const reset = () => {
    setStep(1);
    setForm({ type: "sms", templateId: "" });
    setRecipients([]);
    setCsvError(null);
    setFileName(null);
    setSent(false);
    setResults([]);
  };

  // Success screen
  if (sent) {
    const delivered = results.filter((r) => r.status === "delivered").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return (
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text, margin: "0 0 4px", fontFamily: font, letterSpacing: "-0.01em" }}>Bulk Send Complete</h1>
          <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0, fontFamily: font }}>Here's a summary of your send.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: theme.success.bg, border: `1px solid #B7DDB7`, borderRadius: 10, padding: "20px 24px" }}>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.success.text, margin: "0 0 8px", fontFamily: font }}>Delivered</p>
            <p style={{ fontSize: 32, fontWeight: 600, color: theme.success.text, margin: 0, fontFamily: font }}>{delivered}</p>
          </div>
          <div style={{ background: failed > 0 ? theme.error.bg : theme.bg, border: `1px solid ${failed > 0 ? "#F5C0C0" : theme.border}`, borderRadius: 10, padding: "20px 24px" }}>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: failed > 0 ? theme.error.text : theme.textSecondary, margin: "0 0 8px", fontFamily: font }}>Failed</p>
            <p style={{ fontSize: 32, fontWeight: 600, color: failed > 0 ? theme.error.text : theme.textSecondary, margin: 0, fontFamily: font }}>{failed}</p>
          </div>
        </div>

        {failed > 0 && (
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}` }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: 0, fontFamily: font }}>Failed Recipients</p>
            </div>
            {results.filter((r) => r.status === "failed").map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: i < failed - 1 ? `1px solid ${theme.border}` : "none" }}>
                <p style={{ fontSize: 13, color: theme.text, margin: 0, fontFamily: font }}>{r.recipient}</p>
                <p style={{ fontSize: 12, color: theme.error.text, margin: 0, fontFamily: font }}>{r.error}</p>
              </div>
            ))}
          </div>
        )}

        <Btn onClick={reset} icon={<IconSend size={14} />}>Send Another</Btn>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text, margin: "0 0 4px", fontFamily: font, letterSpacing: "-0.01em" }}>Bulk Send</h1>
        <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0, fontFamily: font }}>Upload a CSV and send a template to multiple recipients at once.</p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
        {[
          { n: 1, l: "Channel & Template" },
          { n: 2, l: "Upload CSV" },
          { n: 3, l: "Preview & Send" },
        ].map((s, i, arr) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, fontFamily: font,
                background: step > s.n ? theme.success.bg : step === s.n ? "#111111" : theme.border,
                color: step > s.n ? theme.success.text : step === s.n ? "#FFFFFF" : theme.textSecondary,
                flexShrink: 0, transition: "all 0.2s",
              }}>
                {step > s.n ? <IconCheck size={12} /> : s.n}
              </div>
              <span style={{ fontSize: 13, fontWeight: step === s.n ? 500 : 400, color: step === s.n ? theme.text : theme.textSecondary, fontFamily: font, whiteSpace: "nowrap" }}>
                {s.l}
              </span>
            </div>
            {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: theme.border, margin: "0 16px" }} />}
          </div>
        ))}
      </div>

      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 28 }}>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: theme.text, marginBottom: 10, fontFamily: font }}>
                Channel <span style={{ color: theme.error.text }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { v: "sms", l: "SMS", sub: "via Twilio", Icon: IconSMS, style: theme.sms },
                  { v: "email", l: "Email", sub: "via Paubox", Icon: IconMail, style: theme.email },
                ].map((ch) => (
                  <button
                    key={ch.v}
                    onClick={() => setForm((f) => ({ ...f, type: ch.v, templateId: "" }))}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                      border: `1.5px solid ${form.type === ch.v ? "#111111" : theme.border}`,
                      borderRadius: 8, background: form.type === ch.v ? "#F9F9F8" : "transparent",
                      cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                    }}
                  >
                    <span style={{ padding: 9, background: form.type === ch.v ? ch.style.bg : theme.bg, borderRadius: 7, display: "flex" }}>
                      <ch.Icon size={18} color={form.type === ch.v ? ch.style.text : theme.textSecondary} />
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: theme.text, margin: 0, fontFamily: font }}>{ch.l}</p>
                      <p style={{ fontSize: 12, color: theme.textSecondary, margin: 0, fontFamily: font }}>{ch.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Select
              label="Template"
              value={form.templateId}
              onChange={(v) => setForm((f) => ({ ...f, templateId: v }))}
              options={[
                { value: "", label: "Select a template…" },
                ...typeTemplates.map((t) => ({ value: String(t.id), label: t.name })),
              ]}
              required
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Btn onClick={() => setStep(2)} disabled={!form.templateId}>Continue</Btn>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: 14, color: theme.textSecondary, margin: "0 0 20px", fontFamily: font, lineHeight: 1.6 }}>
              Upload a CSV file with your recipients. For SMS the file needs a <strong style={{ color: theme.text }}>phone</strong> column. For email it needs an <strong style={{ color: theme.text }}>email</strong> column. Any other columns will be used as template variables.
            </p>

            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${csvError ? theme.error.text : theme.border}`,
                borderRadius: 10, padding: "36px 24px", textAlign: "center",
                cursor: "pointer", transition: "all 0.15s", marginBottom: 16,
                background: csvError ? theme.error.bg : "transparent",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#AAAAAA"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = csvError ? theme.error.text : theme.border}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <IconUpload size={24} color={theme.textMuted} />
              </div>
              {fileName ? (
                <p style={{ fontSize: 14, fontWeight: 500, color: theme.text, margin: 0, fontFamily: font }}>{fileName}</p>
              ) : (
                <>
                  <p style={{ fontSize: 14, fontWeight: 500, color: theme.text, margin: "0 0 4px", fontFamily: font }}>Click to upload a CSV</p>
                  <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0, fontFamily: font }}>or drag and drop</p>
                </>
              )}
            </div>

            {csvError && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: theme.error.bg, border: `1px solid #F5C0C0`, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                <IconAlert size={14} color={theme.error.text} />
                <p style={{ fontSize: 13, color: theme.error.text, margin: 0, fontFamily: font }}>{csvError}</p>
              </div>
            )}

            {recipients.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: theme.success.bg, borderRadius: 8, marginBottom: 16 }}>
                <IconCheck size={14} color={theme.success.text} />
                <p style={{ fontSize: 13, color: theme.success.text, margin: 0, fontFamily: font }}>
                  <strong>{recipients.length}</strong> recipients loaded
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <Btn variant="secondary" onClick={() => setStep(1)}>Back</Btn>
              <Btn onClick={() => setStep(3)} disabled={recipients.length === 0 || !!csvError}>Preview</Btn>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge type={form.type} />
                <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: 0, fontFamily: font }}>{selectedTemplate?.name}</p>
              </div>
              <p style={{ fontSize: 13, color: theme.textSecondary, margin: 0, fontFamily: font }}>
                <strong style={{ color: theme.text }}>{recipients.length}</strong> recipients
              </p>
            </div>

            <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 20, maxHeight: 280, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                    {Object.keys(recipients[0] || {}).map((key) => (
                      <th key={key} style={{ textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, padding: "10px 16px", fontFamily: font }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recipients.slice(0, 10).map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < Math.min(recipients.length, 10) - 1 ? `1px solid ${theme.border}` : "none" }}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{ padding: "10px 16px", fontSize: 13, color: theme.text, fontFamily: font }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {recipients.length > 10 && (
                <div style={{ padding: "10px 16px", borderTop: `1px solid ${theme.border}` }}>
                  <p style={{ fontSize: 12, color: theme.textMuted, margin: 0, fontFamily: font }}>
                    Showing 10 of {recipients.length} recipients
                  </p>
                </div>
              )}
            </div>

            <div style={{ background: theme.warning.bg, border: `1px solid #E8D9A0`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <IconAlert size={14} color={theme.warning.text} />
              <p style={{ fontSize: 13, color: theme.warning.text, margin: 0, fontFamily: font, lineHeight: 1.5 }}>
                This will send <strong>{recipients.length}</strong> live {form.type === "sms" ? "SMS messages via Twilio" : "emails via Paubox"}.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Btn variant="secondary" onClick={() => setStep(2)}>Back</Btn>
              <Btn onClick={handleSend} disabled={sending} icon={<IconSend size={14} />}>
                {sending ? `Sending… (${results.length}/${recipients.length})` : `Send to ${recipients.length} Recipients`}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};