import { supabase } from "@/lib/supabase";
import { randomBytes } from "crypto";

// GET — fetch all registered apps
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("apps")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json({ data });
  } catch (error) {
    console.error("Apps GET error:", error);
    return Response.json(
      { error: error.message || "Failed to fetch apps" },
      { status: 500 }
    );
  }
}

// POST — register a new app and generate an API key
export async function POST(request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return Response.json(
        { error: "App name is required" },
        { status: 400 }
      );
    }

    // Generate a secure API key
    const apiKey = `nfy_${randomBytes(32).toString("hex")}`;

    const { data, error } = await supabase
      .from("apps")
      .insert([{ name, api_key: apiKey }])
      .select()
      .single();

    if (error) throw error;

    // Return the full key only once on creation
    return Response.json({ data });
  } catch (error) {
    console.error("Apps POST error:", error);
    return Response.json(
      { error: error.message || "Failed to register app" },
      { status: 500 }
    );
  }
}