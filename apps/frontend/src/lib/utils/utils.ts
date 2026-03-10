import { FocusMode } from "@/stores/use-focus-mode-store";
import { clsx, type ClassValue } from "clsx";

import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getContainerClass = (focusMode: FocusMode) =>
  cn(
    "flex flex-col bg-background transition-all duration-300",
    focusMode === "NORMAL" && "h-screen",
    focusMode === "APP" && "fixed inset-0 z-50 h-screen",
    focusMode === "BROWSER" && "h-screen",
  );

const getHeaderClass = (focusMode: FocusMode) =>
  cn(
    "flex items-center justify-between border-b px-4 py-3 bg-card/50 flex-shrink-0 transition-all duration-300",
    focusMode === "BROWSER" && "backdrop-blur-sm",
  );

const requireAccessToken = (accessToken: string) => {
  if (!accessToken) {
    throw new Error("No access token found in session");
  }
  return accessToken;
};

export {
  cn,
  getContainerClass,
  getHeaderClass,
  requireAccessToken,
};
