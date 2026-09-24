import React from "react";
import type { PairedPnlItem } from "../types";

export function mergePnlItems(
  curItems: Array<{
    id?: string;
    categoryKey: string;
    categoryName: string;
    amount: number;
    ojAmount?: number;
    note?: string | null;
  }> = [],
  prevItems: Array<{
    id?: string;
    categoryKey: string;
    categoryName: string;
    amount: number;
    ojAmount?: number;
    note?: string | null;
  }> = [],
): PairedPnlItem[] {
  const map = new Map<string, PairedPnlItem>();

  for (const item of curItems) {
    const key = item.categoryKey || item.categoryName;
    map.set(key, {
      key,
      categoryKey: item.categoryKey,
      categoryName: item.categoryName,
      note: item.note,
      curAmount: item.amount,
      curOjAmount: item.ojAmount || 0,
      prevAmount: undefined,
    });
  }

  for (const prev of prevItems) {
    const key = prev.categoryKey || prev.categoryName;
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.prevAmount = prev.amount;
      if (!existing.note && prev.note) {
        existing.note = prev.note;
      }
    } else {
      map.set(key, {
        key,
        categoryKey: prev.categoryKey,
        categoryName: prev.categoryName,
        note: prev.note,
        curAmount: 0,
        curOjAmount: 0,
        prevAmount: prev.amount,
      });
    }
  }

  return Array.from(map.values());
}

export function renderPrevVal(val?: number, isLoadingPrev?: boolean) {
  if (isLoadingPrev) {
    return <span className="text-muted-foreground/60">...</span>;
  }
  if (val === undefined || val === null) {
    return <span className="text-muted-foreground/40">—</span>;
  }
  return `${val.toLocaleString("vi-VN")} đ`;
}

export function renderDelta(
  curVal: number,
  prevVal?: number,
  isCost = false,
  isLoadingPrev = false,
) {
  if (
    prevVal === undefined ||
    prevVal === null ||
    prevVal === 0 ||
    isLoadingPrev
  ) {
    return null;
  }
  const diff = curVal - prevVal;
  if (diff === 0) return null;
  const pct = ((curVal - prevVal) / Math.abs(prevVal)) * 100;
  const isPositive = diff > 0;
  // For cost/opex, increase is bad (red), decrease is good (green)
  const isGood = isCost ? !isPositive : isPositive;

  return (
    <span
      className={`ml-1.5 inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded border ${
        isGood
          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          : "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
      }`}
    >
      {isPositive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}
