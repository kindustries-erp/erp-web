import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2BreadcrumbProps } from "./V2Breadcrumb.type";

export const V2Breadcrumb: React.FC<V2BreadcrumbProps> = ({
  items,
  separator,
  className,
}) => {
  if (!items || items.length === 0) return null;

  const defaultSeparator = (
    <ChevronRight
      size={12}
      className="text-[color:var(--faint,hsl(var(--muted-foreground)))] flex-shrink-0 opacity-70"
      aria-hidden="true"
    />
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "v2-breadcrumb flex items-center gap-[5px] text-xs text-[color:var(--muted-fg,hsl(var(--muted-foreground)))] min-w-0 overflow-hidden select-none",
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <span className="flex-shrink-0" aria-hidden="true">
                {separator ?? defaultSeparator}
              </span>
            )}
            {isLast ? (
              <span
                className="font-medium text-foreground truncate"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="truncate hover:text-foreground transition-colors cursor-pointer border-none bg-transparent p-0 text-xs text-[color:var(--muted-fg,hsl(var(--muted-foreground)))]"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
