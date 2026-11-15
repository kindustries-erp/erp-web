import type { PurchaseOrderLineColumn } from "./PurchaseOrderLinesTable.type";
import {
  renderAmountCell,
  renderDescriptionCell,
  renderIndexCell,
  renderItemCodeCell,
  renderItemNameCell,
  renderQtyOrderedCell,
  renderQtyReceivedCell,
  renderRemoveCell,
  renderUnitPriceCell,
} from "./PurchaseOrderLinesTable.cells";

/** Cấu hình cột bảng dòng hàng PO; nhãn đi qua `v2.purchaseOrders.lines.*` */
export const PURCHASE_ORDER_LINES_COLUMNS: PurchaseOrderLineColumn[] = [
  {
    id: "index",
    headerKey: "v2.table.indexHeader",
    defaultHeader: "#",
    layout: { width: 40, align: "center" },
    renderCell: renderIndexCell,
  },
  {
    id: "itemCode",
    headerKey: "v2.purchaseOrders.lines.itemCode",
    defaultHeader: "Mã hàng",
    layout: { width: 112, align: "left" },
    renderCell: renderItemCodeCell,
  },
  {
    id: "itemName",
    headerKey: "v2.purchaseOrders.lines.itemName",
    defaultHeader: "Tên hàng",
    layout: { grow: true, minWidth: 160, align: "left", wrap: true },
    renderCell: renderItemNameCell,
  },
  {
    id: "description",
    headerKey: "v2.purchaseOrders.lines.description",
    defaultHeader: "Mô tả",
    layout: { width: 160, align: "left", wrap: true },
    renderCell: renderDescriptionCell,
  },
  {
    id: "qtyOrdered",
    headerKey: "v2.purchaseOrders.lines.qtyOrdered",
    defaultHeader: "SL đặt",
    layout: { width: 96, align: "right" },
    renderCell: renderQtyOrderedCell,
  },
  {
    id: "qtyReceived",
    headerKey: "v2.purchaseOrders.lines.qtyReceived",
    defaultHeader: "SL đã nhận",
    layout: { width: 96, align: "right" },
    hideWhenCreating: true,
    renderCell: renderQtyReceivedCell,
  },
  {
    id: "unitPrice",
    headerKey: "v2.purchaseOrders.lines.unitPrice",
    defaultHeader: "Đơn giá",
    layout: { width: 128, align: "right" },
    renderCell: renderUnitPriceCell,
  },
  {
    id: "amount",
    headerKey: "v2.purchaseOrders.lines.amount",
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
