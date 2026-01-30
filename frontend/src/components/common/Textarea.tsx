/**
 * Textarea component with MotherDuck styling
 */

import { cn } from "@/utils";
import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref): JSX.Element => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "md-input w-full resize-none border-2 border-[var(--md-graphite)] bg-[var(--md-fog)] px-4 py-3 text-[var(--md-ink)] transition-colors",
            "placeholder:text-[var(--md-slate)]",
            "focus:border-[var(--md-sky-strong)] focus:outline-none",
            error && "border-[var(--md-watermelon)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--md-watermelon)]">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
