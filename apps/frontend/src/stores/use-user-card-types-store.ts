import { CardType } from "@detective-quill/shared-types";
import { create } from "zustand";

export const useUserCardTypesStore = create<{
  userTypes: CardType[];
  setUserTypes: (updater: (types: CardType[]) => CardType[]) => void;
}>((set) => ({
  userTypes: [],
  setUserTypes: (updater) =>
    set((state) => ({ userTypes: updater(state.userTypes) })),
}));
