import * as React from "react";

type BadgeVariant = "default" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variantClasses =
    variant === "outline"
      ? "border border-border bg-transparent text-foreground"
      : "bg-primary text-primary-foreground";

  return (
    <div
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantClasses,
        className,
      ].join(" ")}
      {...props}
    />
  );
}