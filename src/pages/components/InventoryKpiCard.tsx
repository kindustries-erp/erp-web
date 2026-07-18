import React from "react";
import { Skeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";

interface InventoryKpiCardProps {
  label: string;
  value: number | string;
  type?: "default" | "money" | "warning" | "danger";
  loading?: boolean;
  onClick?: () => void;
}

export function InventoryKpiCard({
  label,
  value,
  type = "default",
  loading,
  onClick,
}: InventoryKpiCardProps) {
  let displayValue: React.ReactNode = value;
  let textColor = "text-foreground";

  if (type === "money" && typeof value === "number") {
    displayValue = money(value);
  }

  if (type === "warning") {
    textColor = "text-orange-600";
  } else if (type === "danger") {
    textColor = "text-red-600";
  }

  return (
    <div
      className={`bg-surface border border-border rounded-xl card-shadow p-3 max-[480px]:p-2 flex flex-col justify-between ${onClick ? "cursor-pointer hover:border-primary/50 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className="text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-2 text-[10px] truncate">
        {label}
      </div>

      {loading ? (
        <div className="space-y-2 mb-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-5 w-full rounded mt-2" />
        </div>
      ) : (
        <div className="flex justify-between items-center mt-auto">
          <span className={`font-bold text-2xl ${textColor}`}>
            {displayValue}
          </span>
        </div>
      )}
    </div>
  );
}
