import { headerFilter, V2Text, type V2Column } from "@/v2/shared/components";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import {
  formatMoney,
  type FakeInvoice,
  type InvoiceDirection,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { Badge } from "@/v2/shared/ui";
import {
  PDF_SOURCE_OPTIONS,
  VAT_RATE_OPTIONS,
} from "./invoiceColumns.constants";

const money = (value?: number | null) => (
  <span className="tabular-nums">{formatMoney(value ?? 0)}</span>
);

/** Thuế suất theo giá trị API: -1 là KCT, -2 là KTT, còn lại là phần trăm */
const formatVatRate = (value?: number | null) => {
  if (value === -1) return "KCT";
  if (value === -2) return "KTT";
  return value == null ? "-" : `${value}%`;
};

export const getAuditInvoiceColumns = (
  direction: InvoiceDirection = "IN",
): V2Column<FakeInvoice>[] => [
  {
    key: "vatRate",
    ...headerFilter.select("Thuế suất", VAT_RATE_OPTIONS),
    size: 110,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    cell: (row) => formatVatRate(row.vatRate),
  },
  {
    key: "discountAmount",
    ...headerFilter.amount("Chiết khấu"),
    size: 140,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    cell: (row) => money(row.discountAmount),
    summary: { variant: "amount", metricTitle: "Chiết khấu" },
  },
  ...(direction === "OUT"
    ? [
        {
          key: "settlementOrder",
          ...headerFilter("Lệnh thanh toán"),
          size: 160,
          mobileSlot: "hidden" as const,
          cell: (row: FakeInvoice) => row.settlementOrder || "-",
        },
        {
          key: "licensePlate",
          ...headerFilter("Biển số"),
          size: 130,
          mobileSlot: "hidden" as const,
          cell: (row: FakeInvoice) => row.licensePlate || "-",
        },
      ]
    : []),
  {
    key: "netOffAmount",
    ...headerFilter.amount("Đã cấn trừ"),
    size: 150,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    accessor: (r) => r.netOffAmount ?? r.paid,
    cell: (row) => money(row.netOffAmount ?? row.paid),
    summary: { variant: "amount", metricTitle: "Đã cấn trừ" },
  },
  {
    key: "remainingAmount",
    ...headerFilter.amount("Còn lại"),
    size: 150,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    accessor: (r) =>
      r.remainingAmount ??
      (r.totalAmount ?? r.total) - (r.netOffAmount ?? r.paid),
    cell: (row) =>
      money(
        row.remainingAmount ??
          (row.totalAmount ?? row.total) - (row.netOffAmount ?? row.paid),
      ),
    summary: { variant: "amount", metricTitle: "Còn lại" },
  },
  {
    key: "pdfSource",
    ...headerFilter.select("PDF gốc", PDF_SOURCE_OPTIONS),
    size: 160,
    mobileSlot: "hidden",
    cell: (row) => {
      if (!row.pdfSource)
        return (
          <V2Text as="span" variant="body-sm" color="muted">
            -
          </V2Text>
        );
      const opt = PDF_SOURCE_OPTIONS.find((o) => o.value === row.pdfSource);
      const variant =
        row.pdfSource === "failed"
          ? "destructive"
          : row.pdfSource === "provider_original"
            ? "success"
            : "outline";
      return (
        <Badge variant={variant} title={row.pdfError ?? undefined}>
          {opt?.label ?? row.pdfSource}
        </Badge>
      );
    },
  },
  {
    key: "note",
    ...headerFilter("Ghi chú"),
    size: 200,
    mobileSlot: "hidden",
    cell: (row) => (
      <span className="text-muted-foreground truncate block">
        {row.note || row.notes || row.description || "-"}
      </span>
    ),
  },
];
