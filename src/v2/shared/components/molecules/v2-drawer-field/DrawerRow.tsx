import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerRowProps } from "./DrawerField.type";

export const DrawerRow: React.FC<DrawerRowProps> = ({
  label,
  value,
  copyable = false,
  copyText,
  className,
  labelClassName,
  valueClassName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy =
      copyText ||
      (typeof value === "string" || typeof value === "number"
        ? String(value)
        : "");
    if (textToCopy && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start justify-between py-1.5 border-b border-border/40 last:border-b-0 text-xs gap-3",
        className,
      )}
    >
      <span
        className={cn(
          "text-muted-fg font-normal shrink-0 max-w-[45%] truncate select-none",
          labelClassName,
        )}
      >
        {label}
      </span>

      <div
        className={cn(
          "flex items-center gap-1.5 text-foreground font-medium text-right break-words select-text min-w-0 justify-end flex-1",
          valueClassName,
        )}
      >
        <span className="truncate">{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-muted-fg hover:text-foreground shrink-0"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
