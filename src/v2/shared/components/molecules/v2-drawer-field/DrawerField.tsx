import React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
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
        <V2Text
          as="label"
          variant="label"
          required={required}
          className={cn("block text-foreground/85 select-none", labelClassName)}
        >
          {label}
        </V2Text>
      )}

      <div>{children}</div>

      {error ? (
        <V2Text
          color="destructive"
          variant="helper"
          className="leading-tight block"
        >
          {error}
        </V2Text>
      ) : helperText ? (
        <V2Text color="muted" variant="helper" className="leading-tight block">
          {helperText}
        </V2Text>
      ) : null}
    </div>
  );
};
