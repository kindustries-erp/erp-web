import React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerFieldProps } from "./DrawerField.type";

export const DrawerField: React.FC<DrawerFieldProps> = ({
  label,
  required = false,
  error,
  helperText,
  children,
  className,
  labelClassName,
}) => {
  return (
    <div className={cn("space-y-1.5 mb-2.5 last:mb-0", className)}>
      {label && (
        <label
          className={cn(
            "block text-xs font-medium text-foreground/85 select-none",
            labelClassName,
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div>{children}</div>

      {error ? (
        <p className="text-[11px] text-destructive leading-tight">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-fg leading-tight">{helperText}</p>
      ) : null}
    </div>
  );
};
