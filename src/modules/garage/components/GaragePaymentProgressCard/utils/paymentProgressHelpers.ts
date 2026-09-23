export function getBadgeVariant(rate: number, isReceiptTab: boolean = true) {
  if (rate >= 100) {
    return isReceiptTab
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30";
  }
  return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80";
}

export function getProgressColor(rate: number, isReceiptTab: boolean = true) {
  if (isReceiptTab) {
    return rate >= 100
      ? "bg-[#059669] dark:bg-emerald-500"
      : "bg-[#059669]/85 dark:bg-emerald-500/85";
  } else {
    return rate >= 100
      ? "bg-[#ea580c] dark:bg-orange-500"
      : "bg-[#ea580c]/85 dark:bg-orange-500/85";
  }
}

export function formatMonth(m: string) {
  const parts = m.split("-");
  if (parts.length === 2) return `Tháng ${parts[1]}/${parts[0]}`;
  return m;
}
