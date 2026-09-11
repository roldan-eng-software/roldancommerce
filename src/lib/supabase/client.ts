import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url.startsWith("http") || key.length < 10) {
    return new Proxy({} as ReturnType<typeof createBrowserClient>, {
      get(_, prop) {
        if (prop === "then") return undefined;
        return () => ({ data: { user: null }, error: null });
      },
    });
  }

  client = createBrowserClient(url, key);
  return client;
}
