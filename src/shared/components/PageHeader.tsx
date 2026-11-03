import type { ReactNode } from "react";
import { V2PageIcon } from "@/v2/shared/components/atoms/v2-page-icon";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { cn } from "@/v2/shared/utils/cn";

interface PageHeaderProps {
  title: ReactNode;
  desc?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  desc,
  icon,
  actions,
  className = "mb-5",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 sm:gap-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {icon && (
          <V2PageIcon className="w-7 h-7 sm:w-9 sm:h-9 -ml-1 sm:-ml-[6px] md:-ml-[10px] [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4">
            {icon}
          </V2PageIcon>
        )}
        <div className="min-w-0">
          <V2Text
            as="h1"
            variant="h3"
            truncate
            className="text-sm sm:text-base font-semibold text-foreground leading-tight"
          >
            {title}
          </V2Text>
          {desc && (
            <V2Text
              as="p"
              variant="body-sm"
              color="muted"
              truncate
              className="hidden sm:block mt-0.5"
            >
              {desc}
            </V2Text>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
