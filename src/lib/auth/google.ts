import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch {
    return { error: "Erro ao conectar com o Google. Tente novamente." };
  }
}
