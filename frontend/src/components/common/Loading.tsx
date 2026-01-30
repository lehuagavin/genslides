/**
 * Loading component
 */

import { cn } from "@/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Loading({
  size = "md",
  className,
  text,
}: LoadingProps): JSX.Element {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-[var(--md-sky)] border-t-transparent",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-[var(--md-slate)]">{text}</p>
      )}
    </div>
  );
}
