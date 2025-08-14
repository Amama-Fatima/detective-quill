import { useFocusModeStore } from "@/stores/use-focus-mode-store";
import { useCallback } from "react";

const KEYBOARD_SHORTCUTS = {
  SAVE: "s",
  FOCUS_MODE: "k",
  FULLSCREEN: "f",
  ESCAPE: "Escape",
} as const;

interface UseKeyboardShortcutsProps {
  onSave: () => void;
}

export const useKeyboardShortcuts = ({ onSave }: UseKeyboardShortcutsProps) => {
  const { focusMode, toggleAppFocus, toggleBrowserFullscreen, exitFocusMode } =
    useFocusModeStore();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Save shortcut
      if (mod && e.key.toLowerCase() === KEYBOARD_SHORTCUTS.SAVE) {
        e.preventDefault();
        onSave();
        return;
      }

      // Focus mode shortcuts
      if (mod && e.key.toLowerCase() === KEYBOARD_SHORTCUTS.FOCUS_MODE) {
        e.preventDefault();
        toggleAppFocus();
        return;
      }

      // Browser fullscreen shortcut
      if (
        mod &&
        e.shiftKey &&
        e.key.toLowerCase() === KEYBOARD_SHORTCUTS.FULLSCREEN
      ) {
        e.preventDefault();
        toggleBrowserFullscreen();
        return;
      }

      // Escape to exit focus modes
      if (e.key === KEYBOARD_SHORTCUTS.ESCAPE && focusMode !== "NORMAL") {
        exitFocusMode();
      }
    },
    [onSave, toggleAppFocus, toggleBrowserFullscreen, exitFocusMode, focusMode]
  );

  return { handleKeyDown };
};
