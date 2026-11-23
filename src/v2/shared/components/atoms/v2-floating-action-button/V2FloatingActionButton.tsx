import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";

export interface V2FloatingActionButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  icon: React.ReactNode;
  /** Nhãn cho trình đọc màn hình và tooltip gốc của trình duyệt */
  label: string;
  /** Hiện nhãn cạnh icon (nút dạng viên thuốc) thay vì chỉ icon tròn */
  extended?: boolean;
}

/**
 * Nút hành động nổi. Vị trí do nơi dùng quyết định qua `className`
 * (vd `fixed bottom-6 right-6`); vùng chạm tối thiểu 48px.
 */
export const V2FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  V2FloatingActionButtonProps
>(({ icon, label, extended = false, className, type, ...props }, ref) => (
  <button
    ref={ref}
    type={type ?? "button"}
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-primary bg-primary text-primary-fg",
      "shadow-[var(--panel-shadow,0_12px_30px_rgba(15,23,42,0.16))] transition-transform hover:bg-primary/90 active:scale-95",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      extended ? "px-4" : "w-12",
      className,
    )}
    {...props}
  >
    <span aria-hidden className="inline-flex shrink-0 items-center">
      {icon}
    </span>
    {extended && <span className="text-sm font-medium">{label}</span>}
  </button>
));
V2FloatingActionButton.displayName = "V2FloatingActionButton";
