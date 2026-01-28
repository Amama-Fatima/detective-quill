import { supabaseBrowserClient } from "@/supabase/browser-client";

export const handleGoogleAuth = async (finalNext: string) => {
  try {
    await supabaseBrowserClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${
          location.origin
        }/api/auth/callback?next=${encodeURIComponent(finalNext)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  } catch (error) {
    console.error("Error during Google auth:", error);
  }
};


export const getPasswordStrength = (password: string) => {
  if (password.length === 0) return { strength: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score < 2) return { strength: 1, label: "Weak", color: "bg-red-500" };
  if (score < 4) return { strength: 2, label: "Fair", color: "bg-yellow-500" };
  return { strength: 3, label: "Strong", color: "bg-green-500" };
};
