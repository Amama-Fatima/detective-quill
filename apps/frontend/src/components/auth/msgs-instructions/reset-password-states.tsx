"use client";

import { supabaseBrowserClient } from "@/supabase/browser-client";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import React from "react";

export default function ResetFormStates() {
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const searchParams = useSearchParams();

  // Check if user has a valid session for password reset
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabaseBrowserClient.auth.getSession();

        if (error || !session) {
          setIsValidSession(false);
          return;
        }

        // Check if this is a password recovery session
        const isRecovery =
          session.user.aud === "authenticated" &&
          searchParams.get("type") === "recovery";

        setIsValidSession(isRecovery || !!session);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, [searchParams]);
  if (isValidSession === null) {
    return <ResetPasswordLoading />;
  }

  if (isValidSession === false) {
    return <ResetPasswordInvalid />;
  }

  if (success) {
    return <ResetPasswordSuccess />;
  }
}

function ResetPasswordLoading() {
  return (
    <div className="text-center space-y-4 max-w-md mx-auto">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="noir-text text-sm text-gray-600 dark:text-gray-400">
        Verifying reset link...
      </p>
    </div>
  );
}

export function ResetPasswordInvalid() {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      <div className="space-y-2">
        <h3 className="noir-text text-xl font-semibold">
          Invalid or expired link
        </h3>
        <p className="noir-text text-[1rem]">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/auth/forgot-password"
          className="w-full border-primary p-4 rounded-md border text-center font-medium hover:bg-primary/5"
        >
          Request new reset link
        </Link>

        <Link
          href="/auth/sign-in"
          className="w-full border-primary p-4 rounded-md border text-center font-medium hover:bg-primary/5"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export function ResetPasswordSuccess() {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-2">
        <h3 className="noir-text text-xl font-semibold">
          Password updated successfully!
        </h3>
        <p className="noir-text text-[1rem]">
          Your password has been updated. You'll be redirected to sign in
          shortly.
        </p>
      </div>

      <Link
        href="/auth/sign-in"
        className="w-full border-primary p-4 rounded-md border text-center font-medium hover:bg-primary/5"
      >
        Continue to sign in
      </Link>
    </div>
  );
}
