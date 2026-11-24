import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full text-right">
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          aria-invalid={!!error}
          className={cn(
            "flex h-11 min-h-[44px] w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm md:text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            icon && "pr-10",
            error && "border-destructive focus-visible:ring-destructive text-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p role="alert" aria-live="polite" className="mt-1.5 text-xs text-destructive font-semibold">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
