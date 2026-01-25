"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabaseBrowserClient } from "@/supabase/browser-client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Helper to get session from cookie (client-side)
function getSessionFromCookie(): Session | null {
  try {
    const PROJECT_REF = process.env
      .NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "")
      .split(".")[0];
    const COOKIE_PREFIX = `sb-${PROJECT_REF}-auth-token`;

    const cookies = document.cookie.split(";");
    const tokenChunks = cookies
      .filter((c) => c.trim().startsWith(COOKIE_PREFIX))
      .sort((a, b) => {
        const aIndex = Number(a.split("=")[0].split(".").pop());
        const bIndex = Number(b.split("=")[0].split(".").pop());
        return aIndex - bIndex;
      })
      .map((c) => c.split("=")[1]);

    if (tokenChunks.length === 0) return null;

    let cookieValue = tokenChunks.join("");

    if (cookieValue.startsWith("base64-")) {
      cookieValue = cookieValue.substring(7);
    }

    const sessionJson = atob(cookieValue);
    return JSON.parse(sessionJson);
  } catch (err) {
    console.error("Error reading session from cookie:", err);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize from cookie immediately - NO network call!
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window !== "undefined") {
      const cookieSession = getSessionFromCookie();
      console.log("✅ Auth initialized from cookie (no API call)");
      return cookieSession;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseBrowserClient.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        toast.error("Failed to get session");
        setSession(null);
        return;
      }
      setSession(data.session);
    } catch (error) {
      console.error("Error fetching session:", error);
      toast.error("Failed to get session");
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabaseBrowserClient.auth.signOut();
      setSession(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  useEffect(() => {
    // Only listen for auth changes - NO initial API call
    const {
      data: { subscription },
    } = supabaseBrowserClient.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed:", _event);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    loading,
    signOut,
    refreshSession,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthSession() {
  const { session, loading } = useAuth();
  return { session, loading, isAuthenticated: !!session };
}
