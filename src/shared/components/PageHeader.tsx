import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  desc?: ReactNode;
  icon: ReactNode;
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
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 -ml-[6px] md:-ml-[10px] rounded-[10px] bg-[color:var(--primary)]/10 flex items-center justify-center text-[color:var(--primary)] shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground leading-tight">
            {title}
          </h1>
          {desc && (
            <p className="text-xs text-[color:var(--muted-fg)] mt-0.5">
              {desc}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
