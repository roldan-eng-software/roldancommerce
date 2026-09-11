import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import ProfileForm from "@/components/auth/profile-form";

export default async function ProfilePage() {
  if (!isSupabaseConfigured) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase!.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">Complete seu cadastro</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Informe endereço e CPF para finalizar compras.
      </p>
      <div className="mt-6">
        <ProfileForm userId={user.id} />
      </div>
    </main>
  );
}
