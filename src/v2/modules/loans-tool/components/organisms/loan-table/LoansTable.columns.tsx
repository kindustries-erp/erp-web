import React from "react";
import {
  V2Badge,
  V2TableText,
  V2Text,
  type V2Column,
} from "@/v2/shared/components";
import { getLoanStatusConfig, LoanItem } from "@/v2/core/loans";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";

type Translate = (key: string, fallback?: string) => string;

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
      <V2Text as="span" weight="medium" className="truncate block">
        {row.title}
      </V2Text>
    ),
  },
  {
    key: "lenderName",
    label: t("v2.loans.columns.lender", "Ngân hàng / Đơn vị vay"),
    size: 180,
    enableResizing: true,
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2Text as="span" color="muted" className="truncate block">
        {row.lenderName}
      </V2Text>
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
      <V2Text as="span" weight="semibold" className="text-foreground">
        {formatVnd(row.principalAmount)}
      </V2Text>
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
      <V2Text
        as="span"
        weight="medium"
        className="text-emerald-600 dark:text-emerald-400"
      >
        {formatVnd(row.totalPaidPrincipal || 0)}
      </V2Text>
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
      <V2Text
        as="span"
        weight="semibold"
        className="text-amber-600 dark:text-amber-400"
      >
        {formatVnd(row.remainingPrincipal ?? row.principalAmount)}
      </V2Text>
    ),
  },
  {
    key: "annualInterestRate",
    label: t("v2.loans.columns.rate", "Lãi suất"),
    size: 110,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    cell: (row) => (
      <V2Text as="span">
        {row.annualInterestRate}
        {t("v2.loans.columns.ratePerYearSuffix", "%/năm")}
      </V2Text>
    ),
  },
  {
    key: "tenorMonths",
    label: t("v2.loans.columns.tenor", "Kỳ hạn"),
    size: 100,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    cell: (row) => (
      <V2Text as="span">
        {row.tenorMonths} {t("v2.loans.columns.monthsSuffix", "tháng")}
      </V2Text>
    ),
  },
  {
    key: "status",
    label: t("v2.loans.columns.status", "Trạng thái"),
    size: 120,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    cell: (row) => {
      const cfg = getLoanStatusConfig(row.status, t);
      return <V2Badge variant={cfg.variant}>{cfg.label}</V2Badge>;
    },
  },
];
