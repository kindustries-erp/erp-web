import React, { useState, useEffect } from "react";
import { cn } from "@/shared/utils";

interface NetOffInputProps {
  initialValue: number | "";
  maxAmount: number;
  isSelected?: boolean;
  onChange: (val: number) => void;
}

export function NetOffInput({
  initialValue,
  maxAmount,
  isSelected,
  onChange,
}: NetOffInputProps) {
  const [val, setVal] = useState<string | number>(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    let numericVal = Number(val);
    if (isNaN(numericVal) || numericVal < 0) numericVal = 0;
    if (maxAmount > 0 && numericVal > maxAmount) numericVal = maxAmount;
    setVal(numericVal === 0 ? "" : numericVal);
    onChange(numericVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <input
      type="number"
      className={cn(
        "w-full text-right h-7 border rounded px-1.5 text-xs font-mono font-bold focus:outline-none transition-colors",
        isSelected
          ? "border-primary bg-primary/5 text-slate-900 focus:ring-1 focus:ring-primary dark:text-white"
          : "border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary text-slate-700 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200",
      )}
      value={val}
      min={0}
      max={maxAmount || undefined}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
