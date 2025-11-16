"use client";

import { Button } from "@/components/ui/button";
import { supabaseBrowserClient } from "@/supabase/browser-client";
import { Chrome } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface SocialAuthProps {
  mode: "signin" | "signup";
  props?: { nextUrl?: string };
}

export function SocialAuth({ mode, props }: SocialAuthProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") ?? "/";
  const finalNext = props?.nextUrl || redirectTo;

  const handleGoogleAuth = async () => {
    try {
      await supabaseBrowserClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${
            location.origin
          }/api/auth/callback?next=${encodeURIComponent(finalNext)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      //       // Redirect manually after successful sign-in
      // window.location.assign(`${window.location.origin}${redirectTo}`);
    } catch (error) {
      console.error("Error during Google auth:", error);
    }
  };

  const actionText = mode === "signin" ? "Sign in" : "Sign up";

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={handleGoogleAuth}
        className="w-full flex items-center cursor-pointer justify-center gap-3 h-12 border-slate-800 hover:border-slate-500 transition-colors"
      >
        <Chrome className="h-5 w-5 text-muted-foreground" />
        {actionText} with Google
      </Button>
    </div>
  );
}
