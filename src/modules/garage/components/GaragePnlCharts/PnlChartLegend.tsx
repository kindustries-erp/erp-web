import React from "react";

interface LegendItem {
  label: string;
  color: string;
  isLine?: boolean;
}

export function PnlChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex gap-x-4 gap-y-1 justify-center flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center text-xs">
          {item.isLine ? (
            <div
              className="w-4 h-[2px] mr-2"
              style={{ backgroundColor: item.color }}
            />
          ) : (
            <div
              className="w-3 h-3 rounded-[3px] mr-2"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="text-[color:var(--muted-fg)] font-medium">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
