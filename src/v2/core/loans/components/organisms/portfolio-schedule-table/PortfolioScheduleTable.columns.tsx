import React from "react";
import { V2Text, type V2Column } from "@/v2/shared/components";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import { formatVndCurrency } from "../../../domain/rules/loan-format.rule";
import type { PortfolioMonthlyPeriod } from "../../../domain/types/loan.types";

type Translate = (key: string, fallback?: string) => string;

export function buildPortfolioScheduleColumns(
  t: Translate,
  hasAnyBreakdown: boolean,
): V2Column<PortfolioMonthlyPeriod>[] {
  return [
    {
      key: "monthKey",
      label: t("v2.loans.table.month", "Tháng"),
      size: 110,
      enableResizing: true,
      mobileSlot: "title",
      filter: { valueType: ColumnValueType.TEXT },
      summary: {
        variant: "label",
        label: t("v2.loans.table.totalPortfolio", "Tổng cộng:"),
      },
      cell: (row) => (
        <V2Text as="span" weight="semibold" className="text-foreground">
          {row.monthKey}
        </V2Text>
      ),
    },
    hasAnyBreakdown
      ? {
          key: "paymentDate",
          label: t("v2.loans.table.dueDate", "Ngày thanh toán"),
          size: 130,
          enableResizing: true,
          mobileSlot: "subtitle",
          filter: { valueType: ColumnValueType.TEXT },
          cell: (row) => (
            <V2Text as="span" color="muted" className="font-mono tabular-nums">
              {row.paymentDate}
            </V2Text>
          ),
        }
      : {
          key: "loansCount",
          label: t("v2.loans.table.activeLoans", "Số HĐ"),
          size: 90,
          enableResizing: true,
          align: TableColumnAlign.CENTER,
          mobileSlot: "subtitle",
          filter: { valueType: ColumnValueType.NUMBER },
          cell: (row) => (
            <V2Text as="span" color="muted" className="font-mono tabular-nums">
              {row.loansCount}
            </V2Text>
          ),
        },
    {
      key: "principalDue",
      label: t("v2.loans.table.principalDue", "Gốc phải trả"),
      size: 150,
      enableResizing: true,
      align: TableColumnAlign.RIGHT,
      mobileSlot: "meta",
      filter: { valueType: ColumnValueType.NUMBER },
      summary: {
        variant: "amount",
        metricTitle: t("v2.loans.table.totalPrincipal", "Tổng gốc phải trả"),
      },
      cell: (row) => (
        <V2Text
          as="span"
          weight="medium"
          className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400"
        >
          {formatVndCurrency(row.principalDue)}
        </V2Text>
      ),
    },
    {
      key: "interestDue",
      label: t("v2.loans.table.interestDue", "Lãi phải trả"),
      size: 150,
      enableResizing: true,
      align: TableColumnAlign.RIGHT,
      mobileSlot: "meta",
      filter: { valueType: ColumnValueType.NUMBER },
      summary: {
        variant: "amount",
        metricTitle: t("v2.loans.table.totalInterest", "Tổng lãi phải trả"),
      },
      cell: (row) => (
        <V2Text
          as="span"
          className="font-mono tabular-nums text-amber-600 dark:text-amber-400"
        >
          {formatVndCurrency(row.interestDue)}
        </V2Text>
      ),
    },
    {
      key: "totalPayment",
      label: t("v2.loans.table.totalDue", "Tổng phải trả"),
      size: 160,
      enableResizing: true,
      align: TableColumnAlign.RIGHT,
      mobileSlot: "badge",
      filter: { valueType: ColumnValueType.NUMBER },
      summary: {
        variant: "amount",
        metricTitle: t("v2.loans.table.totalPayment", "Tổng tiền phải trả"),
      },
      cell: (row) => (
        <V2Text
          as="span"
          weight="bold"
          className="font-mono tabular-nums text-foreground"
        >
          {formatVndCurrency(row.totalPayment)}
        </V2Text>
      ),
    },
    {
      key: "remainingPrincipal",
      label: t("v2.loans.table.endingBalance", "Dư nợ còn lại"),
      size: 160,
      enableResizing: true,
      align: TableColumnAlign.RIGHT,
      mobileSlot: "meta",
      filter: { valueType: ColumnValueType.NUMBER },
      cell: (row) => (
        <V2Text as="span" color="muted" className="font-mono tabular-nums">
          {formatVndCurrency(row.remainingPrincipal)}
        </V2Text>
      ),
    },
  ];
}
