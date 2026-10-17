import React from "react";

export interface CashflowLegendItemProps {
  color: string;
  label: string;
}

export function CashflowLegendItem({ color, label }: CashflowLegendItemProps) {
  return (
    <div className="flex items-center text-xs">
      <div
        className="w-3 h-3 rounded-[3px] mr-2 shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-[color:var(--muted-fg)]">{label}</span>
    </div>
  );
}
