import React from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import type { ActiveTab } from "@/modules/partners/types";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  active: boolean;
  className?: string;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ active, className, ...props }, ref) => {
    const t = useT();
    return (
      <span
        ref={ref}
        className={cn(
          "text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium",
          active
            ? "bg-approve-bg text-approve-fg"
            : "bg-[color:var(--muted)] text-[color:var(--muted-fg)]",
          className,
        )}
        {...props}
      >
        {active ? t("status.active") : t("status.inactive")}
      </span>
    );
  },
);
StatusBadge.displayName = "StatusBadge";

export function PageHeader({
  onAdd,
}: {
  onAdd: () => void;
  title?: string;
  desc?: string;
}) {
  const t = useT();
  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={onAdd}
        className="px-[14px] py-[7px] rounded-lg border border-primary bg-primary text-primary-fg text-xs font-medium cursor-pointer flex items-center gap-[6px] hover:opacity-90 whitespace-nowrap"
      >
        <IconPlus /> {t("common.addNew")}
      </button>
    </div>
  );
}

export function TabHeader({
  active,
  onChange,
}: {
  active: ActiveTab;
  onChange: (t: ActiveTab) => void;
}) {
  const t = useT();
  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "partners", label: t("doitac.tabs.partners") },
    { key: "contacts", label: t("doitac.tabs.contacts") },
    { key: "bankaccounts", label: t("doitac.tabs.bankAccounts") },
    { key: "roles", label: t("doitac.tabs.roles") },
  ];
  return (
    <div className="flex gap-1 mb-5 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "px-4 py-[9px] text-xs font-medium cursor-pointer border-b-2 -mb-px transition-colors",
            active === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-[color:var(--muted-fg)] hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function IconPlus() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
