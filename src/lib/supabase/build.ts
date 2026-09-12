import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function createBuildClient() {
  if (!supabaseUrl.startsWith("http") || supabaseKey.length < 10) {
    return null;
  }
  return createSupabaseClient(supabaseUrl, supabaseKey);
}
