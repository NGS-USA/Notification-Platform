"use client";

import { useState } from "react";
import { theme, font } from "../../theme";

const CodeBlock = ({ code, language = "json" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative", marginBottom: 20 }}>
      <pre style={{
        background: "#0F0F0F",
        border: `1px solid #222222`,
        borderRadius: 8,
        padding: "16px 20px",
        fontSize: 13,
        color: "#E0E0E0",
        fontFamily: "monospace",
        overflowX: "auto",
        margin: 0,
        lineHeight: 1.6,
      }}>
        {code}
      </pre>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: copied ? "#1E3A1E" : "#1A1A1A",
          border: `1px solid ${copied ? "#346538" : "#333333"}`,
          borderRadius: 5,
          padding: "4px 10px",
          fontSize: 11,
          color: copied ? "#6FCF72" : "#888888",
          cursor: "pointer",
          fontFamily: font,
          transition: "all 0.15s",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
};

const Section = ({ title, description, children }) => (
  <div style={{ marginBottom: 48 }}>
    <h2 style={{ fontSize: 17, fontWeight: 600, color: theme.text, margin: "0 0 6px", fontFamily: font, letterSpacing: "-0.01em" }}>
      {title}
    </h2>
    {description && (
      <p style={{ fontSize: 14, color: theme.textSecondary, margin: "0 0 20px", fontFamily: font, lineHeight: 1.6 }}>
        {description}
      </p>
    )}
    {children}
  </div>
);

const Endpoint = ({ method, path, description }) => {
  const colors = {
    POST: { bg: "#E1F3FE", text: "#1F6C9F" },
    GET: { bg: "#EDF3EC", text: "#346538" },
    DELETE: { bg: "#FDEBEC", text: "#9F2F2D" },
  };
  const c = colors[method] || colors.GET;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <span style={{ padding: "2px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", background: c.bg, color: c.text, fontFamily: "monospace", flexShrink: 0 }}>
        {method}
      </span>
      <span style={{ fontSize: 13, fontFamily: "monospace", color: theme.text, fontWeight: 500 }}>
        {path}
      </span>
      {description && (
        <span style={{ fontSize: 13, color: theme.textSecondary, fontFamily: font }}>
          — {description}
        </span>
      )}
    </div>
  );
};

