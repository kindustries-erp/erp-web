import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";

export interface V2TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Câu mô tả trạng thái, hiển thị cạnh ba chấm và đọc cho trình đọc màn hình */
  label: string;
}

const DOT_DELAYS = ["0ms", "150ms", "300ms"];

export const V2TypingIndicator: React.FC<V2TypingIndicatorProps> = ({
  label,
  className,
  ...props
}) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      "inline-flex items-center gap-2 text-sm text-muted-fg",
      className,
    )}
    {...props}
  >
    <span aria-hidden className="inline-flex items-center gap-1">
      {DOT_DELAYS.map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-fg motion-reduce:animate-none"
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
    <span>{label}</span>
  </div>
);
V2TypingIndicator.displayName = "V2TypingIndicator";
