import { FOCUS_MODES } from "@/constants/editor";
import { useState, useEffect } from "react";

export type FocusMode = keyof typeof FOCUS_MODES;

interface UseFocusModeProps {
  onFocusModeChange?: (mode: FocusMode) => void;
}

export const useFocusMode = ({ onFocusModeChange }: UseFocusModeProps = {}) => {
  const [focusMode, setFocusMode] = useState<FocusMode>("NORMAL");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleAppFocus = () => {
    const newMode = focusMode === "APP" ? "NORMAL" : "APP";
    setFocusMode(newMode);
    onFocusModeChange?.(newMode);
  };

  const toggleBrowserFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFocusMode("BROWSER");
        setIsFullscreen(true);
        onFocusModeChange?.("BROWSER");
      } else {
        await document.exitFullscreen();
        setFocusMode("NORMAL");
        setIsFullscreen(false);
        onFocusModeChange?.("NORMAL");
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const exitFocusMode = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setFocusMode("NORMAL");
    setIsFullscreen(false);
    onFocusModeChange?.("NORMAL");
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && focusMode === "BROWSER") {
        setFocusMode("NORMAL");
        setIsFullscreen(false);
        onFocusModeChange?.("NORMAL");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [focusMode, onFocusModeChange]);

  return {
    focusMode,
    isFullscreen,
    toggleAppFocus,
    toggleBrowserFullscreen,
    exitFocusMode,
  };
};
