import { supabase } from "@/lib/supabase";

/**
 * Current user for client-side pages without calling GET /auth/v1/user.
 * getSession() loads from cookie storage and refreshes only when the access token is near expiry.
 */
export async function getSessionUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.user?.id) {
    return null;
  }
  return session.user;
}
