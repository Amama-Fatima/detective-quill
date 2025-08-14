import { FocusMode } from "@/stores/use-focus-mode-store";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getContainerClass = (focusMode: FocusMode) =>
  cn(
    "flex flex-col bg-background transition-all duration-300",
    focusMode === "NORMAL" && "h-screen",
    focusMode === "APP" && "fixed inset-0 z-50 h-screen",
    focusMode === "BROWSER" && "h-screen"
  );

export const getHeaderClass = (focusMode: FocusMode) =>
  cn(
    "flex items-center justify-between border-b px-4 py-3 bg-card/50 flex-shrink-0 transition-all duration-300",
    focusMode === "BROWSER" && "bg-black/80 backdrop-blur-sm"
  );
