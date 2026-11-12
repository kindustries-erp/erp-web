import React from "react";
import {
  V2Badge,
  V2TableText,
  V2Text,
  type V2Column,
} from "@/v2/shared/components";
import { headerFilter } from "@/v2/shared/components/organisms/v2-standard-table/utils/v2HeaderFilterBuilder";
import {
  getAmortizationMethodOptions,
  getLoanStatusConfig,
  getLoanStatusOptions,
  LoanItem,
} from "@/v2/core/loans";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { buildLoanAmountColumns } from "./LoansTable.columns.amounts";

type Translate = (key: string, fallback?: string) => string;

const formatDate = (val?: string | null) => (val ? val.slice(0, 10) : "—");

export const buildLoanColumns = (
  t: Translate,
  openDetail?: (id: string) => void,
): V2Column<LoanItem>[] => {
  const methodOptions = getAmortizationMethodOptions(t);
  const methodLabels = new Map(methodOptions.map((m) => [m.value, m.label]));

  return [
    {
      key: "loanCode",
      ...headerFilter(t("v2.loans.columns.code", "Mã vay"), {
        showBlankOption: false,
      }),
      size: 150,
      mobileSlot: "title",
      summary: {
        variant: "label",
        label: t("v2.loans.columns.summaryTotal", "Tổng cộng:"),
      },
      cell: (row) => (
        <V2TableText
          text={row.loanCode}
          enableCopy
          onTextClick={openDetail ? () => openDetail(row.id) : undefined}
          onDetailClick={openDetail ? () => openDetail(row.id) : undefined}
        />
      ),
    },
    {
      key: "title",
      ...headerFilter(t("v2.loans.columns.title", "Tên khoản vay")),
      size: 210,
      mobileSlot: "meta",
      cell: (row) => (
        <V2Text as="span" weight="medium" className="truncate block">
          {row.title}
        </V2Text>
      ),
    },
    {
      key: "lenderName",
      ...headerFilter(t("v2.loans.columns.lender", "Ngân hàng / Đơn vị vay")),
      size: 180,
      mobileSlot: "meta",
      cell: (row) => (
        <V2Text as="span" color="muted" className="truncate block">
          {row.lenderName}
        </V2Text>
      ),
    },
    {
      key: "startDate",
      ...headerFilter.date(t("v2.loans.columns.startDate", "Ngày giải ngân")),
      size: 130,
      align: TableColumnAlign.RIGHT,
      mobileSlot: "subtitle",
      cell: (row) => formatDate(row.startDate),
    },
    {
      key: "firstPaymentDate",
      ...headerFilter.date(
        t("v2.loans.columns.firstPaymentDate", "Kỳ đầu tiên"),
      ),
      size: 130,
      align: TableColumnAlign.RIGHT,
      mobileSlot: "hidden",
      cell: (row) => formatDate(row.firstPaymentDate),
    },
    ...buildLoanAmountColumns(t),
    {
      key: "annualInterestRate",
      ...headerFilter.qty(t("v2.loans.columns.rate", "Lãi suất")),
      size: 115,
      align: TableColumnAlign.RIGHT,
      mobileSlot: "hidden",
      cell: (row) => (
        <V2Text as="span">
          {row.annualInterestRate}
          {t("v2.loans.columns.ratePerYearSuffix", "%/năm")}
        </V2Text>
      ),
    },
    {
      key: "tenorMonths",
      ...headerFilter.qty(t("v2.loans.columns.tenor", "Kỳ hạn")),
      size: 105,
      align: TableColumnAlign.CENTER,
      mobileSlot: "hidden",
      cell: (row) => (
        <V2Text as="span">
          {row.tenorMonths} {t("v2.loans.columns.monthsSuffix", "tháng")}
        </V2Text>
      ),
    },
    {
      key: "amortizationMethod",
      ...headerFilter.select(
        t("v2.loans.columns.amortizationMethod", "Phương thức"),
        methodOptions,
      ),
      size: 180,
      mobileSlot: "hidden",
      cell: (row) => (
        <V2Text as="span" color="muted" className="truncate block">
          {methodLabels.get(row.amortizationMethod) ?? row.amortizationMethod}
        </V2Text>
      ),
    },
    {
      key: "status",
      ...headerFilter.select(
        t("v2.loans.columns.status", "Trạng thái"),
        getLoanStatusOptions(t),
      ),
      size: 125,
      align: TableColumnAlign.CENTER,
      mobileSlot: "badge",
      cell: (row) => {
        const cfg = getLoanStatusConfig(row.status, t);
        return <V2Badge variant={cfg.variant}>{cfg.label}</V2Badge>;
      },
    },
  ];
};
