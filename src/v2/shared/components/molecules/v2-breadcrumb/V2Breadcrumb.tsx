import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { V2BreadcrumbProps } from "./V2Breadcrumb.type";

export const V2Breadcrumb: React.FC<V2BreadcrumbProps> = ({
  items,
  separator,
  mobileMode = "last-only",
  className,
  ...props
}) => {
  if (!items || items.length === 0) return null;

  const isLastOnly = mobileMode === "last-only";

  const defaultSeparator = (
    <ChevronRight
      size={14}
      className="text-faint flex-shrink-0 opacity-70"
      aria-hidden="true"
    />
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "v2-breadcrumb flex items-center gap-1.5 text-xs text-muted-fg dark:text-zinc-400 min-w-0 overflow-hidden select-none",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <span
                className={cn(
                  "flex-shrink-0",
                  isLastOnly && "hidden sm:inline-flex",
                )}
                aria-hidden="true"
              >
                {separator ?? defaultSeparator}
              </span>
            )}
            <div
              className={cn(
                isLast
                  ? "min-w-0 truncate"
                  : isLastOnly
                    ? "hidden sm:inline-flex shrink-0"
                    : "inline-flex shrink-0",
              )}
            >
              {isLast ? (
                <V2Text
                  variant="body-sm"
                  weight="semibold"
                  className="text-foreground dark:text-zinc-100 font-semibold truncate"
                  aria-current="page"
                >
                  {item.label}
                </V2Text>
              ) : item.href ? (
                <V2Text
                  asChild
                  variant="body-sm"
                  className="text-muted-fg hover:text-foreground truncate transition-colors"
                >
                  <a href={item.href}>{item.label}</a>
                </V2Text>
              ) : item.onClick ? (
                <V2Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={item.onClick}
                  className="h-auto p-0 text-xs font-normal text-muted-fg dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100 hover:bg-transparent truncate"
                >
                  {item.label}
                </V2Button>
              ) : (
                <V2Text
                  variant="body-sm"
                  className="text-muted-fg dark:text-zinc-400 truncate"
                >
                  {item.label}
                </V2Text>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
