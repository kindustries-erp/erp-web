import { V2TableText } from "@/v2/shared/components";
import type { V2Column } from "@/v2/shared/components";
import { GoodsReceiptStatusBadge } from "@/v2/core/goods-receipts";
import type { GoodsReceiptRecord } from "@/v2/core/goods-receipts";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";

type Translate = (key: string, fallback?: string) => string;

const value = (text?: string | number | null) =>
  text === null || text === undefined || text === "" ? "—" : String(text);

/** Cột STT do V2StandardTable tự render (`__index`), không khai báo ở đây */
export const buildGoodsReceiptColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<GoodsReceiptRecord>[] => [
  {
    key: "receiptNo",
    label: t("v2.goodsReceipts.columns.receiptNo", "Mã phiếu"),
    size: 170,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2TableText
        text={value(row.receiptNo)}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "receiptDate",
    label: t("v2.goodsReceipts.columns.receiptDate", "Ngày nhập"),
    size: 135,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) =>
      row.receiptDate
        ? new Intl.DateTimeFormat("vi-VN").format(new Date(row.receiptDate))
        : "—",
  },
  {
    key: "supplierName",
    label: t("v2.goodsReceipts.columns.supplierName", "Nhà cung cấp"),
    size: 200,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate font-medium">
        {value(row.supplierName)}
      </span>
    ),
  },
  {
    key: "branchName",
    label: t("v2.goodsReceipts.columns.branchName", "Chi nhánh"),
    size: 160,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate">{value(row.branchName)}</span>
    ),
  },
  {
    key: "totalAmount",
    label: t("v2.goodsReceipts.columns.totalAmount", "Tổng tiền (VNĐ)"),
    size: 150,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.NUMBER },
    summary: { variant: "qty" },
    cell: (row) => (
      <span className="block text-right tabular-nums font-semibold text-primary">
        {row.totalAmount != null
          ? Number(row.totalAmount).toLocaleString("vi-VN")
          : "0"}
      </span>
    ),
  },
  {
    key: "status",
    label: t("v2.goodsReceipts.columns.status", "Trạng thái"),
    size: 130,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        {
          value: "DRAFT",
          label: t("v2.goodsReceipts.status.draft", "Nháp"),
        },
        {
          value: "POSTED",
          label: t("v2.goodsReceipts.status.posted", "Đã ghi sổ"),
        },
        {
          value: "CANCELLED",
          label: t("v2.goodsReceipts.status.cancelled", "Đã hủy"),
        },
      ],
    },
    cell: (row) => <GoodsReceiptStatusBadge status={row.status ?? ""} />,
  },
  {
    key: "remarks",
    label: t("v2.goodsReceipts.columns.remarks", "Ghi chú"),
    size: 200,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate text-muted-fg">{value(row.remarks)}</span>
    ),
  },
];
