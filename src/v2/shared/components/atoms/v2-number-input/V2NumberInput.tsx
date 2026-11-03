import * as React from "react";
import { Input } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import {
  clampNumber,
  formatNumberValue,
  parseNumberText,
  sanitizeNumberText,
  toEditableText,
} from "./V2NumberInput.helper";
import type {
  V2NumberInputProps,
  V2NumberInputSize,
} from "./V2NumberInput.type";

const SIZE_STYLES: Record<V2NumberInputSize, string> = {
  xs: "h-7 text-xs px-2",
  sm: "h-8 text-sm px-3",
  md: "h-9 text-sm px-3",
  lg: "h-10 text-base px-3.5",
};

/** Ô nhập số: hiển thị có dấu phân cách nghìn khi không gõ, `,` là dấu thập phân khi gõ */
export const V2NumberInput = React.forwardRef<
  HTMLInputElement,
  V2NumberInputProps
>(
  (
    {
      value,
      onValueChange,
      size,
      sizeVariant,
      decimals = 0,
      min,
      max,
      allowNegative = false,
      locale = "vi-VN",
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = React.useState(false);
    const [draft, setDraft] = React.useState("");
    const options = { decimals, allowNegative };
    const shown = focused ? draft : formatNumberValue(value, decimals, locale);
    const resolvedSize = sizeVariant ?? size ?? "sm";

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode={decimals > 0 ? "decimal" : "numeric"}
        value={shown}
        className={cn(
          SIZE_STYLES[resolvedSize],
          "text-right tabular-nums",
          className,
        )}
        onFocus={(event) => {
          setDraft(toEditableText(value));
          setFocused(true);
          onFocus?.(event);
        }}
        onChange={(event) => {
          const clean = sanitizeNumberText(event.target.value, options);
          setDraft(clean);
          onValueChange(parseNumberText(clean, options));
        }}
        onBlur={(event) => {
          setFocused(false);
          const parsed = parseNumberText(draft, options);
          if (parsed !== null) {
            const clamped = clampNumber(parsed, min, max);
            if (clamped !== parsed) onValueChange(clamped);
          }
          onBlur?.(event);
        }}
      />
    );
  },
);
V2NumberInput.displayName = "V2NumberInput";
