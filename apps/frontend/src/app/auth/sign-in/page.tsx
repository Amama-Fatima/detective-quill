import { SignInForm } from "@/components/auth/form/sign-in-form";
import { SocialAuth } from "@/components/auth/social-auth";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white">
                Welcome back
              </h1>
              <p className="text-slate-400">
                Sign in to your account to continue
              </p>
            </div>
            <SignInForm />
          </div>

          {/* Separator */}
          <div className="flex justify-center">
            <Separator
              orientation="vertical"
              className="hidden lg:block h-auto bg-slate-700"
            />
            <Separator
              orientation="horizontal"
              className="lg:hidden bg-slate-700"
            />
          </div>

          {/* Right Column - Social Auth */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-white">
                Or continue with
              </h2>
              <p className="text-slate-400">
                Choose your preferred sign-in method
              </p>
            </div>
            <SocialAuth mode="signin" />
          </div>
        </div>
      </div>
    </div>
  );
}
