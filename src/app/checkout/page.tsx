import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import CheckoutContent from "./_components/checkout-content";

export default async function CheckoutPage() {
  if (!isSupabaseConfigured) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/checkout");
  }

  const { data: profile } = await supabase!
    .from("profiles")
    .select("cpf, cep")
    .eq("id", user.id)
    .single();

  if (!profile?.cpf || !profile?.cep) {
    redirect("/perfil?next=/checkout");
  }

  return <CheckoutContent />;
}
