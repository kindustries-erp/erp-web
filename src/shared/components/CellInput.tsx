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
  debounceMs = 500,
  className,
  ...props
}) => {
  const [localValue, setLocalValue] = useState<string | number>(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value ?? "");
    }
  }, [value, isFocused]);

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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
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
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "w-full h-full min-h-[38px] bg-transparent border-0 focus:ring-1 focus:ring-primary outline-none transition-all hover:bg-slate-50 focus:bg-white px-3 disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    />
  );
};
