"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";

export default function LandingNavAuth() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <div className="h-9 w-32 animate-pulse rounded-md bg-foreground/10" />;
  }

  if (user) {
    return (
      <Link
        href="/projects"
        className="
          bg-foreground
          text-secondary
          border-0
          rounded-md
          px-8 py-2
          cursor-pointer
          noir-text
          text-[1rem]
          tracking-[0.02em]
          transition-all duration-200
          hover:-translate-y-[1px]
        "
      >
        Begin Writing
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/auth/sign-in"
        className="
          rounded-md
          border border-secondary-foreground/40
          px-4 py-2 sm:px-6
          noir-text
          text-[0.95rem] sm:text-[1rem]
          text-secondary-foreground
          transition-all duration-200
          hover:bg-secondary-foreground/10
        "
      >
        Sign In
      </Link>
      <Link
        href="/auth/sign-up"
        className="
          bg-foreground
          text-secondary
          border-0
          rounded-md
          px-4 py-2 sm:px-6
          cursor-pointer
          noir-text
          text-[0.95rem] sm:text-[1rem]
          tracking-[0.02em]
          transition-all duration-200
          hover:-translate-y-[1px]
        "
      >
        Sign Up
      </Link>
    </div>
  );
}
