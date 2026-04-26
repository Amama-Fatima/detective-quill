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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeBase64Utf8(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Helper to get session from cookie (client-side)
function getSessionFromCookie(): Session | null {
  try {
    const PROJECT_REF = process.env
      .NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "")
      .split(".")[0];
    const COOKIE_PREFIX = `sb-${PROJECT_REF}-auth-token`;
    const AUTH_COOKIE_REGEX = new RegExp(
      `^${escapeRegExp(COOKIE_PREFIX)}(?:\\.(\\d+))?$`,
    );

    const cookies = document.cookie.split(";");
    const tokenChunks = cookies
      .map((cookie) => {
        const trimmedCookie = cookie.trim();
        const separatorIndex = trimmedCookie.indexOf("=");

        if (separatorIndex === -1) {
          return null;
        }

        const name = trimmedCookie.slice(0, separatorIndex);
        const value = trimmedCookie.slice(separatorIndex + 1);
        const match = name.match(AUTH_COOKIE_REGEX);

        if (!match) {
          return null;
        }

        return {
          index: match[1] ? Number(match[1]) : 0,
          value: decodeURIComponent(value),
        };
      })
      .filter((chunk): chunk is { index: number; value: string } =>
        Boolean(chunk),
      )
      .sort((a, b) => {
        return a.index - b.index;
      })
      .map((chunk) => chunk.value);

    if (tokenChunks.length === 0) return null;

    let cookieValue = tokenChunks.join("");
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }

    if (cookieValue.startsWith("base64-")) {
      const sessionJson = decodeBase64Utf8(cookieValue.substring(7));
      return JSON.parse(sessionJson);
    }

    try {
      return JSON.parse(cookieValue);
    } catch {
      const sessionJson = decodeBase64Utf8(cookieValue);
      return JSON.parse(sessionJson);
    }
  } catch (err) {
    console.error("Error reading session from cookie:", err);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
    const cookieSession = getSessionFromCookie();
    setSession(cookieSession);
    setLoading(false);

    // Only listen for auth changes - NO initial API call
    const {
      data: { subscription },
    } = supabaseBrowserClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
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
