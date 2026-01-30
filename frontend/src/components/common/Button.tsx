/**
 * Button component with MotherDuck styling
 */

import { cn } from "@/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={cn(
        // Base styles
        "md-btn inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all",
        // Size variants
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        // Color variants
        variant === "primary" && "bg-[var(--md-sky)] hover:bg-[var(--md-sky-strong)]",
        variant === "secondary" && "md-btn-secondary bg-[var(--md-cream)]",
        variant === "ghost" && "border-transparent bg-transparent hover:bg-[var(--md-fog)]",
        variant === "danger" && "bg-[var(--md-watermelon)] text-white hover:bg-[var(--md-watermelon-strong,#d32f2f)]",
        // States
        (disabled || isLoading) && "cursor-not-allowed opacity-50",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
