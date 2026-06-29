import { supabase } from "@/lib/supabase";

// GET — fetch contacts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const app_id = searchParams.get("app_id");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") || 50;

    let query = supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (app_id) query = query.eq("app_id", app_id);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("Contacts GET error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST — create or update a contact
export async function POST(request) {
  try {
    const body = await request.json();
    const { app_id, name, phone, email, metadata } = body;

    if (!phone && !email) {
      return Response.json(
        { error: "Contact must have at least a phone number or email address" },
        { status: 400 }
      );
    }

    // Check if contact already exists for this app
    let existing = null;
    if (email) {
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .eq("app_id", app_id)
        .eq("email", email)
        .single();
      existing = data;
    } else if (phone) {
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .eq("app_id", app_id)
        .eq("phone", phone)
        .single();
      existing = data;
    }

    if (existing) {
      // Update existing contact
      const { data, error } = await supabase
        .from("contacts")
        .update({ name, phone, email, metadata })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return Response.json({ data, updated: true });
    }

    // Create new contact
    const { data, error } = await supabase
      .from("contacts")
      .insert([{ app_id, name, phone, email, metadata }])
      .select()
      .single();

    if (error) throw error;

    return Response.json({ data, updated: false });
  } catch (error) {
    console.error("Contacts POST error:", error);
    return Response.json(
      { error: error.message || "Failed to create contact" },
      { status: 500 }
    );
  }
}