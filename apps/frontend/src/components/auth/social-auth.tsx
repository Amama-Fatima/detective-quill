"use client";

import { Button } from "@/components/ui/button";
import { Chrome, ShieldAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { handleGoogleAuth } from "@/lib/utils/auth-utils";

interface SocialAuthProps {
  mode: "signin" | "signup";
  props?: { nextUrl?: string };
}

export function SocialAuth({ mode, props }: SocialAuthProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") ?? "/";
  const finalNext = props?.nextUrl || redirectTo;

  const actionText = mode === "signin" ? "Sign in" : "Sign up";

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={() => handleGoogleAuth(finalNext)}
        className="w-full flex items-center cursor-pointer justify-center gap-3 h-12 border-slate-800 hover:border-slate-500 transition-colors"
      >
        <Chrome className="h-5 w-5 text-muted-foreground" />
        {actionText} with Google
      </Button>

      <div className="rounded-md border border-border bg-accent/50 px-3 py-2.5">
        <div className="flex items-start gap-2 mb-2">
          <ShieldAlert className="h-5 w-5 mt-1.5 flex-shrink-0 text-primary" />
          <div>
            <p className="noir-text text-md text-muted-foreground leading-relaxed">
              Google OAuth does not work on the deployed site unless you are a
              registered test user. The app is pending Google verification.
            </p>
            <p className="noir-text text-md text-muted-foreground leading-relaxed mt-4">
              {" "}
              Please use email & password to sign up or sign in. You can also
              use fake emails like{" "}
              <code className="text-primary text-sm">test123@gmail.com</code> to
              sign up and test the app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
