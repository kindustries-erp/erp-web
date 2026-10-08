import * as React from "react";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { cn } from "@/v2/shared/utils/cn";
import type { V2SpreadsheetPageTemplateProps } from "./V2SpreadsheetPageTemplate.type";

export const V2SpreadsheetPageTemplate: React.FC<
  V2SpreadsheetPageTemplateProps
> = ({
  title,
  description,
  icon,
  actions,
  tabs,
  activeTab,
  onTabChange,
  hideHeader = false,
  children,
  className,
}) => (
  <section
    className={cn("flex h-full min-h-0 w-full flex-col gap-4", className)}
  >
    {!hideHeader && (
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">
              {title}
            </h1>
            {description && (
              <p className="truncate text-xs text-muted-fg">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>
    )}
    {tabs && tabs.length > 0 && (
      <V2TabBar
        variant="header"
        tabs={tabs}
        activeTabKey={activeTab}
        onTabChange={onTabChange}
        className="shrink-0"
      />
    )}
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  </section>
);
