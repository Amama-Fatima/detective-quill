"use client";

import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

interface SocialAuthProps {
  mode: "signin" | "signup";
}

export function SocialAuth({ mode }: SocialAuthProps) {
  const handleGoogleAuth = () => {
    // Implement Google OAuth logic here
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
