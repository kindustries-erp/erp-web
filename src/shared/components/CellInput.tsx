import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/shared/utils";

interface CellInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onValueChange: (val: string) => void;
  debounceMs?: number;
}

export const CellInput: React.FC<CellInputProps> = ({
  value,
  onValueChange,
  debounceMs = 300,
  className,
  ...props
}) => {
  const [localValue, setLocalValue] = useState<string | number>(value ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onValueChange(newVal);
    }, debounceMs);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onValueChange(String(localValue));
    props.onBlur?.(e);
  };

  return (
    <input
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={cn(
        "w-full h-full min-h-[38px] bg-transparent border-0 focus:ring-1 focus:ring-primary outline-none transition-all hover:bg-slate-50 focus:bg-white px-3 disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    />
  );
};
