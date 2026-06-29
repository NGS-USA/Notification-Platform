import { supabase } from "./supabase";

export async function validateApiKey(request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401, app: null };
  }

  const apiKey = authHeader.replace("Bearer ", "").trim();

  const { data: app, error } = await supabase
    .from("apps")
    .select("id, name")
    .eq("api_key", apiKey)
    .single();

  if (error || !app) {
    return { error: "Invalid API key", status: 401, app: null };
  }

  return { error: null, status: 200, app };
}