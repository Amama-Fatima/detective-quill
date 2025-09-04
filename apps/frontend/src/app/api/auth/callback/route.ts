import { createSupabaseServerClient } from "@/supabase/server-client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard"; // Default to dashboard instead of root

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if this is a new user or if username doesn't exist in user metadata
      if (!data.user.user_metadata?.username && data.user.email) {
        try {
          // Extract username from email (before @)
          const emailUsername = data.user.email.split("@")[0];

          // Update user metadata with pen name
          await supabase.auth.updateUser({
            data: {
              username: emailUsername,
            },
          });

          console.log(
            `Set pen name "${emailUsername}" for user ${data.user.id}`
          );
        } catch (updateError) {
          console.error("Error setting pen name:", updateError);
          // Don't fail the auth flow if pen name update fails
        }
      }

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
