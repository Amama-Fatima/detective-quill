// hooks/use-focus-mode.ts
import { FocusMode, useFocusModeStore } from "@/stores/use-focus-mode-store";
import { useEffect } from "react";

interface UseFocusModeProps {
  onFocusModeChange?: (mode: FocusMode) => void;
}

export const useFocusMode = (props: UseFocusModeProps = {}) => {
  const {
    focusMode,
    isFullscreen,
    setFocusMode,
    setIsFullscreen,
    toggleAppFocus,
    toggleBrowserFullscreen,
    exitFocusMode,
  } = useFocusModeStore();

  const { onFocusModeChange } = props;

  // Call the callback when focus mode changes
  useEffect(() => {
    if (onFocusModeChange) {
      onFocusModeChange(focusMode);
    }
  }, [focusMode, onFocusModeChange]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && focusMode === "BROWSER") {
        setFocusMode("NORMAL");
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [focusMode, setFocusMode, setIsFullscreen]);

  return {
    focusMode,
    isFullscreen,
    toggleAppFocus,
    toggleBrowserFullscreen,
    exitFocusMode,
  };
};
