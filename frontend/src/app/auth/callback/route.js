import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Apply Supabase auth cookie writes to the redirect response (required for OAuth; cookies() + redirect alone can drop Set-Cookie on Vercel). */
function applyCookies(response, mutations) {
  for (const { name, value, options } of mutations) {
    response.cookies.set(name, value, options);
  }
}

/**
 * OAuth callback: exchange code using request cookies and attach session cookies
 * to the same NextResponse we return (buffer pattern from Supabase SSR docs).
 */
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const { searchParams, origin } = requestUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";
  const nextPath = next.startsWith("/") ? next : "/dashboard";

  const cookieMutations = [];

  const supabaseOAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookieMutations.push(...cookiesToSet);
        },
      },
    }
  );

  let redirectPath = nextPath;

  if (code) {
    const { error: exchangeError } =
      await supabaseOAuth.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      const res = NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Unable to sign in. Please try again.")}`,
          origin
        )
      );
      applyCookies(res, cookieMutations);
      return res;
    }

    const {
      data: { user },
    } = await supabaseOAuth.auth.getUser();

    if (user) {
      const { data: profile, error: profileError } = await supabaseOAuth
        .from("profiles")
        .select("id,onboarded")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        const res = NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent(
              "Unable to load your profile. Please try again."
            )}`,
            origin
          )
        );
        applyCookies(res, cookieMutations);
        return res;
      }
      if (!profile?.onboarded) {
        redirectPath = "/onboarding";
      }
    }
  }

  const res = NextResponse.redirect(new URL(redirectPath, origin));
  applyCookies(res, cookieMutations);
  return res;
}
