import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getContainerClass = (focusMode: string) =>
  cn(
    "flex flex-col bg-background transition-all duration-300",
    focusMode === "normal" && "h-screen",
    focusMode === "app" && "fixed inset-0 z-50 h-screen",
    focusMode === "browser" && "h-screen"
  );

export const getHeaderClass = (focusMode: string) =>
  cn(
    "flex items-center justify-between border-b px-4 py-3 bg-card/50 flex-shrink-0 transition-all duration-300",
    focusMode === "browser" && "bg-black/80 backdrop-blur-sm"
  );
