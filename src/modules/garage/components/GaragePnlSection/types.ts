export interface PairedPnlItem {
  key: string;
  categoryKey: string;
  categoryName: string;
  note?: string | null;
  // Month 0 (Kỳ chọn: Tháng T)
  curAmount: number;
  curOjAmount?: number;
  // Month 1 (Kỳ trước: Tháng T-1)
  prevAmount?: number;
  prevOjAmount?: number;
  // Month 2 (Kỳ trước nữa: Tháng T-2)
  prev2Amount?: number;
  prev2OjAmount?: number;
}

export type MultiMonthPnlItem = PairedPnlItem;
