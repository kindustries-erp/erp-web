import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Icon } from "@/v2/shared/components/atoms/v2-icon";
import { X } from "@/v2/shared/components/atoms/v2-icon/icons";
import { cn } from "@/v2/shared/utils/cn";
import type { V2InputProps, V2InputSize } from "./V2Input.type";

const SIZE_STYLES: Record<
  V2InputSize,
  {
    height: string;
    text: string;
    plDefault: string;
    plIcon: string;
    prDefault: string;
    prIcon: string;
  }
> = {
  xs: {
    height: "h-7",
    text: "text-xs",
    plDefault: "pl-2",
    plIcon: "pl-7",
    prDefault: "pr-2",
    prIcon: "pr-7",
  },
  sm: {
    height: "h-8",
    text: "text-xs",
    plDefault: "pl-2.5",
    plIcon: "pl-8",
    prDefault: "pr-2.5",
    prIcon: "pr-8",
  },
  md: {
    height: "h-9",
    text: "text-sm",
    plDefault: "pl-3",
    plIcon: "pl-9",
    prDefault: "pr-3",
    prIcon: "pr-9",
  },
  lg: {
    height: "h-10",
    text: "text-base",
    plDefault: "pl-3.5",
    plIcon: "pl-10",
    prDefault: "pr-3.5",
    prIcon: "pr-10",
  },
};

export const V2Input = React.forwardRef<HTMLInputElement, V2InputProps>(
  (
    {
      className,
      inputClassName,
      containerClassName,
      sizeVariant = "md",
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      error,
      value,
      defaultValue,
      onChange,
      disabled,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);
    const [internalVal, setInternalVal] = React.useState(defaultValue ?? "");
    const isControlled = value !== undefined;
    const currentVal = isControlled ? value : internalVal;
    const hasValue =
      currentVal !== undefined && currentVal !== null && currentVal !== "";

    const sizeStyle = SIZE_STYLES[sizeVariant];

    const setMergedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalVal(e.target.value);
      onChange?.(e);
    };

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isControlled) setInternalVal("");
      if (innerRef.current) {
        innerRef.current.value = "";
      }
      onClear?.();
      if (onChange && innerRef.current) {
        const syntheticEvent = {
          target: innerRef.current,
          currentTarget: innerRef.current,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const showClear = clearable && hasValue && !disabled;

    return (
      <div
        className={cn("relative flex w-full items-center", containerClassName)}
      >
        {leftIcon && (
          <span className="pointer-events-none absolute left-2.5 flex items-center text-muted-fg [&>svg]:h-4 [&>svg]:w-4">
            {leftIcon}
          </span>
        )}
        <input
          ref={setMergedRef}
          type={type}
          value={isControlled ? value : internalVal}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            "flex w-full rounded-md border border-input bg-background transition-colors",
            "text-foreground placeholder:text-muted-fg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            sizeStyle.height,
            sizeStyle.text,
            leftIcon ? sizeStyle.plIcon : sizeStyle.plDefault,
            rightIcon || showClear ? sizeStyle.prIcon : sizeStyle.prDefault,
            error && "border-destructive focus-visible:ring-destructive",
            inputClassName,
            className,
          )}
          {...props}
        />
        {showClear ? (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-sm text-muted-fg hover:text-foreground focus:outline-none"
            aria-label="Xóa"
          >
            <V2Icon icon={X} size={14} />
          </V2Button>
        ) : rightIcon ? (
          <span className="pointer-events-none absolute right-2.5 flex items-center text-muted-fg [&>svg]:h-4 [&>svg]:w-4">
            {rightIcon}
          </span>
        ) : null}
      </div>
    );
  },
);

V2Input.displayName = "V2Input";
