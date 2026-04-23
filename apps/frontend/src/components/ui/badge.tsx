import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

const badgeVariants = cva(
  // Base: no rounding, monospace, tight uppercase tracking — stamped label feel
  "inline-flex items-center justify-center rounded-none border px-2 py-0.5 text-[10px] font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive transition-colors overflow-hidden tracking-[0.18em] uppercase font-mono",
  {
    variants: {
      variant: {
        // Solid dark — official stamp, authority mark (Author, Active, …)
        default:
          "border-foreground bg-foreground text-background [a&]:hover:bg-foreground/85 [a&]:hover:border-foreground/85",

        // Hollow with border — typewritten field label (Beta Reader, Pending, …)
        secondary:
          "border-foreground/40 bg-transparent text-foreground/70 [a&]:hover:border-foreground/60 [a&]:hover:text-foreground",

        // Red ink — something went wrong or must be noticed (Revoked, Closed, …)
        destructive:
          "border-[#8B1A1A] bg-transparent text-[#8B1A1A] dark:border-[#c97070] dark:text-[#c97070] [a&]:hover:bg-[#8B1A1A]/10",

        // Dashed faint border — faded, unconfirmed, ghost stamp (Unverified, …)
        outline:
          "border-dashed border-foreground/25 bg-transparent text-foreground/45 [a&]:hover:border-foreground/40 [a&]:hover:text-foreground/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
