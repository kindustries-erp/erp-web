import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";
import type { V2PanelProps } from "./V2Panel.type";

/** Khối nội dung có tiêu đề, dùng cho widget dashboard (biểu đồ, bảng tóm tắt) */
export const V2Panel: React.FC<V2PanelProps> = ({
  title,
  badge,
  extra,
  children,
  className,
}) => (
  <section
    className={cn(
      "min-w-0 overflow-hidden rounded-xl border border-border bg-background p-4 max-[480px]:p-3",
      className,
    )}
  >
    {(title || badge || extra) && (
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {title && (
            <V2Text
              as="h3"
              variant="body-sm"
              weight="bold"
              className="truncate"
            >
              {title}
            </V2Text>
          )}
          {badge}
        </div>
        {extra}
      </header>
    )}
    {children}
  </section>
);
V2Panel.displayName = "V2Panel";
