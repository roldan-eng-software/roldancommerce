"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setAdminRole() {
  const supabase = await createClient();
  if (!supabase) redirect("/");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase.auth.updateUser({
    data: { role: "admin" },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  return (
    user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin"
  );
}
