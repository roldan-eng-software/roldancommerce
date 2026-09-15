import { createClient } from "@/lib/supabase/client";

function getGoogleAuthErrorMessage(message: string): string {
  if (message.toLowerCase().includes("provider is not enabled")) {
    return "Cadastro com Google indisponível no momento. Tente criar sua conta com e-mail e senha.";
  }

  return message;
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      return { error: getGoogleAuthErrorMessage(error.message) };
    }

    return {};
  } catch {
    return { error: "Erro ao conectar com o Google. Tente novamente." };
  }
}
