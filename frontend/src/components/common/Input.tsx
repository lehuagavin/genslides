/**
 * Input component with MotherDuck styling
 */

import { cn } from "@/utils";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref): JSX.Element => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "md-input w-full border-2 border-[var(--md-graphite)] bg-[var(--md-fog)] px-4 py-3 text-[var(--md-ink)] transition-colors",
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

Input.displayName = "Input";
