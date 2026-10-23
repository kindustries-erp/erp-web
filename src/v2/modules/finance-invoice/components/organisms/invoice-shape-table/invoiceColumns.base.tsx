import {
  V2CopyButton,
  V2TableDateCell,
  headerFilter,
  type V2Column,
} from "@/v2/shared/components";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { Badge } from "@/v2/shared/ui";
import {
  BRANCHES,
  POSTING_OPTIONS,
  formatMoney,
  type FakeInvoice,
  type InvoiceDirection,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { TAX_INVOICE_STATUS_OPTIONS } from "./invoiceColumns.constants";

const money = (value?: number | null) => (
  <span className="tabular-nums">{formatMoney(value ?? 0)}</span>
);

export const getBaseInvoiceColumns = (
  onOpen: (id: string) => void,
  direction: InvoiceDirection = "IN",
): V2Column<FakeInvoice>[] => [
  {
    key: "invoiceNo",
    ...headerFilter("Số / Ký hiệu HĐ", { showBlankOption: true }),
    size: 190,
    mobileSlot: "title",
    cell: (row) => (
      <div className="flex items-center gap-1 font-mono text-xs">
        <button
          type="button"
          className="font-semibold text-primary underline-offset-2 hover:underline"
          onClick={() => onOpen(row.id)}
        >
          {`${row.serialNo ? `${row.serialNo}-` : ""}${row.invoiceNo}`}
        </button>
        <V2CopyButton
          value={`${row.serialNo ? `${row.serialNo}-` : ""}${row.invoiceNo}`}
        />
      </div>
    ),
  },
  {
    key: "invoiceDate",
    ...headerFilter.date("Ngày lập"),
    size: 120,
    mobileSlot: "meta",
    cell: (row) => <V2TableDateCell date={row.invoiceDate} />,
  },
  {
    key: "partner",
    ...headerFilter("Đối tác / MST"),
    size: 280,
    mobileSlot: "subtitle",
    cell: (row) => (
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-foreground">
          {row.partner ||
            (direction === "IN" ? row.sellerName : row.buyerName) ||
            "-"}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {row.taxCode ||
            (direction === "IN" ? row.sellerTaxCode : row.buyerTaxCode) ||
            "-"}
        </span>
      </div>
    ),
  },
  {
    key: "preVatAmount",
    ...headerFilter.amount("Tiền trước thuế"),
    size: 150,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    accessor: (r) => r.preVatAmount ?? r.preVat,
    cell: (row) => money(row.preVatAmount ?? row.preVat),
    summary: { variant: "amount", metricTitle: "Tiền trước thuế" },
  },
  {
    key: "vatAmount",
    ...headerFilter.amount("Tiền thuế"),
    size: 140,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    accessor: (r) => r.vatAmount ?? r.vat,
    cell: (row) => money(row.vatAmount ?? row.vat),
    summary: { variant: "amount", metricTitle: "Tiền thuế" },
  },
  {
    key: "totalAmount",
    ...headerFilter.amount("Tổng tiền"),
    size: 160,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    accessor: (r) => r.totalAmount ?? r.total,
    cell: (row) => money(row.totalAmount ?? row.total),
    summary: { variant: "amount", metricTitle: "Tổng tiền" },
  },
  {
    key: "taxInvoiceStatus",
    ...headerFilter.select("Trạng thái HĐ", TAX_INVOICE_STATUS_OPTIONS),
    size: 150,
    mobileSlot: "meta",
    cell: (row) => {
      const val = String(
        row.taxInvoiceStatus ?? (row.taxTab === "new" ? "1" : "3"),
      );
      const opt = TAX_INVOICE_STATUS_OPTIONS.find((o) => o.value === val);
      return <Badge variant="outline">{opt?.label ?? "Hóa đơn mới"}</Badge>;
    },
  },
  {
    key: "posting",
    ...headerFilter.select("Hạch toán", POSTING_OPTIONS),
    size: 140,
    mobileSlot: "meta",
    cell: (row) => (
      <Badge
        variant={
          row.posting === "POSTED" || row.postingStatus === "POSTED"
            ? "success"
            : "warning"
        }
      >
        {row.posting === "POSTED" || row.postingStatus === "POSTED"
          ? "Đã hạch toán"
          : "Chưa hạch toán"}
      </Badge>
    ),
  },
  {
    key: "branchId",
    ...headerFilter.select("Chi nhánh", BRANCHES),
    size: 160,
    mobileSlot: "hidden",
    cell: (row) =>
      row.branchName ||
      BRANCHES.find((b) => b.value === row.branchId)?.label ||
      "-",
  },
];
