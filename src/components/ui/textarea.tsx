import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full text-right">
        <textarea
          aria-invalid={!!error}
          className={cn(
            "flex min-h-[96px] w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm md:text-base ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all leading-relaxed",
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
Textarea.displayName = "Textarea";

export { Textarea };
