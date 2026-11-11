import React from "react";
import { V2TableText, V2Badge, type V2Column } from "@/v2/shared/components";
import { LoanItem, LoanStatus } from "@/v2/core/loans";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";

type Translate = (key: string, fallback?: string) => string;

const STATUS_MAP: Record<
  LoanStatus,
  { label: string; variant: "default" | "outline" | "destructive" }
> = {
  [LoanStatus.ACTIVE]: { label: "Đang vay", variant: "default" },
  [LoanStatus.DRAFT]: { label: "Dự thảo", variant: "outline" },
  [LoanStatus.COMPLETED]: { label: "Đã tất toán", variant: "outline" },
  [LoanStatus.OVERDUE]: { label: "Quá hạn", variant: "destructive" },
};

function formatVnd(val?: number | null): string {
  if (val === null || val === undefined) return "—";
  return `${Number(val).toLocaleString("vi-VN")} ₫`;
}

export const buildLoanColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<LoanItem>[] => [
  {
    key: "loanCode",
    label: t("v2.loans.columns.code", "Mã vay"),
    size: 140,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2TableText
        text={row.loanCode}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "title",
    label: t("v2.loans.columns.title", "Tên khoản vay"),
    size: 220,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <span className="font-medium truncate block">{row.title}</span>
    ),
  },
  {
    key: "lenderName",
    label: t("v2.loans.columns.lender", "Ngân hàng / Đơn vị vay"),
    size: 180,
    enableResizing: true,
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <span className="text-muted-foreground truncate block">
        {row.lenderName}
      </span>
    ),
  },
  {
    key: "principalAmount",
    label: t("v2.loans.columns.principal", "Số tiền vay"),
    size: 160,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    filter: { valueType: ColumnValueType.NUMBER },
    cell: (row) => (
      <span className="font-semibold text-foreground">
        {formatVnd(row.principalAmount)}
      </span>
    ),
  },
  {
    key: "totalPaidPrincipal",
    label: t("v2.loans.columns.paidPrincipal", "Đã trả gốc"),
    size: 150,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    filter: { valueType: ColumnValueType.NUMBER },
    cell: (row) => (
      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
        {formatVnd(row.totalPaidPrincipal || 0)}
      </span>
    ),
  },
  {
    key: "remainingPrincipal",
    label: t("v2.loans.columns.remaining", "Dư nợ còn lại"),
    size: 160,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    filter: { valueType: ColumnValueType.NUMBER },
    cell: (row) => (
      <span className="font-semibold text-amber-600 dark:text-amber-400">
        {formatVnd(row.remainingPrincipal ?? row.principalAmount)}
      </span>
    ),
  },
  {
    key: "annualInterestRate",
    label: t("v2.loans.columns.rate", "Lãi suất"),
    size: 110,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    cell: (row) => <span>{row.annualInterestRate}%/năm</span>,
  },
  {
    key: "tenorMonths",
    label: t("v2.loans.columns.tenor", "Kỳ hạn"),
    size: 100,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    cell: (row) => <span>{row.tenorMonths} tháng</span>,
  },
  {
    key: "status",
    label: t("v2.loans.columns.status", "Trạng thái"),
    size: 120,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    cell: (row) => {
      const cfg = STATUS_MAP[row.status] || {
        label: row.status,
        variant: "outline",
      };
      return <V2Badge variant={cfg.variant}>{cfg.label}</V2Badge>;
    },
  },
];
