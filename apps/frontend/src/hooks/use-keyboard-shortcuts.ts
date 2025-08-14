import { useCallback } from "react";
import { KEYBOARD_SHORTCUTS } from "../constants/editor";

interface UseKeyboardShortcutsProps {
  onSave: () => void;
  toggleAppFocus: () => void;
  toggleBrowserFullscreen: () => void;
  exitFocusMode: () => void;
  focusMode: string;
}

export const useKeyboardShortcuts = ({
  onSave,
  toggleAppFocus,
  toggleBrowserFullscreen,
  exitFocusMode,
  focusMode,
}: UseKeyboardShortcutsProps) => {
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
      if (e.key === KEYBOARD_SHORTCUTS.ESCAPE && focusMode !== "normal") {
        exitFocusMode();
      }
    },
    [onSave, toggleAppFocus, toggleBrowserFullscreen, exitFocusMode, focusMode]
  );

  return { handleKeyDown };
};
