"use client";

import { useLayoutEffect } from "react";

import { supabase } from "@/lib/supabase";

/**
 * If the browser has a stale Supabase session (wrong project / expired JWT) but
 * the server cookies are not logged in, the Auth client will call GET /auth/v1/user
 * and get 401. Clear the client session to match the server and stop repeat calls.
 */
export function AuthCookieSync() {
  useLayoutEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/bootstrap", {
          credentials: "same-origin",
        });
        if (cancelled || r.status !== 401) return;
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
