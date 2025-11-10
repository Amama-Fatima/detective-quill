import { SignUpForm } from "@/components/auth/form/sign-up-form";
import { SocialAuth } from "@/components/auth/social-auth";
import { Separator } from "@/components/ui/separator";

export default function SignUpPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h2 className="noir-text text-2xl font-semibold">
                Create your account
              </h2>
              <p className="noir-text text-muted-foreground">
                Get started with your free account today
              </p>
            </div>
            <SignUpForm />
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
              <h2 className="text-xl font-medium">
                Or continue with
              </h2>
              <p className="noir-text text-muted-foreground">
                Choose your preferred sign-up method
              </p>
            </div>
            <SocialAuth mode="signup" />
          </div>
        </div>
      </div>
    </div>
  );
}
