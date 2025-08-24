"use client";

import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

const ConfirmationMessages = () => {
  const searchParams = useSearchParams();
  const [confirmationStatus, setConfirmationStatus] = useState<
    "success" | "error" | "server_error" | null
  >(null);

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error === "confirmation_failed") {
      setConfirmationStatus("error");
    } else if (error === "server_error") {
      setConfirmationStatus("server_error");
    } else if (message === "confirmed") {
      setConfirmationStatus("success");
    }

    // Clear URL parameters after showing message
    if (error || message) {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      url.searchParams.delete("message");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return (
    <div className="space-y-4">
      {/* Confirmation Status Messages */}
      {confirmationStatus === "success" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Email confirmed successfully! You can now sign in to your account.
          </AlertDescription>
        </Alert>
      )}

      {confirmationStatus === "error" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Email confirmation failed. The link may be expired or invalid.
            Please try signing up again or contact support.
          </AlertDescription>
        </Alert>
      )}

      {confirmationStatus === "server_error" && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            A server error occurred during confirmation. Please try again later.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConfirmationMessages;
