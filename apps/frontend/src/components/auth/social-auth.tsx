"use client";

import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
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
    </div>
  );
}
