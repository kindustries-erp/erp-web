import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/shared/components/ui/textarea";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";

export interface BufferedTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  debounceMs?: number;
  allowClear?: boolean;
  disabled?: boolean;
}

export function BufferedTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = "w-full text-sm",
  debounceMs = 500,
  allowClear = true,
  disabled = false,
}: BufferedTextareaProps) {
  const [localValue, setLocalValue] = useState<string>(value || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFocusedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestOnChangeRef = useRef(onChange);
  latestOnChangeRef.current = onChange;

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value || "");
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      latestOnChangeRef.current(val);
    }, debounceMs);
  };

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    latestOnChangeRef.current(localValue);
  };

  const handleClear = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalValue("");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    latestOnChangeRef.current("");
    textareaRef.current?.focus();
  };

  const hasValue = localValue && localValue.length > 0;

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        className={cn(className, allowClear && hasValue && !disabled && "pr-8")}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
      {allowClear && hasValue && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={handleClear}
          onTouchStart={handleClear}
          onClick={handleClear}
          className="absolute top-2 right-2 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 p-0.5 rounded-full transition-colors flex items-center justify-center cursor-pointer select-none"
          title="Xóa nhanh"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
