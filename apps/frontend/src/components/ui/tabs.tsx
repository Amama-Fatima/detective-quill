"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-0", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // Sharp outer frame — no rounding, no pill
        "inline-flex w-fit items-stretch",
        "border border-border bg-muted/40",
        "p-0 h-auto",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base — monospace, uppercase, no rounding
        "relative inline-flex items-center justify-center gap-1.5",
        "font-mono text-xs font-bold tracking-[0.14em] uppercase",
        "px-5 py-2.5 h-auto",
        "border-r border-border last:border-r-0",
        "bg-transparent text-muted-foreground",
        "whitespace-nowrap transition-colors duration-100",
        "select-none outline-none",
        // Hover
        "hover:bg-background hover:text-foreground",
        // Active state — solid top bar accent, background lift
        "data-[state=active]:bg-background",
        "data-[state=active]:text-foreground",
        // The 2px primary top-bar — inset shadow so it doesn't add height
        "data-[state=active]:shadow-[inset_0_2px_0_0_hsl(var(--primary))]",
        // Focus ring
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40",
        // SVG icons inside
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
