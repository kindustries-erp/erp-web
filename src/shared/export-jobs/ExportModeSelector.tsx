import React from "react";
import { Calendar, Filter } from "lucide-react";

export type ExportMode = "by-period" | "by-current-filter";

export interface ExportModeSelectorProps {
  mode: ExportMode;
  onChange: (mode: ExportMode) => void;
  /** Nhãn đã dịch. */
  labels: {
    title: string;
    period: string;
    periodDesc: string;
    currentFilter: string;
    currentFilterDesc: string;
  };
  /** Ẩn chế độ "theo filter hiện tại" khi bảng chưa truyền được filter. */
  allowCurrentFilter?: boolean;
  name?: string;
}

export function ExportModeSelector({
  mode,
  onChange,
  labels,
  allowCurrentFilter = true,
  name = "exportMode",
}: ExportModeSelectorProps) {
  const options: {
    value: ExportMode;
    icon: React.ReactNode;
    label: string;
    desc: string;
  }[] = [
    {
      value: "by-period",
      icon: <Calendar className="w-3.5 h-3.5 text-muted-foreground" />,
      label: labels.period,
      desc: labels.periodDesc,
    },
    ...(allowCurrentFilter
      ? [
          {
            value: "by-current-filter" as const,
            icon: <Filter className="w-3.5 h-3.5 text-foreground" />,
            label: labels.currentFilter,
            desc: labels.currentFilterDesc,
          },
        ]
      : []),
  ];

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-2">
        {labels.title}
      </label>
      <div className="grid grid-cols-1 gap-2" role="radiogroup">
        {options.map((opt) => {
          const checked = mode === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all select-none ${
                checked
                  ? "border-foreground bg-muted/40 text-foreground shadow-2xs"
                  : "border-border/70 hover:border-border hover:bg-muted/20 text-muted-foreground"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`relative w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                  checked
                    ? "border-foreground bg-foreground"
                    : "border-border/80 bg-background"
                }`}
              >
                {checked && (
                  <span className="w-1.5 h-1.5 rounded-full bg-background" />
                )}
              </span>
              <div className="flex flex-col gap-0.5 text-xs flex-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {opt.desc}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
