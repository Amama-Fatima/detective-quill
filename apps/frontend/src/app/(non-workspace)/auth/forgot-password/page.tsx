import { ForgotPasswordForm } from "@/components/auth/form/forgot-password-form";
import { Suspense } from "react";

export const metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <Suspense
          fallback={
            <div className="text-center text-sm text-muted-foreground">
              Loading forgot password form...
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
