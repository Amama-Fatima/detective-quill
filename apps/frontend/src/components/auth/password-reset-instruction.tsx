import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { ForgotPasswordFormValues } from "@/lib/schema";

interface PasswordResetInstructionProps {
  userEmail: string;
  setEmailSent: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
  form: UseFormReturn<ForgotPasswordFormValues>;
}

const PasswordResetInstruction = ({
  userEmail,
  setEmailSent,
  setError,
  form,
}: PasswordResetInstructionProps) => {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
        <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="space-y-2">
        <h3 className="noir-text text-xl font-semibold text-gray-900 dark:text-gray-100">
          Check your email
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We've sent a password reset link to{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {userEmail}
          </span>
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
        <h4 className="noir-text text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Next steps:
        </h4>
        <ol className="noir-text text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
          <li>Check your email inbox (and spam folder)</li>
          <li>Click the reset password link in the email</li>
          <li>Create your new password</li>
        </ol>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setEmailSent(false);
            setError("");
            form.reset();
          }}
        >
          Send to different email
        </Button>

        <Button variant="ghost" asChild className="w-full">
          <Link href="/auth/sign-in">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PasswordResetInstruction;
