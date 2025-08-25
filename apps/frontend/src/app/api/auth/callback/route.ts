import { createSupabaseServerClient } from "@/supabase/server-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard"; // Default to dashboard instead of root

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success - redirect to the next URL or dashboard
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error("Error exchanging code for session:", error);
      // Redirect to login with error for email confirmations
      return NextResponse.redirect(
        `${origin}/auth/sign-in?error=confirmation_failed`
      );
    }
  }

  // No code provided - redirect to auth error page
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
