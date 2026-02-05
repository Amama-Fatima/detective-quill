import { create } from "zustand";

export type FocusMode = "NORMAL" | "APP" | "BROWSER";

interface FocusModeState {
  focusMode: FocusMode;
  isFullscreen: boolean;

  // Actions
  setFocusMode: (mode: FocusMode) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  toggleAppFocus: () => void;
  toggleBrowserFullscreen: () => Promise<void>;
  exitFocusMode: () => Promise<void>;
}

export const useFocusModeStore = create<FocusModeState>((set, get) => ({
  focusMode: "NORMAL",
  isFullscreen: false,

  setFocusMode: (mode) => set({ focusMode: mode }),

  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),

  toggleAppFocus: () => {
    const { focusMode } = get();
    const newMode = focusMode === "APP" ? "NORMAL" : "APP";
    set({ focusMode: newMode });
  },

  toggleBrowserFullscreen: async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        set({ focusMode: "BROWSER", isFullscreen: true });
      } else {
        await document.exitFullscreen();
        set({ focusMode: "NORMAL", isFullscreen: false });
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  },

  exitFocusMode: async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    set({ focusMode: "NORMAL", isFullscreen: false });
  },
}));
