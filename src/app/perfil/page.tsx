import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import ProfileContent from "./_components/profile-content";

export default async function ProfilePage() {
  if (!isSupabaseConfigured) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <Suspense>
      <ProfileContent userId={user.id} />
    </Suspense>
  );
}
