"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { SignUpFormValues, signUpSchema } from "@/lib/schema";
import { supabaseBrowserClient } from "@/supabase/browser-client";
import { getPasswordStrength } from "@/lib/utils/auth-utils";
import ConfirmEmailInstruction from "../msgs-instructions/confirm-email-instruction";
import { toast } from "sonner";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (formData: SignUpFormValues) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            avatar_url: "",
            username: formData.email.split("@")[0],
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        console.error("Supabase auth error:", error);
        toast.error(error.message || "Failed to create account");
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user && !data.session) {
          setUserEmail(formData.email);
          setSignupSuccess(true);
        } else {
          // User is immediately authenticated (email confirmation disabled)
        }
      }
    } catch (err) {
      console.error("Error during sign up:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return <ConfirmEmailInstruction userEmail={userEmail} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-md font-medium">Full Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 h-11 border-slate-200"
                    {...field}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                Email
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-11 border-slate-200 dark:border-slate-700"
                    {...field}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-700">
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10 h-11 border-slate-200"
                    {...field}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-secondary-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-secondary-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.strength / 3) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 min-w-[3rem]">
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
              <FormLabel className="text-sm font-medium text-slate-700">
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 h-11 border-slate-200"
                    {...field}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-secondary-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-secondary-foreground" />
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
          className="w-full h-11 hover:cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </Form>
  );
}
