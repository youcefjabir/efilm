/**
 * Supabase Auth adapter (AUTH_PROVIDER=supabase).
 * Owner allowlisting still happens server-side in requireOwner(); Supabase only
 * provides the identity. Requires NEXT_PUBLIC_SUPABASE_URL + ANON KEY.
 */
import { cookies } from "next/headers";
import { env } from "./env";

export async function supabaseServerClient() {
  const { createServerClient } = await import("@supabase/ssr");
  const jar = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          try {
            jar.set(name, value, options);
          } catch {
            // called from a Server Component; middleware refresh handles it
          }
        }
      },
    },
  });
}

export async function supabaseUserEmail(): Promise<string | null> {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return null;
  const supabase = await supabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email?.toLowerCase() ?? null;
}

export async function supabaseSendMagicLink(email: string, redirectTo: string) {
  const supabase = await supabaseServerClient();
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
  });
}
