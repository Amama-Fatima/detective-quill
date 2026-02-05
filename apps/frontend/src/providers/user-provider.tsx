"use client";

import { SupabaseJwtPayload } from "@/lib/types/user";
import { useUserStore } from "@/stores/user-store";
import { useEffect } from "react";

interface UserProviderProps {
  user: SupabaseJwtPayload | null;
  children: React.ReactNode;
}

export function UserProvider({ user, children }: UserProviderProps) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return <>{children}</>;
}
