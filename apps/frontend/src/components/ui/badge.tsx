import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";

const badgeVariants = cva(
  // Base: sharp corners, mono font, uppercase — stamped label feel
  "inline-flex items-center justify-center rounded-none border px-2.5 py-0.5 text-xs font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive transition-colors overflow-hidden tracking-[0.16em] uppercase font-mono",
  {
    variants: {
      variant: {
        // Solid primary — authority stamp (Author, Active)
        default:
          "border-primary bg-primary text-primary-foreground [a&]:hover:bg-primary/85",

        // Hollow — typewritten field label (Beta Reader, Pending)
        secondary:
          "border-muted-foreground/50 bg-transparent text-secondary-foreground [a&]:hover:border-foreground/70 [a&]:hover:text-foreground",

        // Destructive — red ink (Revoked, Closed, Suspect)
        destructive:
          "border-destructive bg-transparent text-destructive [a&]:hover:bg-destructive/10",

        // Outline — faded ghost stamp (Unverified, Unknown)
        outline:
          "border-dashed border-border bg-transparent text-muted-foreground [a&]:hover:border-muted-foreground [a&]:hover:text-foreground",
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
