import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ChatBubbleProps } from "./V2ChatBubble.type";

export const V2ChatBubble = React.forwardRef<HTMLDivElement, V2ChatBubbleProps>(
  (
    { role = "assistant", plain = false, className, children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      data-role={role}
      className={cn(
        "flex w-full",
        role === "user" ? "justify-end" : "justify-start",
      )}
      {...props}
    >
      <div
        className={cn(
          "min-w-0 text-sm leading-relaxed break-words",
          plain
            ? "w-full"
            : "max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap",
          !plain &&
            (role === "user"
              ? "rounded-br-md bg-primary text-primary-fg"
              : "rounded-bl-md border border-border bg-surface text-foreground"),
          className,
        )}
      >
        {children}
      </div>
    </div>
  ),
);
V2ChatBubble.displayName = "V2ChatBubble";
