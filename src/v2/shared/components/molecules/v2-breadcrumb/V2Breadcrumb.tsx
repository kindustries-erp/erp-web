import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { V2BreadcrumbProps } from "./V2Breadcrumb.type";

export const V2Breadcrumb: React.FC<V2BreadcrumbProps> = ({
  items,
  separator,
  className,
  ...props
}) => {
  if (!items || items.length === 0) return null;

  const defaultSeparator = (
    <ChevronRight
      size={12}
      className="text-faint flex-shrink-0 opacity-70"
      aria-hidden="true"
    />
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "v2-breadcrumb flex items-center gap-[5px] text-xs text-muted-fg min-w-0 overflow-hidden select-none",
        className,
      )}
      {...props}
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
              <V2Text
                variant="body-sm"
                weight="medium"
                className="text-foreground truncate"
                aria-current="page"
              >
                {item.label}
              </V2Text>
            ) : (
              <V2Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={item.onClick}
                className="h-auto p-0 text-xs font-normal text-muted-fg hover:text-foreground hover:bg-transparent truncate"
              >
                {item.label}
              </V2Button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
