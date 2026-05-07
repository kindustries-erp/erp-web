import React from "react";

interface PanelProps {
  title?: string;
  badge?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Panel({
  title,
  badge,
  extra,
  children,
  className = "",
}: PanelProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-4 max-[480px]:p-3 card-shadow overflow-hidden min-w-0 ${className}`}
    >
      {(title || badge || extra) && (
        <div className="flex items-center justify-between mb-[14px]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {title}
            </span>
            {badge}
          </div>
          {extra}
        </div>
      )}
      {children}
    </div>
  );
}

export function PanelBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-primary text-primary-fg text-[10px] font-semibold px-[7px] py-[2px] rounded-[20px]">
      {children}
    </span>
  );
}

export function PanelMore() {
  return (
    <span className="text-[color:var(--faint)] cursor-pointer text-base tracking-[2px]">
      ···
    </span>
  );
}
