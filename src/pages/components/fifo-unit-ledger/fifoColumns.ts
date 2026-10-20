/**
 * Cấu hình cột của bảng FIFO: tiêu đề i18n, căn lề và lớp màu theo nhóm.
 * Thứ tự phần tử = thứ tự cột trong hàng tiêu đề thứ hai.
 */

export type FifoAlign = "center" | "right";

export interface FifoHeaderColumn {
  /** Khóa dữ liệu dòng và khóa sắp xếp/lọc. */
  key: string;
  /** Khóa i18n và chuỗi mặc định (giữ nguyên chữ hiển thị cũ khi chưa có bản dịch). */
  titleKey: string;
  titleDefault: string;
  align: FifoAlign;
  className: string;
}

export interface FifoGroupHeader {
  titleKey: string;
  titleDefault: string;
  colSpan: number;
  className: string;
}

export const FIFO_GENERAL_GROUP: FifoGroupHeader = {
  titleKey: "vinfastParts:FIFO_GENERAL_GROUP",
  titleDefault: "THÔNG TIN CHUNG",
  colSpan: 2,
  className:
    "px-3 py-2 border-r border-slate-200 font-semibold text-center bg-slate-100/75 shadow-[0_1px_0_0_var(--border-light)]",
};

export const FIFO_GROUP_HEADERS: FifoGroupHeader[] = [
  {
    titleKey: "vinfastParts:INBOUND_GROUP",
    titleDefault: "NHẬP KHO",
    colSpan: 3,
    className:
      "px-3 py-2 border-r border-slate-200 font-semibold text-center bg-orange-50/75 text-orange-800 shadow-[0_1px_0_0_var(--border-light)]",
  },
  {
    titleKey: "vinfastParts:OUTBOUND_FIFO_GROUP",
    titleDefault: "XUẤT KHO - FIFO",
    colSpan: 3,
    className:
      "px-3 py-2 border-r border-slate-200 font-semibold text-center bg-emerald-50/75 text-emerald-800 shadow-[0_1px_0_0_var(--border-light)]",
  },
  {
    titleKey: "vinfastParts:STOCK_GROUP",
    titleDefault: "TỒN KHO",
    colSpan: 2,
    className:
      "px-3 py-2 border-r border-slate-200 font-semibold text-center bg-blue-50/75 text-blue-800 shadow-[0_1px_0_0_var(--border-light)]",
  },
];

export const FIFO_PERFORMANCE_GROUP: FifoGroupHeader = {
  titleKey: "vinfastParts:FIFO_PERFORMANCE_GROUP",
  titleDefault: "HIỆU QUẢ KINH DOANH",
  colSpan: 7,
  className:
    "px-3 py-2 font-semibold text-center bg-purple-50/75 text-purple-800 shadow-[0_1px_0_0_var(--border-light)]",
};

const SHADOW = "shadow-[0_1px_0_0_var(--border-light)]";

/** Các cột có thể sắp xếp/lọc ở hàng tiêu đề thứ hai, sau cột Ngày. */
export const FIFO_HEADER_COLUMNS: FifoHeaderColumn[] = [
  {
    key: "invoiceNo",
    titleKey: "vinfastParts:FIFO_INVOICE_NO",
    titleDefault: "Số HĐ",
    align: "center",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-center bg-slate-50 ${SHADOW}`,
  },
  // IN
  {
    key: "inQty",
    titleKey: "vinfastParts:FIFO_QTY",
    titleDefault: "SL",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 ${SHADOW} w-[80px]`,
  },
  {
    key: "inUnitCost",
    titleKey: "vinfastParts:FIFO_UNIT_PRICE",
    titleDefault: "Đơn giá",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 ${SHADOW}`,
  },
  {
    key: "inTotal",
    titleKey: "vinfastParts:FIFO_AMOUNT",
    titleDefault: "Thành tiền",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-orange-50/50 ${SHADOW}`,
  },
  // OUT
  {
    key: "outQty",
    titleKey: "vinfastParts:FIFO_QTY",
    titleDefault: "SL",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 ${SHADOW} w-[80px]`,
  },
  {
    key: "outUnitCost",
    titleKey: "vinfastParts:FIFO_UNIT_PRICE",
    titleDefault: "Đơn giá",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 ${SHADOW}`,
  },
  {
    key: "outCogs",
    titleKey: "vinfastParts:FIFO_AMOUNT",
    titleDefault: "Thành tiền",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-emerald-50/50 ${SHADOW}`,
  },
  // TỒN
  {
    key: "balanceQty",
    titleKey: "vinfastParts:FIFO_QTY",
    titleDefault: "SL",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-blue-50/50 ${SHADOW} w-[80px]`,
  },
  {
    key: "balanceValue",
    titleKey: "vinfastParts:FIFO_AMOUNT",
    titleDefault: "Thành tiền",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-blue-50/50 ${SHADOW}`,
  },
  // HIỆU QUẢ KINH DOANH
  {
    key: "outQty",
    titleKey: "vinfastParts:FIFO_QTY",
    titleDefault: "SL",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 ${SHADOW} w-[80px]`,
  },
  {
    key: "outUnitCost",
    titleKey: "vinfastParts:FIFO_BUY_UNIT_PRICE",
    titleDefault: "Đơn giá mua",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 ${SHADOW}`,
  },
  {
    key: "outCogs",
    titleKey: "vinfastParts:FIFO_BUY_PRICE",
    titleDefault: "Giá mua",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 ${SHADOW}`,
  },
  {
    key: "outSellPrice",
    titleKey: "vinfastParts:FIFO_SELL_UNIT_PRICE",
    titleDefault: "Đơn giá bán",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 ${SHADOW}`,
  },
  {
    key: "outRevenue",
    titleKey: "vinfastParts:FIFO_REVENUE",
    titleDefault: "Doanh thu",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 ${SHADOW} min-w-[100px]`,
  },
  {
    key: "outProfit",
    titleKey: "vinfastParts:FIFO_GROSS_PROFIT",
    titleDefault: "Lợi nhuận gộp",
    align: "right",
    className: `px-3 py-2 border-r border-t border-slate-200 font-medium text-right bg-purple-50/50 ${SHADOW} min-w-[100px]`,
  },
  {
    key: "outMargin",
    titleKey: "vinfastParts:FIFO_MARGIN",
    titleDefault: "% LN",
    align: "right",
    className: `px-3 py-2 border-t border-slate-200 font-medium text-right bg-purple-50/50 ${SHADOW} min-w-[60px]`,
  },
];

export const FIFO_DATE_HEADER_CLASS =
  "px-3 py-2 border-r border-t border-slate-200 font-medium text-center bg-slate-50/75 shadow-[0_1px_0_0_var(--border-light)] min-w-[100px]";
