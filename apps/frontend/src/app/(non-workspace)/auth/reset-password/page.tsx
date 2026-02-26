import { ResetPasswordForm } from "@/components/auth/form/reset-password-form";

export const metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
