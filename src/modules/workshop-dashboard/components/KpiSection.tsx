import React from "react";
import { KpiCard } from "@/shared/components/KpiCard";

export interface KpiItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive?: boolean;
  };
  loading?: boolean;
}

export interface KpiSectionProps {
  items: KpiItem[];
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

const COL_GRID: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-2 md:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
};

export function KpiSection({ items, columns = 4, className }: KpiSectionProps) {
  const gridClass = COL_GRID[columns] ?? COL_GRID[4];
  return (
    <div className={`grid gap-3 md:gap-4 ${gridClass} ${className || ""}`}>
      {items.map((item, idx) => (
        <KpiCard
          key={`${item.label}-${idx}`}
          label={item.label}
          value={item.value}
          icon={item.icon}
          loading={item.loading}
        />
      ))}
    </div>
  );
}
