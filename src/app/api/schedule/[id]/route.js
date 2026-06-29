import { supabase } from "@/lib/supabase";
import { validateApiKey } from "@/lib/authMiddleware";

// DELETE — cancel a scheduled message
export async function DELETE(request, { params }) {
  const { error: authError, status: authStatus, app } = await validateApiKey(request);
  if (authError) {
    return Response.json({ error: authError }, { status: authStatus });
  }

  try {
    const { id } = params;

    // Only allow cancelling pending messages belonging to this app
    const { data: existing, error: fetchError } = await supabase
      .from("scheduled_messages")
      .select("*")
      .eq("id", id)
      .eq("app_id", app.id)
      .single();

    if (fetchError || !existing) {
      return Response.json(
        { error: "Scheduled message not found" },
        { status: 404 }
      );
    }

    if (existing.status !== "pending") {
      return Response.json(
        { error: "Only pending messages can be cancelled" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("scheduled_messages")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Schedule DELETE error:", error);
    return Response.json(
      { error: error.message || "Failed to cancel scheduled message" },
      { status: 500 }
    );
  }
}