import { V2TableText, V2Text } from "@/v2/shared/components";
import type { V2Column } from "@/v2/shared/components";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { StockVoucherRow } from "../../../domain/stockVoucher";
import type { StockVoucherTypeConfig } from "../../../inventoryMovements.config.type";
import {
  StockVoucherStatusBadge,
  StockVoucherTypeBadge,
} from "../../molecules/stock-voucher-badges";

type Translate = (key: string, fallback?: string) => string;
const dash = (text?: string | null) => (text ? text : "—");

/** Cột STT do V2StandardTable tự render, không khai báo ở đây */
export const buildStockVoucherColumns = (
  t: Translate,
  types: readonly StockVoucherTypeConfig[],
  openDetail: (row: StockVoucherRow) => void,
): V2Column<StockVoucherRow>[] => [
  {
    key: "voucherNo",
    label: t("v2.inventoryMovements.columns.voucherNo", "Số phiếu"),
    size: 170,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2TableText
        text={dash(row.voucherNo)}
        enableCopy
        onDetailClick={() => openDetail(row)}
      />
    ),
  },
  {
    key: "type",
    label: t("v2.inventoryMovements.columns.type", "Loại phiếu"),
    size: 150,
    enableResizing: true,
    mobileSlot: "subtitle",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: types.map((item) => ({
        value: item.code,
        label: t(item.labelKey, item.labelFallback),
      })),
    },
    cell: (row) => <StockVoucherTypeBadge type={row.type} types={types} />,
  },
  {
    key: "voucherDate",
    label: t("v2.inventoryMovements.columns.voucherDate", "Ngày phiếu"),
    size: 135,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) =>
      row.voucherDate
        ? new Intl.DateTimeFormat("vi-VN").format(new Date(row.voucherDate))
        : "—",
  },
  {
    key: "partnerName",
    label: t("v2.inventoryMovements.columns.partnerName", "Đối tác"),
    size: 200,
    enableResizing: true,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <V2Text
        as="span"
        variant="body-sm"
        className="block truncate font-medium"
      >
        {dash(row.partnerName)}
      </V2Text>
    ),
  },
  {
    key: "totalAmount",
    label: t("v2.inventoryMovements.columns.totalAmount", "Tổng tiền (VNĐ)"),
    size: 150,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.NUMBER },
    summary: { variant: "qty" },
    cell: (row) => (
      <V2Text
        as="span"
        variant="body-sm"
        className="block text-right tabular-nums font-semibold text-primary"
      >
        {Number(row.totalAmount ?? 0).toLocaleString("vi-VN")}
      </V2Text>
    ),
  },
  {
    key: "status",
    label: t("v2.inventoryMovements.columns.status", "Trạng thái"),
    size: 130,
    enableResizing: true,
    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        {
          value: "DRAFT",
          label: t("v2.inventoryMovements.status.draft", "Nháp"),
        },
        {
          value: "POSTED",
          label: t("v2.inventoryMovements.status.posted", "Đã ghi sổ"),
        },
        {
          value: "CANCELLED",
          label: t("v2.inventoryMovements.status.cancelled", "Đã hủy"),
        },
      ],
    },
    cell: (row) => <StockVoucherStatusBadge status={row.status} />,
  },
  {
    key: "remarks",
    label: t("v2.inventoryMovements.columns.remarks", "Ghi chú"),
    size: 200,
    enableResizing: true,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.TEXT, showBlankOption: true },
    cell: (row) => (
      <V2Text
        as="span"
        variant="body-sm"
        className="block truncate text-muted-fg"
      >
        {dash(row.remarks)}
      </V2Text>
    ),
  },
];
