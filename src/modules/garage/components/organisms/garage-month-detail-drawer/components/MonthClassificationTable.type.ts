import type React from "react";

export type MonthDebtType = "receivables" | "payables";

export interface MonthClassificationRow {
  key: string;
  name: string;
  subLabel?: string;
  icon: React.ReactNode;
  badgeClass?: string;
  caseCount: number;
  billed: number;
  paid: number;
  remaining: number;
  remainingWithInvoice: number;
  remainingNoInvoice: number;
  rate: number;
  shareRate: number;
}

export interface MonthClassificationTableProps {
  rows: MonthClassificationRow[];
  debtType: MonthDebtType;
  totalBilled: number;
  tableId: string;
  title: string;
  onSelectClassification: (row: MonthClassificationRow) => void;
}
