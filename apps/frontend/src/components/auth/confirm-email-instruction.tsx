import { CheckCircle, Link } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { UseFormReturn } from "react-hook-form";
import { SignUpFormValues } from "@/lib/schema";

interface ConfirmEmailInstructionProps {
  userEmail: string;
  setSignupSuccess: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
  form: UseFormReturn<SignUpFormValues>;
}

const ConfirmEmailInstruction = ({
  userEmail,
  setSignupSuccess,
  setError,
  form,
}: ConfirmEmailInstructionProps) => {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Check your email
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We've sent a confirmation link to{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {userEmail}
          </span>
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Next steps:
        </h4>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
          <li>Check your email inbox (and spam folder)</li>
          <li>Click the confirmation link in the email</li>
          <li>You'll be redirected back to sign in</li>
        </ol>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setSignupSuccess(false);
            setError("");
            form.reset();
          }}
        >
          Sign up with different email
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ConfirmEmailInstruction;
