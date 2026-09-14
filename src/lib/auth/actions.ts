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

export async function isProfileComplete(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase!
    .from("profiles")
    .select("cpf, cep")
    .eq("id", user.id)
    .single();

  return !!(profile?.cpf && profile?.cep);
}
