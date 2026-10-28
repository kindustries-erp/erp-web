import { headerFilter, type V2Column } from "@/v2/shared/components";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import {
  formatMoney,
  type FakeInvoice,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { VAT_RATE_OPTIONS } from "./invoiceColumns.constants";

const money = (value?: number | null) => (
  <span className="tabular-nums">{formatMoney(value ?? 0)}</span>
);

export const getAuditInvoiceColumns = (): V2Column<FakeInvoice>[] => [
  {
    key: "vatRate",
    ...headerFilter.select("Thuế suất", VAT_RATE_OPTIONS),
    size: 110,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    cell: (row) => (row.vatAmount ? "10%" : "0%"),
  },
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
