import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-900",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover",
        outline:
          "border border-border bg-card hover:bg-muted/70 hover:text-foreground text-foreground shadow-xs",
        ghost:
          "hover:bg-muted hover:text-foreground text-muted-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        amber:
          "bg-amber-500 text-white shadow-sm hover:bg-amber-600 focus-visible:ring-amber-500",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        default: "min-h-[44px] px-5 py-2.5",
        sm: "min-h-[36px] rounded-lg px-3.5 text-xs",
        lg: "min-h-[48px] rounded-2xl px-7 text-base font-bold",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
