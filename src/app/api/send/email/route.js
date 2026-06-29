import { supabase } from "@/lib/supabase";
import { validateApiKey } from "@/lib/authMiddleware";

export async function POST(request) {
  // Validate API key
  const { error: authError, status: authStatus, app } = await validateApiKey(request);
  if (authError) {
    return Response.json({ error: authError }, { status: authStatus });
  }

  try {
    const { to, subject, body, template_id, contact_id } = await request.json();

    if (!to || !subject || !body) {
      return Response.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

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
              recipients: [to],
              headers: {
                subject,
                from: process.env.PAUBOX_FROM_EMAIL,
              },
              content: {
                "text/html": body,
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Failed to send email");
    }

    const result = await response.json();

    // Log the successful send
    const { data: logEntry } = await supabase
      .from("message_logs")
      .insert([{
        app_id: app.id,
        template_id,
        contact_id,
        type: "email",
        recipient: to,
        subject,
        body,
        status: "sent",
      }])
      .select()
      .single();

    return Response.json({ success: true, messageId: result.data?.message?.id, log: logEntry });
  } catch (error) {
    console.error("Paubox error:", error);

    await supabase.from("message_logs").insert([{
      app_id: app.id,
      type: "email",
      recipient: "unknown",
      body: "unknown",
      status: "failed",
      error: error.message,
    }]);

    return Response.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}