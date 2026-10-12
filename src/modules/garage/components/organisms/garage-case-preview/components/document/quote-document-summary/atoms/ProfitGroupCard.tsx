import React from "react";

export interface ProfitGroupCardProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ProfitGroupCard({
  icon,
  title,
  badge,
  children,
  className = "",
}: ProfitGroupCardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 shadow-xs space-y-2 ${className}`}
    >
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
          <span>{title}</span>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
