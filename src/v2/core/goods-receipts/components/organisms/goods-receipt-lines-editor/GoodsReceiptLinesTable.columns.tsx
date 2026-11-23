import type { GoodsReceiptLineColumn } from "./GoodsReceiptLinesTable.type";
import {
  renderAmountCell,
  renderIndexCell,
  renderItemCodeCell,
  renderItemNameCell,
  renderQtyCell,
  renderRemoveCell,
  renderUnitCell,
  renderUnitCostCell,
} from "./GoodsReceiptLinesTable.cells";

/** Cấu hình cột của bảng dòng phụ tùng; nhãn đi qua `v2.goodsReceipts.lines.*` */
export const GOODS_RECEIPT_LINES_COLUMNS: GoodsReceiptLineColumn[] = [
  {
    id: "index",
    headerKey: "v2.table.indexHeader",
    defaultHeader: "#",
    layout: { width: 40, align: "center" },
    renderCell: renderIndexCell,
  },
  {
    id: "itemCode",
    headerKey: "v2.goodsReceipts.lines.partCode",
    defaultHeader: "Mã PT",
    layout: { width: 112, align: "left" },
    renderCell: renderItemCodeCell,
  },
  {
    id: "itemName",
    headerKey: "v2.goodsReceipts.lines.partName",
    defaultHeader: "Tên phụ tùng",
    layout: { grow: true, minWidth: 180, align: "left", wrap: true },
    renderCell: renderItemNameCell,
  },
  {
    id: "unit",
    headerKey: "v2.goodsReceipts.lines.unit",
    defaultHeader: "ĐVT",
    layout: { width: 72, align: "center" },
    renderCell: renderUnitCell,
  },
  {
    id: "qtyReceived",
    headerKey: "v2.goodsReceipts.lines.qty",
    defaultHeader: "Số lượng",
    layout: { width: 96, align: "right" },
    renderCell: renderQtyCell,
  },
  {
    id: "unitCost",
    headerKey: "v2.goodsReceipts.lines.cost",
    defaultHeader: "Đơn giá",
    layout: { width: 128, align: "right" },
    renderCell: renderUnitCostCell,
  },
  {
    id: "amount",
    headerKey: "v2.goodsReceipts.lines.amount",
    defaultHeader: "Thành tiền",
    layout: { width: 150, align: "right" },
    renderCell: renderAmountCell,
  },
  {
    id: "actions",
    headerKey: "",
    defaultHeader: "",
    layout: { width: 40, align: "center" },
    hideWhenViewing: true,
    renderCell: renderRemoveCell,
  },
];
