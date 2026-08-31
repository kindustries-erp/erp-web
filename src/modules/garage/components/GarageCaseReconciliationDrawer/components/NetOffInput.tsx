import React, { useState, useEffect } from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { NetOffInputProps } from "../types";

export function NetOffInput({
  initialValue,
  maxAmount,
  onChange,
}: NetOffInputProps) {
  const [val, setVal] = useState<string>(
    initialValue !== "" && initialValue !== undefined
      ? String(initialValue)
      : "",
  );

  useEffect(() => {
    setVal(
      initialValue !== "" && initialValue !== undefined
        ? String(initialValue)
        : "",
    );
  }, [initialValue]);

  const handleBlur = () => {
    let parsed = parseFloat(val) || 0;
    if (parsed < 0) parsed = 0;
    if (maxAmount !== undefined && maxAmount > 0 && parsed > maxAmount) {
      parsed = maxAmount;
    }
    setVal(parsed > 0 ? String(parsed) : "");
    onChange(parsed);
  };

  return (
    <input
      type="number"
      className={cn(
        "w-full text-right h-6 px-1.5 text-xs font-mono font-bold transition-all rounded",
        "bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-900/50",
        "focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
        "text-slate-800 dark:text-slate-100 placeholder:text-muted-foreground/30 tabular-nums",
      )}
      value={val}
      placeholder={maxAmount ? money(maxAmount) : "0"}
      min={0}
      max={maxAmount || undefined}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
