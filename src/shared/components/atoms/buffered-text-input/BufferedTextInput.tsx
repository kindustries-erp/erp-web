import React, { useState, useEffect } from "react";
import { inputCls } from "@/shared/components/DrawerModal";

export interface BufferedTextInputProps {
  value: any;
  onChange: (val: any) => void;
  type?: "text" | "number";
  placeholder?: string;
}

export function BufferedTextInput({
  value,
  onChange,
  type = "text",
  placeholder,
}: BufferedTextInputProps) {
  const [localVal, setLocalVal] = useState<string>(
    value !== undefined && value !== null ? String(value) : "",
  );

  useEffect(() => {
    setLocalVal(value !== undefined && value !== null ? String(value) : "");
  }, [value]);

  const handleBlur = () => {
    if (type === "number") {
      const num = localVal.trim() === "" ? null : Number(localVal);
      onChange(num);
    } else {
      onChange(localVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type={type}
      className={inputCls}
      value={localVal}
      placeholder={placeholder}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
