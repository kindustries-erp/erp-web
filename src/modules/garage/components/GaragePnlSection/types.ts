export interface PairedPnlItem {
  key: string;
  categoryKey: string;
  categoryName: string;
  note?: string | null;
  curAmount: number;
  curOjAmount?: number;
  prevAmount?: number;
}
