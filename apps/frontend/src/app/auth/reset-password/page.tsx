import { ResetPasswordForm } from "@/components/auth/form/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
