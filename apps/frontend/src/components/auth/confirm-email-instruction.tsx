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
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-2">
        <h3 className="noir-text text-xl font-semibold">Check your email</h3>
        <p className="noir-text text-sm">
          We've sent a confirmation link to{" "}
          <span className="font-medium text-gray-900">{userEmail}</span>
        </p>
      </div>

      <div className="noir-text bg-card border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
        <h4 className="noir-text text-sm font-medium  text-primary mb-2">
          Next steps:
        </h4>
        <ol className="noir-text text-sm  text-primary space-y-1 list-decimal list-inside">
          <li>Check your email inbox (and spam folder)</li>
          <li>Click the confirmation link in the email</li>
          <li>You'll be redirected back to sign in</li>
        </ol>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          onClick={() => {
            setSignupSuccess(false);
            setError("");
            form.reset();
          }}
        >
          Sign up with different email
        </Button>
      </div>
    </div>
  );
};

export default ConfirmEmailInstruction;
