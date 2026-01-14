'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabaseBrowserClient } from '@/supabase/browser-client'; 
import { toast } from 'sonner';
import { redirect } from 'next/navigation';

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabaseBrowserClient.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        toast.error('Failed to get session');
        setSession(null);
        return;
      }
      setSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Failed to get session');
      setSession(null);
    }
  };

  const signOut = async () => {
    try {
      await supabaseBrowserClient.auth.signOut();
      setSession(null);
      window.location.href = '/'; // Redirect to home page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out', );
    }
  };

  useEffect(() => {
    // Get initial session
    refreshSession().finally(() => setLoading(false));

    // Listen for auth changes
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

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hook for getting authenticated session
export function useAuthSession() {
  const { session, loading } = useAuth();
  return { session, loading, isAuthenticated: !!session };
}