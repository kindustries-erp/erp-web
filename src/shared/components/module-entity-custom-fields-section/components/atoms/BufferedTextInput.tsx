import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";
import { inputCls } from "@/shared/components/DrawerModal";

export interface BufferedTextInputProps {
  type?: "text" | "number";
  value: any;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  allowClear?: boolean;
}

export function BufferedTextInput({
  type = "text",
  value,
  onChange,
  placeholder,
  className = inputCls,
  debounceMs = 500,
  allowClear = true,
}: BufferedTextInputProps) {
  const [localValue, setLocalValue] = useState<string>(
    value !== undefined && value !== null ? String(value) : "",
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocusedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestOnChangeRef = useRef(onChange);
  latestOnChangeRef.current = onChange;

  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalValue(value !== undefined && value !== null ? String(value) : "");
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    inputRef.current?.focus();
  };

  const hasValue =
    localValue !== undefined &&
    localValue !== null &&
    String(localValue).length > 0;

  return (
    <div className="relative w-full flex items-center">
      <input
        ref={inputRef}
        type={type}
        className={cn(className, allowClear && hasValue && "pr-8")}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      {allowClear && hasValue && (
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={handleClear}
          onTouchStart={handleClear}
          onClick={handleClear}
          className="absolute right-2 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 p-0.5 rounded-full transition-colors flex items-center justify-center cursor-pointer select-none"
          title="Xóa nhanh"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
