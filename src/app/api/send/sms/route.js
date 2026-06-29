import twilio from "twilio";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  let logEntry = null;

  try {
    const { to, body, template_id, contact_id, app_id } = await request.json();

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

    // Log the successful send to Supabase
    const { data } = await supabase
      .from("message_logs")
      .insert([{
        app_id,
        template_id,
        contact_id,
        type: "sms",
        recipient: to,
        body,
        status: "sent",
      }])
      .select()
      .single();

    logEntry = data;

    return Response.json({ success: true, messageId: message.sid, log: logEntry });
  } catch (error) {
    console.error("Twilio error:", error);

    // Log the failure to Supabase
    await supabase.from("message_logs").insert([{
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