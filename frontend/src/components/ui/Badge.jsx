import React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-primary/10 text-primary hover:bg-primary/20",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  outline: "text-foreground border border-input",
  success: "bg-success/15 text-success hover:bg-success/25",
  warning: "bg-warning/15 text-warning hover:bg-warning/25",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
