import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms";
import { RadioGroup, RadioGroupItem } from "@/v2/shared/ui/radio-group";
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
  const idPrefix = React.useId();

  return (
    <RadioGroup
      name={name}
      aria-label={ariaLabel}
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className={cn("gap-2", className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        const itemId = `${idPrefix}-${option.value}`;
        return (
          <div
            key={option.value}
            className={cn(
              "flex items-start gap-2.5 rounded-lg border p-2.5 transition-colors",
              checked
                ? "border-primary/50 bg-primary/10 dark:border-teal-500/40 dark:bg-teal-500/[0.08]"
                : "border-border/50 hover:bg-muted/20",
              option.disabled && "opacity-50",
            )}
          >
            <RadioGroupItem
              id={itemId}
              value={option.value}
              disabled={option.disabled}
              className="mt-0.5"
            />
            <V2Text asChild>
              <label
                htmlFor={itemId}
                className={cn(
                  "flex min-w-0 flex-1 flex-col gap-0.5",
                  option.disabled ? "cursor-not-allowed" : "cursor-pointer",
                )}
              >
                <span className="flex items-center gap-1.5">
                  {option.icon}
                  <V2Text
                    variant="body-sm"
                    className="font-medium text-foreground"
                  >
                    {option.label}
                  </V2Text>
                </span>
                {option.description && (
                  <V2Text variant="helper">{option.description}</V2Text>
                )}
              </label>
            </V2Text>
          </div>
        );
      })}
    </RadioGroup>
  );
}
