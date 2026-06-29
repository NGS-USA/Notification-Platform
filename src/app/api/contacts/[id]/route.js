import { supabase } from "@/lib/supabase";

// GET — fetch a single contact
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from("contacts")
      .select("*, message_logs(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("Contact GET error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

// PUT — update a contact
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, phone, email, metadata } = body;

    const { data, error } = await supabase
      .from("contacts")
      .update({ name, phone, email, metadata })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("Contact PUT error:", error);
    return Response.json(
      { error: error.message || "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE — delete a contact
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact DELETE error:", error);
    return Response.json(
      { error: error.message || "Failed to delete contact" },
      { status: 500 }
    );
  }
}