"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { supabaseBrowserClient } from "@/supabase/browser-client";
import { ResetPasswordFormValues, resetPasswordSchema } from "@/lib/schema";
import { getPasswordStrength } from "@/lib/utils/auth-utils";
import ResetFormStates from "../msgs-instructions/reset-password-states";

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabaseBrowserClient.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/sign-in?message=password_updated");
      }, 2000);
    } catch (error: any) {
      console.error("Error updating password:", error);
      setError(error.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ResetFormStates />
      <div className="space-y-6 max-w-md mx-auto">
        <div className="text-center space-y-2">
          <h1 className="mystery-title text-2xl font-bold">
            Create new password
          </h1>
          <p className="text-[1rem] noir-text">
            Enter your new password below.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="text-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[1rem] font-medium">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a new password"
                        className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-700"
                        {...field}
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute cursor-pointer right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{
                              width: `${
                                (passwordStrength.strength / 3) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[3rem]">
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[1rem] font-medium">
                    Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        className="pl-10 pr-10 h-11 border-slate-200 dark:border-slate-700"
                        {...field}
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent cursor-pointer"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 bg-primary shadow-lg hover:bg-primary/90 cursor-pointer transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
