"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function AuthButtons() {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user.email?.split("@")[0]}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center space-x-1 px-3"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="flex items-center space-x-1 px-3"
      >
        <Link href="/auth/sign-in">
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Link>
      </Button>
      <Button size="sm" asChild className="flex items-center space-x-1 px-3">
        <Link href="/auth/sign-up">
          <UserPlus className="h-4 w-4" />
          <span>Sign Up</span>
        </Link>
      </Button>
    </div>
  );
}