const ParamRow = ({ name, type, required, description }) => (
  <tr>
    <td style={{ padding: "10px 16px", fontSize: 13, fontFamily: "monospace", color: theme.text, fontWeight: 500, borderBottom: `1px solid ${theme.border}` }}>
      {name}
      {required && <span style={{ color: theme.error.text, marginLeft: 4 }}>*</span>}
    </td>
    <td style={{ padding: "10px 16px", fontSize: 12, fontFamily: "monospace", color: theme.sms.text, background: theme.sms.bg, borderBottom: `1px solid ${theme.border}` }}>
      {type}
    </td>
    <td style={{ padding: "10px 16px", fontSize: 13, color: theme.textSecondary, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>
      {description}
    </td>
  </tr>
);

export const Docs = () => (
  <div style={{ maxWidth: 760 }}>
    {/* Header */}
    <div style={{ marginBottom: 40 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text, margin: "0 0 4px", fontFamily: font, letterSpacing: "-0.01em" }}>
        API Documentation
      </h1>
      <p style={{ fontSize: 14, color: theme.textSecondary, margin: 0, fontFamily: font }}>
        Connect your apps to Notifyio to send SMS and email notifications programmatically.
      </p>
    </div>

    {/* Authentication */}
    <Section
      title="Authentication"
      description="All API requests must include your app's API key as a Bearer token in the Authorization header. Generate an API key from the Apps page in this dashboard."
    >
      <CodeBlock code={`Authorization: Bearer nfy_your_api_key_here`} language="bash" />
      <div style={{ background: theme.warning.bg, border: `1px solid #E8D9A0`, borderRadius: 8, padding: "12px 16px" }}>
        <p style={{ fontSize: 13, color: theme.warning.text, margin: 0, fontFamily: font, lineHeight: 1.5 }}>
          Keep your API key secret. Never expose it in client-side code or commit it to a repository. Store it as an environment variable in your app.
        </p>
      </div>
    </Section>

    {/* Base URL */}
    <Section
      title="Base URL"
      description="All API endpoints are relative to your Notifyio deployment URL."
    >
      <CodeBlock code={`https://notification-platform-psi.vercel.app`} />
    </Section>

    {/* Send SMS */}
    <Section title="Send an SMS">
      <Endpoint method="POST" path="/api/send/sms" description="Send an SMS to a single recipient via Twilio" />
      <p style={{ fontSize: 14, color: theme.textSecondary, margin: "12px 0 16px", fontFamily: font, lineHeight: 1.6 }}>
        Sends an SMS message immediately and logs the result to your app's message history.
      </p>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Request body</p>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.bg }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Field</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Type</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <ParamRow name="to" type="string" required description="Recipient phone number in E.164 format e.g. +13025550100" />
            <ParamRow name="body" type="string" required description="The SMS message text to send" />
            <ParamRow name="template_id" type="uuid" description="Optional. ID of the Notifyio template used" />
            <ParamRow name="contact_id" type="uuid" description="Optional. ID of the Notifyio contact" />
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example request</p>
      <CodeBlock code={`fetch("https://notification-platform-psi.vercel.app/api/send/sms", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer nfy_your_api_key_here"
  },
  body: JSON.stringify({
    to: "+13025550100",
    body: "Hi John, your appointment is tomorrow at 9am."
  })
});`} language="js" />

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example response</p>
      <CodeBlock code={`{
  "success": true,
  "messageId": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "log": {
    "id": "uuid",
    "type": "sms",
    "recipient": "+13025550100",
    "status": "sent",
    "sent_at": "2025-06-01T12:00:00Z"
  }
}`} />
    </Section>

    {/* Send Email */}
    <Section title="Send an Email">
      <Endpoint method="POST" path="/api/send/email" description="Send an email to a single recipient via Paubox" />
      <p style={{ fontSize: 14, color: theme.textSecondary, margin: "12px 0 16px", fontFamily: font, lineHeight: 1.6 }}>
        Sends a HIPAA-compliant email immediately via Paubox and logs the result.
      </p>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Request body</p>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.bg }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Field</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Type</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <ParamRow name="to" type="string" required description="Recipient email address" />
            <ParamRow name="subject" type="string" required description="Email subject line" />
            <ParamRow name="body" type="string" required description="Email body — HTML is supported" />
            <ParamRow name="template_id" type="uuid" description="Optional. ID of the Notifyio template used" />
            <ParamRow name="contact_id" type="uuid" description="Optional. ID of the Notifyio contact" />
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example request</p>
      <CodeBlock code={`fetch("https://notification-platform-psi.vercel.app/api/send/email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer nfy_your_api_key_here"
  },
  body: JSON.stringify({
    to: "patient@example.com",
    subject: "Your appointment is confirmed",
    body: "<p>Hi John,</p><p>Your appointment is confirmed for tomorrow at 9am.</p>"
  })
});`} language="js" />

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example response</p>
      <CodeBlock code={`{
  "success": true,
  "messageId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "log": {
    "id": "uuid",
    "type": "email",
    "recipient": "patient@example.com",
    "status": "sent",
    "sent_at": "2025-06-01T12:00:00Z"
  }
}`} />
    </Section>

    {/* Schedule a Message */}
    <Section title="Schedule a Message">
      <Endpoint method="POST" path="/api/schedule" description="Queue a message for future delivery" />
      <p style={{ fontSize: 14, color: theme.textSecondary, margin: "12px 0 16px", fontFamily: font, lineHeight: 1.6 }}>
        Schedules a message to be sent at a specific future date and time. Notifyio checks for due messages every minute and sends them automatically.
      </p>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Request body</p>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.bg }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Field</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Type</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <ParamRow name="template_id" type="uuid" required description="ID of the Notifyio template to send" />
            <ParamRow name="contact_id" type="uuid" required description="ID of the Notifyio contact to send to" />
            <ParamRow name="send_at" type="ISO 8601" required description="Future datetime to send the message e.g. 2025-06-15T09:00:00Z" />
            <ParamRow name="variables" type="object" description="Optional. Key-value pairs to fill template variables" />
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example request</p>
      <CodeBlock code={`fetch("https://notification-platform-psi.vercel.app/api/schedule", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer nfy_your_api_key_here"
  },
  body: JSON.stringify({
    template_id: "uuid-of-your-template",
    contact_id: "uuid-of-your-contact",
    send_at: "2025-06-15T09:00:00Z",
    variables: {
      name: "John",
      date: "June 15",
      time: "9:00 AM"
    }
  })
});`} language="js" />

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example response</p>
      <CodeBlock code={`{
  "data": {
    "id": "uuid",
    "status": "pending",
    "send_at": "2025-06-15T09:00:00Z",
    "created_at": "2025-06-01T12:00:00Z"
  }
}`} />
    </Section>

    {/* Contacts */}
    <Section title="Add or Update a Contact">
      <Endpoint method="POST" path="/api/contacts" description="Create or update a contact in your app" />
      <p style={{ fontSize: 14, color: theme.textSecondary, margin: "12px 0 16px", fontFamily: font, lineHeight: 1.6 }}>
        Creates a new contact or updates an existing one if a matching email or phone is found for your app. Use this to sync your patient or customer records with Notifyio before scheduling messages.
      </p>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example request</p>
      <CodeBlock code={`fetch("https://notification-platform-psi.vercel.app/api/contacts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer nfy_your_api_key_here"
  },
  body: JSON.stringify({
    name: "John Smith",
    phone: "+13025550100",
    email: "john@example.com",
    metadata: {
      patient_id: "12345",
      dob: "1985-04-12"
    }
  })
});`} language="js" />
    </Section>

    {/* Get Logs */}
    <Section title="Get Message Logs">
      <Endpoint method="GET" path="/api/logs" description="Fetch message history for your app" />
      <p style={{ fontSize: 14, color: theme.textSecondary, margin: "12px 0 16px", fontFamily: font, lineHeight: 1.6 }}>
        Returns a list of sent messages scoped to your app. Use this to pull delivery data into your own reporting.
      </p>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Query parameters</p>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.bg }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Param</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Type</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <ParamRow name="type" type="string" description="Filter by channel: sms or email" />
            <ParamRow name="status" type="string" description="Filter by status: sent, delivered, opened, failed" />
            <ParamRow name="limit" type="number" description="Max number of results to return. Default 50" />
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example request</p>
      <CodeBlock code={`fetch("https://notification-platform-psi.vercel.app/api/logs?type=sms&limit=20", {
  headers: {
    "Authorization": "Bearer nfy_your_api_key_here"
  }
});`} language="js" />
    </Section>

    {/* Bulk Send */}
        <Section title="Bulk Send">
          <Endpoint method="POST" path="/api/send/bulk" description="Send a message to multiple recipients in one request" />
          <p style={{ fontSize: 14, color: theme.textSecondary, margin: "12px 0 16px", fontFamily: font, lineHeight: 1.6 }}>
            Sends to all recipients in parallel and returns a full summary of delivered and failed messages. Each recipient can have its own body and subject so template variables can be resolved server-side in your app before calling this endpoint.
          </p>

          <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Request body</p>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: theme.bg }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Field</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Type</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <ParamRow name="type" type="string" required description="Channel to send on: sms or email" />
                <ParamRow name="recipients" type="array" required description="Array of recipient objects — see fields below" />
                <ParamRow name="template_id" type="uuid" description="Optional. ID of the Notifyio template used for logging" />
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Recipient object fields</p>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: theme.bg }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Field</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Type</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <ParamRow name="to" type="string" required description="Phone number (SMS) or email address (email)" />
                <ParamRow name="body" type="string" required description="Message body — HTML supported for email" />
                <ParamRow name="subject" type="string" description="Required for email. Subject line." />
                <ParamRow name="contact_id" type="uuid" description="Optional. Notifyio contact ID for log linking" />
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example request — SMS</p>
          <CodeBlock code={`fetch("https://notification-platform-psi.vercel.app/api/send/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer nfy_your_api_key_here"
      },
      body: JSON.stringify({
        type: "sms",
        recipients: [
          { to: "+13025550100", body: "Hi John, your appointment is tomorrow at 9am." },
          { to: "+14105550147", body: "Hi Sarah, your appointment is tomorrow at 11am." },
          { to: "+13025550288", body: "Hi Mike, your appointment is tomorrow at 2pm." }
        ]
      })
    });`} language="js" />

          <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example request — Email</p>
          <CodeBlock code={`fetch("https://notification-platform-psi.vercel.app/api/send/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer nfy_your_api_key_here"
      },
      body: JSON.stringify({
        type: "email",
        recipients: [
          {
            to: "john@example.com",
            subject: "Your appointment is tomorrow",
            body: "<p>Hi John, your appointment is tomorrow at 9am.</p>"
          },
          {
            to: "sarah@example.com",
            subject: "Your appointment is tomorrow",
            body: "<p>Hi Sarah, your appointment is tomorrow at 11am.</p>"
          }
        ]
      })
    });`} language="js" />

          <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 8px", fontFamily: font }}>Example response</p>
          <CodeBlock code={`{
      "success": true,
      "total": 3,
      "delivered": 2,
      "failed": 1,
      "results": [
        { "to": "+13025550100", "status": "sent" },
        { "to": "+14105550147", "status": "sent" },
        { "to": "+13025550288", "status": "failed", "error": "Invalid phone number" }
      ]
    }`} />
        </Section>

    {/* Error Handling */}
    <Section
      title="Error Handling"
      description="All errors return a JSON object with an error field and an appropriate HTTP status code."
    >
      <CodeBlock code={`{
  "error": "Missing required fields: to, body"
}`} />
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: theme.bg }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Status</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.textMuted, fontFamily: font, borderBottom: `1px solid ${theme.border}` }}>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <ParamRow name="400" type="" description="Bad request — missing or invalid fields" />
            <ParamRow name="401" type="" description="Unauthorized — missing or invalid API key" />
            <ParamRow name="404" type="" description="Not found — resource does not exist" />
            <ParamRow name="500" type="" description="Server error — something went wrong on our end" />
          </tbody>
        </table>
      </div>
    </Section>
  </div>
);