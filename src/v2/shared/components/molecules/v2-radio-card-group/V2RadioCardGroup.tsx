import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { cn } from "@/v2/shared/utils/cn";
import type { V2RadioCardGroupProps } from "./V2RadioCardGroup.type";

export function V2RadioCardGroup<T extends string>({
  name,
  ariaLabel,
  options,
  value,
  onValueChange,
  className,
}: V2RadioCardGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("grid gap-2", className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
              checked
                ? "border-foreground bg-muted/40 text-foreground"
                : "border-border/70 text-muted-foreground hover:border-border hover:bg-muted/20",
              option.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              disabled={option.disabled}
              onChange={() => onValueChange(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                checked ? "border-foreground" : "border-border",
              )}
            >
              {checked && (
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                {option.icon}
                <V2Text variant="body-sm" className="font-medium">
                  {option.label}
                </V2Text>
              </span>
              {option.description && (
                <V2Text
                  variant="body-sm"
                  className="text-[11px] leading-normal text-muted-foreground"
                >
                  {option.description}
                </V2Text>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
