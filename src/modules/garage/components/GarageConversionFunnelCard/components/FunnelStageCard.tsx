import React from "react";

export type FunnelStageTone = "teal" | "violet" | "slate" | "emerald" | "rose";

/** Class tĩnh theo tông giai đoạn (cùng tông chart: teal, vàng, slate, emerald, rose). */
const TONES: Record<
  FunnelStageTone,
  {
    card: string;
    title: string;
    badge: string;
    amount: string;
    divider: string;
  }
> = {
  teal: {
    card: "border-teal-600/20 bg-teal-50/40 dark:bg-teal-950/20",
    title: "text-teal-700 dark:text-teal-400",
    badge: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300",
    amount: "text-teal-600 dark:text-teal-400",
    divider: "border-teal-100 dark:border-teal-900/40",
  },
  violet: {
    card: "border-violet-600/20 bg-violet-50/40 dark:bg-violet-950/20",
    title: "text-violet-700 dark:text-violet-400",
    badge:
      "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300",
    amount: "text-violet-600 dark:text-violet-400",
    divider: "border-violet-100 dark:border-violet-900/40",
  },
  slate: {
    card: "border-slate-600/20 bg-slate-50/40 dark:bg-slate-900/30",
    title: "text-slate-700 dark:text-slate-300",
    badge:
      "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300",
    amount: "text-slate-600 dark:text-slate-400",
    divider: "border-slate-100 dark:border-slate-800/60",
  },
  emerald: {
    card: "border-emerald-600/20 bg-emerald-50/40 dark:bg-emerald-950/20",
    title: "text-emerald-700 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    amount: "text-emerald-600 dark:text-emerald-400",
    divider: "border-emerald-100 dark:border-emerald-900/40",
  },
  rose: {
    card: "border-rose-600/20 bg-rose-50/40 dark:bg-rose-950/20",
    title: "text-rose-700 dark:text-rose-400",
    badge: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300",
    amount: "text-rose-600 dark:text-rose-400",
    divider: "border-rose-100 dark:border-rose-900/40",
  },
};

interface FunnelStageCardProps {
  tone: FunnelStageTone;
  icon: React.ReactNode;
  title: string;
  badge: string;
  count: number;
  unit: string;
  amount: string;
  /** Nội dung chân thẻ (mô tả hoặc dòng dự thu). */
  children: React.ReactNode;
}

export function FunnelStageCard({
  tone,
  icon,
  title,
  badge,
  count,
  unit,
  amount,
  children,
}: FunnelStageCardProps) {
  const c = TONES[tone];
  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col justify-between ${c.card}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold flex items-center gap-1.5 ${c.title}`}
        >
          {icon}
          {title}
        </span>
        <span
          className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${c.badge}`}
        >
          {badge}
        </span>
      </div>
      <div className="mt-3">
        <div className="text-xl font-bold text-foreground">
          {count}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        </div>
        <div className={`text-xs font-medium mt-0.5 ${c.amount}`}>{amount}</div>
      </div>
      <div className={`mt-2 border-t pt-1.5 ${c.divider}`}>{children}</div>
    </div>
  );
}
