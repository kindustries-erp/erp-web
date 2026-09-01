import React, { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";

export interface CopyButtonProps {
  /** Giá trị chuỗi cần sao chép */
  value: string;
  /** Tooltip khi chưa copy (nếu true, mặc định 'Sao chép'; nếu string, hiển thị chuỗi đó) */
  tooltip?: string | boolean;
  /** Tooltip khi đã copy thành công (mặc định 'Đã sao chép') */
  copiedTooltip?: string;
  /** Kích hoạt Toast notification hoặc truyền custom message */
  toastMessage?: string | boolean;
  /** Custom Toast ID để tránh dồn toast */
  toastId?: string;
  /** Custom className cho button */
  className?: string;
  /** Custom className cho icon (mặc định 'w-3.5 h-3.5') */
  iconClassName?: string;
  /** Biến thể hiển thị của button */
  variant?: "ghost" | "muted" | "hover-only" | "default";
  /** Ngăn chặn event bubbling (mặc định true) */
  stopPropagation?: boolean;
  /** Ngăn chặn default action (mặc định true) */
  preventDefault?: boolean;
  /** Callback sau khi sao chép thành công */
  onCopy?: (value: string) => void;
  /** Trạng thái disabled */
  disabled?: boolean;
  /** ARIA label / title mặc định */
  title?: string;
  /** Thời gian hiển thị icon Check trước khi trở lại icon Copy (ms, mặc định 1500) */
  timeout?: number;
}

/**
 * Hàm sao chép vào clipboard có fallback an toàn cho môi trường test và non-HTTPS
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    if (typeof document !== "undefined") {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.top = "0";
      el.style.left = "-9999px";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(el);
      return successful;
    }
  } catch {
    // ignore
  }

  return false;
}

export const CopyButton = React.memo(function CopyButton({
  value,
  tooltip,
  copiedTooltip = "Đã sao chép",
  toastMessage,
  toastId,
  className,
  iconClassName = "w-3.5 h-3.5",
  variant = "muted",
  stopPropagation = true,
  preventDefault = true,
  onCopy,
  disabled = false,
  title,
  timeout = 1500,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      if (stopPropagation) e.stopPropagation();
      if (preventDefault) e.preventDefault();
      if (disabled || !value) return;

      const success = await copyToClipboard(value);
      if (success) {
        setCopied(true);
        onCopy?.(value);

        if (toastMessage) {
          const msg =
            typeof toastMessage === "string" ? toastMessage : copiedTooltip;
          toast.success(msg, toastId ? { id: toastId } : undefined);
        }

        setTimeout(() => setCopied(false), timeout);
      }
    },
    [
      value,
      disabled,
      stopPropagation,
      preventDefault,
      onCopy,
      toastMessage,
      copiedTooltip,
      toastId,
      timeout,
    ],
  );

  const variantClasses = {
    default:
      "p-1 hover:bg-surface-hover rounded text-foreground transition-colors",
    ghost:
      "p-1 hover:bg-surface-hover/80 rounded text-foreground transition-colors",
    muted:
      "p-1 hover:bg-surface-hover rounded text-muted-foreground hover:text-foreground transition-colors",
    "hover-only":
      "opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-surface-hover rounded text-muted-foreground hover:text-foreground",
  }[variant];

  const defaultTooltipText =
    typeof tooltip === "string" ? tooltip : title || "Sao chép";
  const currentTooltip = copied ? copiedTooltip : defaultTooltipText;

  const buttonElement = (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={tooltip ? undefined : currentTooltip}
      aria-label={currentTooltip}
      className={cn(
        "inline-flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
        variantClasses,
        className,
      )}
    >
      {copied ? (
        <Check className={cn("text-emerald-600 shrink-0", iconClassName)} />
      ) : (
        <Copy className={cn("shrink-0", iconClassName)} />
      )}
    </button>
  );

  if (tooltip) {
    return <Tooltip content={currentTooltip}>{buttonElement}</Tooltip>;
  }

  return buttonElement;
});

/**
 * Component Alias tương thích ngược với CopyIconBtn
 */
export const CopyIconBtn = ({
  text,
  className,
  ...props
}: { text: string } & Partial<CopyButtonProps>) => (
  <CopyButton
    value={text}
    variant="hover-only"
    className={cn("ml-2", className)}
    {...props}
  />
);

export default CopyButton;
