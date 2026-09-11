"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  if (!isSupabaseConfigured) {
    redirect("/");
  }
  const supabase = await createClient();
  await supabase!.auth.signOut();
  redirect("/");
}
