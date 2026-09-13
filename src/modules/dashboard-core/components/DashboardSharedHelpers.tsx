import React from "react";
import { Skeleton } from "@/shared/components/Skeleton";

export function SummaryCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-4 shadow-sm flex flex-col gap-2 h-[104px]">
        <div className="flex items-center justify-between">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>
        <Skeleton className="w-32 h-8 mt-1" />
      </div>
    );
  }
  return (
    <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-4 shadow-sm flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[color:var(--muted-fg)]">
          {title}
        </span>
        <div className="p-2 bg-[color:var(--muted)] rounded-lg">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-[color:var(--foreground)]">
        {value}
      </div>
    </div>
  );
}

export function IconTrendUp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-emerald-500"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function IconTrendDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-red-500"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
