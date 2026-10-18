import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Text } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import { V2TextProps } from "./V2Text.type";

function getTruncateClass(truncate?: boolean | 1 | 2 | 3): string | undefined {
  if (!truncate) return undefined;
  if (truncate === true || truncate === 1) return "truncate";
  if (truncate === 2) return "line-clamp-2";
  if (truncate === 3) return "line-clamp-3";
  return undefined;
}

export const V2Text = React.forwardRef<HTMLElement, V2TextProps>(
  (
    {
      children,
      className,
      truncate,
      copyable = false,
      required = false,
      onClick,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = React.useCallback(
      async (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e);
        if (!copyable || !children) return;

        try {
          const textToCopy =
            typeof children === "string" ? children : String(children);
          await navigator.clipboard.writeText(textToCopy);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // ignore copy error in non-secure or test contexts
        }
      },
      [copyable, children, onClick],
    );

    const truncateClass = getTruncateClass(truncate);

    if (asChild) {
      return (
        <Text
          ref={ref}
          asChild
          className={cn(truncateClass, className)}
          {...props}
        >
          {children}
        </Text>
      );
    }

    return (
      <Text
        ref={ref}
        onClick={copyable ? handleCopy : onClick}
        className={cn(
          truncateClass,
          copyable &&
            "group inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity select-none",
          className,
        )}
        {...props}
      >
        {children}
        {required && (
          <span
            className="text-destructive font-bold ml-0.5 select-none"
            aria-hidden="true"
          >
            *
          </span>
        )}
        {copyable && (
          <span
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 inline-flex shrink-0"
            aria-label="Sao chép"
          >
            {copied ? (
              <Check size={12} className="text-success" />
            ) : (
              <Copy size={12} className="text-muted-fg" />
            )}
          </span>
        )}
      </Text>
    );
  },
);
V2Text.displayName = "V2Text";
