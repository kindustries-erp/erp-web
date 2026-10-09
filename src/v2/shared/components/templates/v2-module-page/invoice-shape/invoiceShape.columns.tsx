import { V2CopyButton } from "@/v2/shared/components/atoms/v2-copy-button";
import { V2TableDateCell } from "@/v2/shared/components/atoms/v2-table-date-cell";
import { headerFilter } from "@/v2/shared/components/organisms/v2-standard-table";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import { Badge } from "@/v2/shared/ui";
import { BRANCHES, POSTING_OPTIONS, formatMoney } from "./invoiceShape.data";
import type { FakeInvoice } from "./invoiceShape.data";

export type InvoiceView = "overview" | "audit";

const money = (value: number) => (
  <span className="tabular-nums">{formatMoney(value)}</span>
);

/** Cột của bảng hóa đơn: số HĐ mở drawer chi tiết, có chế độ xem Tổng quan và Đối soát */
export const buildInvoiceColumns = (
  view: InvoiceView,
  onOpen: (id: string) => void,
): V2Column<FakeInvoice>[] => {
  const columns: V2Column<FakeInvoice>[] = [
    {
      key: "invoiceNo",
      ...headerFilter("Số hóa đơn"),
      size: 190,
      cell: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() => onOpen(row.id)}
          >
            {row.serialNo}-{row.invoiceNo}
          </button>
          <V2CopyButton value={`${row.serialNo}-${row.invoiceNo}`} />
        </div>
      ),
    },
    {
      key: "invoiceDate",
      ...headerFilter.date("Ngày lập"),
      size: 120,
      cell: (row) => <V2TableDateCell date={row.invoiceDate} />,
    },
    {
      key: "partner",
      ...headerFilter("Đối tác"),
      size: 280,
      cell: (row) => (
        <div className="flex flex-col leading-tight">
          <span>{row.partner}</span>
          <span className="text-xs text-muted-foreground">{row.taxCode}</span>
        </div>
      ),
    },
    {
      key: "branchId",
      ...headerFilter.select("Chi nhánh", BRANCHES),
      size: 170,
      cell: (row) => BRANCHES.find((b) => b.value === row.branchId)?.label,
    },
    {
      key: "total",
      ...headerFilter.amount("Tổng tiền"),
      size: 160,
      align: TableColumnAlign.RIGHT,
      cell: (row) => money(row.total),
      summary: { variant: "amount", metricTitle: "Tổng tiền" },
    },
    {
      key: "posting",
      ...headerFilter.select("Hạch toán", POSTING_OPTIONS),
      size: 150,
      cell: (row) => (
        <Badge variant={row.posting === "POSTED" ? "success" : "warning"}>
          {POSTING_OPTIONS.find((o) => o.value === row.posting)?.label}
        </Badge>
      ),
    },
  ];
  if (view === "overview") return columns;
  return [
    ...columns,
    {
      key: "paid",
      label: "Đã thanh toán",
      size: 160,
      align: TableColumnAlign.RIGHT,
      cell: (row) => money(row.paid),
    },
    {
      key: "remaining",
      label: "Còn lại",
      size: 160,
      align: TableColumnAlign.RIGHT,
      cell: (row) => money(row.total - row.paid),
    },
  ];
};
