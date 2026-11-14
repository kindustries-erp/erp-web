import React from "react";
import { V2Text, type V2Column } from "@/v2/shared/components";
import { headerFilter } from "@/v2/shared/components/organisms/v2-standard-table/utils/v2HeaderFilterBuilder";
import { LoanItem } from "@/v2/core/loans";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";

type Translate = (key: string, fallback?: string) => string;

const formatVnd = (val?: number | null) =>
  val == null ? "—" : `${Number(val).toLocaleString("vi-VN")} ₫`;

export const buildLoanAmountColumns = (t: Translate): V2Column<LoanItem>[] => [
  {
    key: "principalAmount",
    ...headerFilter.amount(t("v2.loans.columns.principal", "Số tiền vay")),
    size: 160,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    summary: {
      variant: "amount",
      metricTitle: t("v2.loans.columns.principal", "Số tiền vay"),
    },
    cell: (row) => (
      <V2Text as="span" weight="semibold" className="text-foreground">
        {formatVnd(row.principalAmount)}
      </V2Text>
    ),
  },
  {
    key: "totalPaidPrincipal",
    ...headerFilter.amount(t("v2.loans.columns.paidPrincipal", "Đã trả gốc")),
    size: 150,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    summary: {
      variant: "amount",
      metricTitle: t("v2.loans.columns.paidPrincipal", "Đã trả gốc"),
    },
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
    ...headerFilter.amount(t("v2.loans.columns.remaining", "Dư nợ còn lại")),
    size: 160,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    summary: {
      variant: "amount",
      metricTitle: t("v2.loans.columns.remaining", "Dư nợ còn lại"),
    },
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
];
