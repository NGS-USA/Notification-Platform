import twilio from "twilio";
import { supabase } from "@/lib/supabase";
import { validateApiKey } from "@/lib/authMiddleware";

export async function POST(request) {
  // Validate API key
  const { error: authError, status: authStatus, app } = await validateApiKey(request);
  if (authError) {
    return Response.json({ error: authError }, { status: authStatus });
  }

  try {
    const { to, body, template_id, contact_id } = await request.json();

    if (!to || !body) {
      return Response.json(
        { error: "Missing required fields: to, body" },
        { status: 400 }
      );
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to,
    });

    // Log the successful send
    const { data: logEntry } = await supabase
      .from("message_logs")
      .insert([{
        app_id: app.id,
        template_id,
        contact_id,
        type: "sms",
        recipient: to,
        body,
        status: "sent",
      }])
      .select()
      .single();

    return Response.json({ success: true, messageId: message.sid, log: logEntry });
  } catch (error) {
    console.error("Twilio error:", error);

    await supabase.from("message_logs").insert([{
      app_id: app.id,
      type: "sms",
      recipient: "unknown",
      body: "unknown",
      status: "failed",
      error: error.message,
    }]);

    return Response.json(
      { error: error.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}