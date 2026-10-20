import * as React from "react";
import { Progress } from "@/v2/shared/ui/progress";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ProgressProps, V2ProgressTone } from "./V2Progress.type";

const TONE_CLASS: Record<V2ProgressTone, string> = {
  primary: "bg-primary",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export const V2Progress: React.FC<V2ProgressProps> = ({
  value,
  tone = "primary",
  label,
  showValue = false,
  className,
}) => {
  const known = value !== undefined;
  const percent = known ? Math.round(clamp(value)) : undefined;

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      {(label || (showValue && known)) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          {showValue && known && (
            <span className="tabular-nums">{percent}%</span>
          )}
        </div>
      )}
      <Progress
        value={percent ?? 100}
        aria-label={label}
        indicatorClassName={cn(TONE_CLASS[tone], !known && "animate-pulse")}
      />
    </div>
  );
};
V2Progress.displayName = "V2Progress";
