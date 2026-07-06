import { X } from "lucide-react";
import { cn } from "@/shared/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
}: SearchInputProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("form-input w-full pr-7", inputClassName)}
      />
      {value && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[color:var(--muted-fg)] hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
