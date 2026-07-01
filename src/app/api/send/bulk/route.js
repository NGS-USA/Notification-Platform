import twilio from "twilio";
import { supabase } from "@/lib/supabase";
import { validateApiKey } from "@/lib/authMiddleware";

export async function POST(request) {
  const { error: authError, status: authStatus, app } = await validateApiKey(request);
  if (authError) {
    return Response.json({ error: authError }, { status: authStatus });
  }

  try {
    const { type, recipients, template_id } = await request.json();

    if (!type || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return Response.json(
        { error: "Missing required fields: type, recipients (array)" },
        { status: 400 }
      );
    }

    if (!["sms", "email"].includes(type)) {
      return Response.json(
        { error: "type must be either sms or email" },
        { status: 400 }
      );
    }

    // Validate each recipient has required fields
    for (const recipient of recipients) {
      if (type === "sms" && !recipient.to) {
        return Response.json(
          { error: "Each recipient must have a to field for SMS sends" },
          { status: 400 }
        );
      }
      if (type === "email" && (!recipient.to || !recipient.subject)) {
        return Response.json(
          { error: "Each recipient must have a to and subject field for email sends" },
          { status: 400 }
        );
      }
      if (!recipient.body) {
        return Response.json(
          { error: "Each recipient must have a body field" },
          { status: 400 }
        );
      }
    }

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        try {
          if (type === "sms") {
            const client = twilio(
              process.env.TWILIO_ACCOUNT_SID,
              process.env.TWILIO_AUTH_TOKEN
            );
            await client.messages.create({
              body: recipient.body,
              from: process.env.TWILIO_FROM_NUMBER,
              to: recipient.to,
            });
          } else {
            const response = await fetch(
              `https://api.paubox.net/v1/${process.env.PAUBOX_DOMAIN}/messages`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Token token=${process.env.PAUBOX_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  data: {
                    message: {
                      recipients: [recipient.to],
                      headers: {
                        subject: recipient.subject,
                        from: process.env.PAUBOX_FROM_EMAIL,
                      },
                      content: { "text/html": recipient.body },
                    },
                  },
                }),
              }
            );
            if (!response.ok) throw new Error("Paubox send failed");
          }

          // Log success
          await supabase.from("message_logs").insert([{
            app_id: app.id,
            template_id: template_id || null,
            contact_id: recipient.contact_id || null,
            type,
            recipient: recipient.to,
            subject: recipient.subject || null,
            body: recipient.body,
            status: "sent",
          }]);

          return { to: recipient.to, status: "sent" };
        } catch (err) {
          // Log failure
          await supabase.from("message_logs").insert([{
            app_id: app.id,
            template_id: template_id || null,
            contact_id: recipient.contact_id || null,
            type,
            recipient: recipient.to,
            body: recipient.body,
            status: "failed",
            error: err.message,
          }]);

          return { to: recipient.to, status: "failed", error: err.message };
        }
      })
    );

    const summary = results.map((r) => r.value || { status: "failed", error: r.reason });
    const delivered = summary.filter((r) => r.status === "sent").length;
    const failed = summary.filter((r) => r.status === "failed").length;

    return Response.json({
      success: true,
      total: recipients.length,
      delivered,
      failed,
      results: summary,
    });
  } catch (error) {
    console.error("Bulk send error:", error);
    return Response.json(
      { error: error.message || "Bulk send failed" },
      { status: 500 }
    );
  }
}