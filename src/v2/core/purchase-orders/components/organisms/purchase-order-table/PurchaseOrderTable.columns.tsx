import { V2Badge, V2BadgeVariant, V2TableText } from "@/v2/shared/components";
import type { V2Column } from "@/v2/shared/components";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import { PurchaseOrderStatusBadge } from "../../molecules/purchase-order-status-badge";
import type { PurchaseOrderRecord } from "../../../domain/purchaseOrder";

type Translate = (key: string, fallback?: string) => string;

const value = (text?: string | number | null) =>
  text === null || text === undefined || text === "" ? "—" : String(text);

const formatDate = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat("vi-VN").format(new Date(iso)) : "—";

/** Cột STT do V2StandardTable tự render (`__index`), không khai báo ở đây */
export const buildPurchaseOrderColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<PurchaseOrderRecord>[] => [
  {
    key: "poNo",
    label: t("v2.purchaseOrders.columns.poNo", "Số đơn"),
    size: 170,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2TableText
        text={value(row.poNo)}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "orderDate",
    label: t("v2.purchaseOrders.columns.orderDate", "Ngày đặt"),
    size: 135,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) => formatDate(row.orderDate),
  },
  {
    key: "expectedDate",
    label: t("v2.purchaseOrders.columns.expectedDate", "Ngày dự kiến"),
    size: 135,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) => formatDate(row.expectedDate),
  },
  {
    key: "supplierName",
    label: t("v2.purchaseOrders.columns.supplierName", "Nhà cung cấp"),
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
    label: t("v2.purchaseOrders.columns.branchName", "Chi nhánh"),
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
    label: t("v2.purchaseOrders.columns.totalAmount", "Tổng tiền (VNĐ)"),
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
    label: t("v2.purchaseOrders.columns.status", "Trạng thái"),
    size: 150,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.STATUS },
    cell: (row) => <PurchaseOrderStatusBadge status={row.status} />,
  },
  {
    key: "paymentStatus",
    label: t("v2.purchaseOrders.columns.paymentStatus", "Thanh toán"),
    size: 130,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate">{value(row.paymentStatus)}</span>
    ),
  },
  {
    key: "inventoryStatus",
    label: t("v2.purchaseOrders.columns.inventoryStatus", "Nhập kho"),
    size: 140,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    mobileSlot: "hidden",
    cell: (row) => (
      <V2Badge variant={V2BadgeVariant.OUTLINE}>
        {row.inventoryStatus
          ? t(
              `v2.purchaseOrders.inventoryStatus.${inventoryKey(row.inventoryStatus)}`,
              value(row.inventoryStatus),
            )
          : "—"}
      </V2Badge>
    ),
  },
  {
    key: "supplierInvoiceNo",
    label: t("v2.purchaseOrders.columns.supplierInvoiceNo", "Số hóa đơn NCC"),
    size: 160,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate">{value(row.supplierInvoiceNo)}</span>
    ),
  },
  {
    key: "remarks",
    label: t("v2.purchaseOrders.columns.remarks", "Ghi chú"),
    size: 200,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <span className="block truncate text-muted-fg">{value(row.remarks)}</span>
    ),
  },
  {
    key: "createdAt",
    label: t("v2.purchaseOrders.columns.createdAt", "Ngày tạo"),
    size: 135,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) => formatDate(row.createdAt),
  },
];

/** Khóa i18n của tiến độ nhập kho (NOT_RECEIVED → notReceived) */
const inventoryKey = (status: string): string =>
  status.toLowerCase().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
