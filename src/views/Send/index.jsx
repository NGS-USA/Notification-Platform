"use client";

import { useState } from "react";
import { theme, font } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Btn } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { IconSend, IconSMS, IconMail, IconCheck, IconAlert } from "../../icons";

const extractVars = (str) => {
  const matches = str?.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
};

const resolveBody = (text, variables) =>
  text?.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] || `{{${k}}}`);

export const Send = ({ templates, setHistory }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ type: "sms", templateId: "", recipient: "", variables: {} });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const selectedTemplate = templates.find((t) => String(t.id) === String(form.templateId));
  const typeTemplates = templates.filter((t) => t.type === form.type);

  const allVars = [
    ...new Set([
      ...extractVars(selectedTemplate?.body),
      ...extractVars(selectedTemplate?.subject),
    ]),
  ];

  const handleSend = async () => {
    setSending(true);
    setError(null);

    try {
      const endpoint = form.type === "sms" ? "/api/send/sms" : "/api/send/email";

      const payload = form.type === "sms"
        ? {
            to: form.recipient,
            body: resolveBody(selectedTemplate?.body, form.variables),
          }
        : {
            to: form.recipient,
            subject: resolveBody(selectedTemplate?.subject, form.variables),
            body: resolveBody(selectedTemplate?.body, form.variables),
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setHistory((prev) => [
        {
          id: Date.now(),
          template: selectedTemplate.name,
          type: form.type,
          recipient: form.recipient,
          status: "delivered",
          time: "Just now",
        },
        ...prev,
      ]);

      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setForm({ type: "sms", templateId: "", recipient: "", variables: {} });
    setStep(1);
    setSent(false);
    setError(null);
  };

  // Success state
  if (sent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: theme.success.bg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <IconCheck size={24} color={theme.success.text} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>
          Notification sent
        </h2>
        <p style={{ fontSize: 14, color: theme.textSecondary, margin: "0 0 28px", fontFamily: font }}>
          {selectedTemplate?.name} sent to {form.recipient} via {form.type === "sms" ? "Twilio" : "Paubox"}.
        </p>
        <Btn onClick={reset} icon={<IconSend size={14} />}>Send Another</Btn>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text, margin: "0 0 4px", fontFamily: font, letterSpacing: "-0.01em" }}>
          Send Notification
        </h1>
        <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0, fontFamily: font }}>
          Select a template, fill in details, and send.
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
        {[
          { n: 1, l: "Channel & Template" },
          { n: 2, l: "Variables" },
          { n: 3, l: "Preview & Send" },
        ].map((s, i, arr) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: font,
                  background: step > s.n ? theme.success.bg : step === s.n ? "#111111" : theme.border,
                  color: step > s.n ? theme.success.text : step === s.n ? "#FFFFFF" : theme.textSecondary,
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {step > s.n ? <IconCheck size={12} /> : s.n}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: step === s.n ? 500 : 400,
                  color: step === s.n ? theme.text : theme.textSecondary,
                  fontFamily: font,
                  whiteSpace: "nowrap",
                }}
              >
                {s.l}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div style={{ flex: 1, height: 1, background: theme.border, margin: "0 16px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step Panel */}
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 28 }}>

        {/* Step 1: Channel & Template */}
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
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      border: `1.5px solid ${form.type === ch.v ? "#111111" : theme.border}`,
                      borderRadius: 8,
                      background: form.type === ch.v ? "#F9F9F8" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textAlign: "left",
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
            <Input
              label={form.type === "sms" ? "Recipient Phone Number" : "Recipient Email Address"}
              value={form.recipient}
              onChange={(v) => setForm((f) => ({ ...f, recipient: v }))}
              placeholder={form.type === "sms" ? "+1 (302) 555-0000" : "name@company.com"}
              type={form.type === "email" ? "email" : "tel"}
              required
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Btn onClick={() => setStep(2)} disabled={!form.templateId || !form.recipient.trim()}>
                Continue
              </Btn>
            </div>
          </div>
        )}

        {/* Step 2: Variables */}
        {step === 2 && (
          <div>
            <p style={{ fontSize: 14, color: theme.textSecondary, margin: "0 0 20px", fontFamily: font, lineHeight: 1.6 }}>
              Fill in variables for <strong style={{ color: theme.text }}>{selectedTemplate?.name}</strong>. Leave blank to keep the placeholder.
            </p>
            {allVars.length === 0 ? (
              <div style={{ background: theme.bg, borderRadius: 8, padding: "16px 20px", marginBottom: 20 }}>
                <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0, fontFamily: font }}>
                  This template has no variables — you are ready to preview.
                </p>
              </div>
            ) : (
              allVars.map((v) => (
                <Input
                  key={v}
                  label={`{{${v}}}`}
                  value={form.variables[v] || ""}
                  onChange={(val) => setForm((f) => ({ ...f, variables: { ...f.variables, [v]: val } }))}
                  placeholder={`Value for ${v}`}
                />
              ))
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <Btn variant="secondary" onClick={() => setStep(1)}>Back</Btn>
              <Btn onClick={() => setStep(3)}>Preview</Btn>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Send */}
        {step === 3 && (
          <div>
            <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 20, marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, margin: "0 0 14px", fontFamily: font }}>
                Preview
              </p>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <Badge type={form.type} />
                <span style={{ fontSize: 13, color: theme.textSecondary, fontFamily: font }}>
                  To: <strong style={{ color: theme.text }}>{form.recipient}</strong>
                </span>
              </div>
              {form.type === "email" && (
                <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: "0 0 10px", fontFamily: font }}>
                  Subject: {resolveBody(selectedTemplate?.subject, form.variables)}
                </p>
              )}
              <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 6, padding: 14, fontSize: 13, color: theme.text, fontFamily: font, lineHeight: 1.6 }}>
                {form.type === "sms" ? (
                  <p style={{ margin: 0 }}>{resolveBody(selectedTemplate?.body, form.variables)}</p>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: resolveBody(selectedTemplate?.body, form.variables) }} />
                )}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div style={{ background: theme.error.bg, border: `1px solid #F5C0C0`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ marginTop: 1 }}>
                  <IconAlert size={14} color={theme.error.text} />
                </div>
                <p style={{ fontSize: 13, color: theme.error.text, margin: 0, fontFamily: font, lineHeight: 1.5 }}>
                  {error}
                </p>
              </div>
            )}

            {/* Warning Banner */}
            <div style={{ background: theme.warning.bg, border: `1px solid #E8D9A0`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ marginTop: 1 }}>
                <IconAlert size={14} color={theme.warning.text} />
              </div>
              <p style={{ fontSize: 13, color: theme.warning.text, margin: 0, fontFamily: font, lineHeight: 1.5 }}>
                This will send a live {form.type === "sms" ? "SMS via Twilio" : "email via Paubox"}.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Btn variant="secondary" onClick={() => setStep(2)}>Back</Btn>
              <Btn onClick={handleSend} disabled={sending} icon={<IconSend size={14} />}>
                {sending ? "Sending…" : `Send ${form.type === "sms" ? "SMS" : "Email"}`}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};