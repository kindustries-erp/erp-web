import React from "react";

export interface CustomRadioIndicatorProps {
  checked: boolean;
  className?: string;
}

export function CustomRadioIndicator({
  checked,
  className = "",
}: CustomRadioIndicatorProps) {
  return (
    <span
      data-testid="custom-radio-indicator"
      data-state={checked ? "checked" : "unchecked"}
      className={`relative w-4 h-4 rounded-full border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
        checked
          ? "border-foreground bg-foreground text-background"
          : "border-border/80 bg-background hover:border-foreground/50"
      } ${className}`}
      aria-hidden="true"
    >
      {checked && <span className="w-1.5 h-1.5 rounded-full bg-background" />}
    </span>
  );
}
