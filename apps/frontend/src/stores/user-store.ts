import { SupabaseJwtPayload } from "@/lib/types/user";
import { create } from "zustand";

interface UserStore {
  user: SupabaseJwtPayload | null;
  setUser: (user: SupabaseJwtPayload | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
