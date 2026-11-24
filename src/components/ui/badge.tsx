import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-transparent bg-secondary/15 text-secondary hover:bg-secondary/25",
        destructive:
          "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
        outline:
          "border border-border text-foreground bg-card",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 border border-emerald-200/60",
        warning:
          "border-transparent bg-amber-50 text-amber-800 border border-amber-200/60",
        info:
          "border-transparent bg-sky-50 text-sky-700 border border-sky-200/60",
        neutral:
          "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
