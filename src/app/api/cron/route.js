import twilio from "twilio";
import { supabase } from "@/lib/supabase";

// This route is called by Vercel Cron every minute
// It finds pending scheduled messages that are due and sends them
export async function GET(request) {
  // Verify this is being called by Vercel Cron
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all pending messages that are due to send
    const { data: dueMessages, error: fetchError } = await supabase
      .from("scheduled_messages")
      .select("*, templates(*), contacts(*)")
      .eq("status", "pending")
      .lte("send_at", new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!dueMessages || dueMessages.length === 0) {
      return Response.json({ processed: 0 });
    }

    const results = await Promise.allSettled(
      dueMessages.map(async (scheduled) => {
        const { templates: template, contacts: contact, variables } = scheduled;

        // Resolve variables in the template body
        const resolveBody = (text) =>
          text?.replace(/\{\{(\w+)\}\}/g, (_, k) => variables?.[k] || `{{${k}}}`);

        try {
          if (template.type === "sms") {
            const client = twilio(
              process.env.TWILIO_ACCOUNT_SID,
              process.env.TWILIO_AUTH_TOKEN
            );
            await client.messages.create({
              body: resolveBody(template.body),
              from: process.env.TWILIO_FROM_NUMBER,
              to: contact.phone,
            });
          } else if (template.type === "email") {
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
                      recipients: [contact.email],
                      headers: {
                        subject: resolveBody(template.subject),
                        from: process.env.PAUBOX_FROM_EMAIL,
                      },
                      content: { "text/html": resolveBody(template.body) },
                    },
                  },
                }),
              }
            );
            if (!response.ok) throw new Error("Paubox send failed");
          }

          // Mark as sent and log it
          await Promise.all([
            supabase
              .from("scheduled_messages")
              .update({ status: "sent" })
              .eq("id", scheduled.id),
            supabase.from("message_logs").insert([{
              app_id: scheduled.app_id,
              template_id: scheduled.template_id,
              contact_id: scheduled.contact_id,
              type: template.type,
              recipient: template.type === "sms" ? contact.phone : contact.email,
              subject: template.type === "email" ? resolveBody(template.subject) : null,
              body: resolveBody(template.body),
              status: "sent",
            }]),
          ]);

          return { id: scheduled.id, status: "sent" };
        } catch (err) {
          // Mark as failed and log the error
          await Promise.all([
            supabase
              .from("scheduled_messages")
              .update({ status: "failed" })
              .eq("id", scheduled.id),
            supabase.from("message_logs").insert([{
              app_id: scheduled.app_id,
              template_id: scheduled.template_id,
              contact_id: scheduled.contact_id,
              type: template.type,
              recipient: template.type === "sms" ? contact.phone : contact.email,
              body: resolveBody(template.body),
              status: "failed",
              error: err.message,
            }]),
          ]);

          return { id: scheduled.id, status: "failed", error: err.message };
        }
      })
    );

    const processed = results.map((r) => r.value || r.reason);
    console.log(`Cron processed ${processed.length} scheduled messages`);

    return Response.json({ processed: processed.length, results: processed });
  } catch (error) {
    console.error("Cron error:", error);
    return Response.json(
      { error: error.message || "Cron job failed" },
      { status: 500 }
    );
  }
}