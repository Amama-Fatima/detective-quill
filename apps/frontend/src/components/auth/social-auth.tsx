"use client";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/supabase/browser-client";
import { Chrome } from "lucide-react";

interface SocialAuthProps {
  mode: "signin" | "signup";
  props?: { nextUrl?: string };
}

export function SocialAuth({ mode, props }: SocialAuthProps) {
  const handleGoogleAuth = async () => {
    try {
      const supabaseBrowserClient = createSupabaseBrowserClient();
      await supabaseBrowserClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/api/auth/callback?next=${
            props?.nextUrl || ""
          }`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
    } catch (error) {
      console.error("Error during Google auth:", error);
    }
    console.log("Google auth clicked");
  };

  const actionText = mode === "signin" ? "Sign in" : "Sign up";

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center gap-3 h-12 text-white border-slate-600 hover:border-slate-500 transition-colors"
      >
        <Chrome className="h-5 w-5" />
        {actionText} with Google
      </Button>
    </div>
  );
}
