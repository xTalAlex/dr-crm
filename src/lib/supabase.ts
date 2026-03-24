import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!client) {
    const url = import.meta.env.SUPABASE_URL;
    const key = import.meta.env.SUPABASE_SECRET;
    if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET");
    client = createClient(url, key);
  }
  return client;
}

export const BUCKET = "crm-storage";
