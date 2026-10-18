import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2SwitchProps } from "./V2Switch.type";

export const V2Switch = React.forwardRef<HTMLButtonElement, V2SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      label,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState(defaultChecked);
    const isOn = checked ?? inner;

    const toggle = () => {
      if (checked === undefined) setInner(!isOn);
      onCheckedChange?.(!isOn);
    };

    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 text-sm",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <button
          {...props}
          ref={ref}
          type="button"
          role="switch"
          aria-checked={isOn}
          disabled={disabled}
          onClick={toggle}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isOn ? "bg-primary" : "bg-input",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-background shadow transition-transform",
              isOn ? "translate-x-[18px]" : "translate-x-0.5",
            )}
          />
        </button>
        {label && <span>{label}</span>}
      </label>
    );
  },
);
V2Switch.displayName = "V2Switch";
