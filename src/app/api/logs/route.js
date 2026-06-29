import { supabase } from "@/lib/supabase";

// GET — fetch message logs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const app_id = searchParams.get("app_id");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") || 50;

    let query = supabase
      .from("message_logs")
      .select("*, templates(name)")
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (app_id) query = query.eq("app_id", app_id);
    if (type) query = query.eq("type", type);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("Logs GET error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

// POST — create a new log entry
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      app_id,
      template_id,
      contact_id,
      type,
      recipient,
      subject,
      body: messageBody,
      status,
      error: errorMessage,
    } = body;

    if (!type || !recipient || !messageBody) {
      return Response.json(
        { error: "Missing required fields: type, recipient, body" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("message_logs")
      .insert([{
        app_id,
        template_id,
        contact_id,
        type,
        recipient,
        subject,
        body: messageBody,
        status: status || "sent",
        error: errorMessage,
      }])
      .select()
      .single();

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("Logs POST error:", error);
    return Response.json(
      { error: error.message || "Failed to create log entry" },
      { status: 500 }
    );
  }
}