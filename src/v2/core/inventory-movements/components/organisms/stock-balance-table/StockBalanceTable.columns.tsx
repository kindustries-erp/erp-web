import { V2TableText, V2Text } from "@/v2/shared/components";
import type { V2Column } from "@/v2/shared/components";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { StockBalanceRow } from "../../../domain/stockBalance";

type Translate = (key: string, fallback?: string) => string;
const num = (value: number) => Number(value ?? 0).toLocaleString("vi-VN");

const numberCell = (value: number, danger = false) => (
  <V2Text
    as="span"
    variant="body-sm"
    className={`block text-right tabular-nums ${danger ? "font-semibold text-destructive" : ""}`}
  >
    {num(value)}
  </V2Text>
);

export const buildStockBalanceColumns = (
  t: Translate,
  openLedger: (row: StockBalanceRow) => void,
): V2Column<StockBalanceRow>[] => [
  {
    key: "itemCode",
    label: t("v2.inventoryMovements.balance.itemCode", "Mã hàng"),
    size: 160,
    enableResizing: true,
    mobileSlot: "title",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2TableText
        text={row.itemCode}
        enableCopy
        onDetailClick={() => openLedger(row)}
      />
    ),
  },
  {
    key: "itemName",
    label: t("v2.inventoryMovements.balance.itemName", "Tên hàng"),
    size: 260,
    enableResizing: true,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2Text as="span" variant="body-sm" className="block truncate">
        {row.itemName}
      </V2Text>
    ),
  },
  {
    key: "unit",
    label: t("v2.inventoryMovements.balance.unit", "ĐVT"),
    size: 90,
    enableResizing: true,
    mobileSlot: "hidden",
    cell: (row) => row.unit,
  },
  {
    key: "qtyReceived",
    label: t("v2.inventoryMovements.balance.qtyReceived", "Nhập"),
    size: 110,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.NUMBER },
    summary: { variant: "qty" },
    cell: (row) => numberCell(row.qtyReceived),
  },
  {
    key: "qtyIssued",
    label: t("v2.inventoryMovements.balance.qtyIssued", "Xuất"),
    size: 110,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.NUMBER },
    summary: { variant: "qty" },
    cell: (row) => numberCell(row.qtyIssued),
  },
  {
    key: "qtyAdjusted",
    label: t("v2.inventoryMovements.balance.qtyAdjusted", "Điều chỉnh"),
    size: 120,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.NUMBER },
    summary: { variant: "qty" },
    cell: (row) => (
      <V2Text
        as="span"
        variant="body-sm"
        className={`block text-right tabular-nums ${row.qtyAdjusted < 0 ? "text-destructive" : ""}`}
      >
        {row.qtyAdjusted > 0 ? "+" : ""}
        {num(row.qtyAdjusted)}
      </V2Text>
    ),
  },
  {
    key: "qtyOnHand",
    label: t("v2.inventoryMovements.balance.qtyOnHand", "Tồn kho"),
    size: 120,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    filter: { valueType: ColumnValueType.NUMBER },
    summary: { variant: "qty" },
    cell: (row) => numberCell(row.qtyOnHand, row.qtyOnHand < 0),
  },
  {
    key: "avgCost",
    label: t("v2.inventoryMovements.balance.avgCost", "Giá vốn BQ"),
    size: 130,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    cell: (row) => numberCell(row.avgCost),
  },
  {
    key: "inventoryValue",
    label: t("v2.inventoryMovements.balance.inventoryValue", "Giá trị tồn"),
    size: 150,
    enableResizing: true,
    align: TableColumnAlign.RIGHT,
    mobileSlot: "meta",
    summary: { variant: "qty" },
    cell: (row) => numberCell(row.inventoryValue),
  },
];
