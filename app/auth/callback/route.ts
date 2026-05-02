import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * Google OAuth callback.
 *
 * After exchanging the code for a session, we look up the user's
 * profile to decide where to send them:
 *   - is_superadmin = true   -> /admin (or whatever ?next= was)
 *   - otherwise              -> /unauthorized
 *
 * This makes sure that even if a non-superadmin somehow signs in, they
 * never land on an admin page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_superadmin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_superadmin) {
    return NextResponse.redirect(`${origin}/unauthorized`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
