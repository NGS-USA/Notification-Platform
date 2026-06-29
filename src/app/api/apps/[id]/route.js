import { supabase } from "@/lib/supabase";
import { randomBytes } from "crypto";

// DELETE — remove a registered app
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from("apps")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("App DELETE error:", error);
    return Response.json(
      { error: error.message || "Failed to delete app" },
      { status: 500 }
    );
  }
}

// PATCH — regenerate API key for an app
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    const newApiKey = `nfy_${randomBytes(32).toString("hex")}`;

    const { data, error } = await supabase
      .from("apps")
      .update({ api_key: newApiKey })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("App PATCH error:", error);
    return Response.json(
      { error: error.message || "Failed to regenerate API key" },
      { status: 500 }
    );
  }
}