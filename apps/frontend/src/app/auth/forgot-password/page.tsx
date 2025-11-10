import { ForgotPasswordForm } from "@/components/auth/form/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
