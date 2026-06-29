import { supabase } from "@/lib/supabase";
import { validateApiKey } from "@/lib/authMiddleware";

// GET — fetch scheduled messages
export async function GET(request) {
  const { error: authError, status: authStatus, app } = await validateApiKey(request);
  if (authError) {
    return Response.json({ error: authError }, { status: authStatus });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const { data, error } = await supabase
      .from("scheduled_messages")
      .select("*, templates(name, type), contacts(name, email, phone)")
      .eq("app_id", app.id)
      .eq("status", status)
      .order("send_at", { ascending: true });

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("Schedule GET error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch scheduled messages" },
      { status: 500 }
    );
  }
}

// POST — schedule a message for future delivery
export async function POST(request) {
  const { error: authError, status: authStatus, app } = await validateApiKey(request);
  if (authError) {
    return Response.json({ error: authError }, { status: authStatus });
  }

  try {
    const { template_id, contact_id, variables, send_at } = await request.json();

    if (!template_id || !contact_id || !send_at) {
      return Response.json(
        { error: "Missing required fields: template_id, contact_id, send_at" },
        { status: 400 }
      );
    }

    // Validate send_at is in the future
    if (new Date(send_at) <= new Date()) {
      return Response.json(
        { error: "send_at must be a future date and time" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("scheduled_messages")
      .insert([{
        app_id: app.id,
        template_id,
        contact_id,
        variables: variables || {},
        send_at,
        status: "pending",
      }])
      .select()
      .single();

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("Schedule POST error:", error);
    return Response.json(
      { error: error.message || "Failed to schedule message" },
      { status: 500 }
    );
  }
}