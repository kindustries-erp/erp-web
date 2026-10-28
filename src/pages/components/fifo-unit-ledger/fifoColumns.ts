/**
 * Cấu hình cột của bảng FIFO: tiêu đề i18n, căn lề và lớp màu theo nhóm.
 */

export type FifoAlign = "center" | "right";

export interface FifoHeaderColumn {
  key: string;
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

const SHADOW = "shadow-[0_1px_0_0_var(--border-light)]";
const CELL_BASE =
  "px-3 py-2 border-r border-t border-border/20 dark:border-white/[0.03] text-[11px] uppercase tracking-wider font-semibold";
const CELL_DIVIDER =
  "px-3 py-2 border-r border-t border-slate-300/40 dark:border-zinc-700/40 text-[11px] uppercase tracking-wider font-semibold";

export const FIFO_GENERAL_GROUP: FifoGroupHeader = {
  titleKey: "vinfastParts:FIFO_GENERAL_GROUP",
  titleDefault: "THÔNG TIN CHUNG",
  colSpan: 2,
  className: `px-3 py-2 border-r border-slate-300/40 dark:border-zinc-700/40 font-semibold text-center border-t border-slate-300/60 dark:border-zinc-700/60 bg-slate-100/90 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-200 uppercase text-[11px] tracking-wider ${SHADOW}`,
};

export const FIFO_GROUP_HEADERS: FifoGroupHeader[] = [
  {
    titleKey: "vinfastParts:INBOUND_GROUP",
    titleDefault: "NHẬP KHO",
    colSpan: 3,
    className: `px-3 py-2 border-r border-slate-300/40 dark:border-zinc-700/40 font-semibold text-center border-t-2 border-t-amber-500/80 bg-amber-500/[0.07] dark:bg-amber-500/[0.12] text-amber-700 dark:text-amber-400 uppercase text-[11px] tracking-wider ${SHADOW}`,
  },
  {
    titleKey: "vinfastParts:OUTBOUND_FIFO_GROUP",
    titleDefault: "XUẤT KHO - FIFO",
    colSpan: 3,
    className: `px-3 py-2 border-r border-slate-300/40 dark:border-zinc-700/40 font-semibold text-center border-t-2 border-t-emerald-500/80 bg-emerald-500/[0.07] dark:bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-400 uppercase text-[11px] tracking-wider ${SHADOW}`,
  },
  {
    titleKey: "vinfastParts:STOCK_GROUP",
    titleDefault: "TỒN KHO",
    colSpan: 2,
    className: `px-3 py-2 border-r border-slate-300/40 dark:border-zinc-700/40 font-semibold text-center border-t-2 border-t-slate-400/80 dark:border-t-zinc-600/80 bg-slate-500/[0.05] dark:bg-zinc-500/[0.08] text-slate-800 dark:text-zinc-200 uppercase text-[11px] tracking-wider ${SHADOW}`,
  },
];

export const FIFO_PERFORMANCE_GROUP: FifoGroupHeader = {
  titleKey: "vinfastParts:FIFO_PERFORMANCE_GROUP",
  titleDefault: "HIỆU QUẢ KINH DOANH",
  colSpan: 6,
  className: `px-3 py-2 font-semibold text-center border-t-2 border-t-purple-500/80 bg-purple-500/[0.07] dark:bg-purple-500/[0.12] text-purple-700 dark:text-purple-400 uppercase text-[11px] tracking-wider ${SHADOW}`,
};

/** Các cột có thể sắp xếp/lọc ở hàng tiêu đề thứ hai, sau cột Ngày. */
export const FIFO_HEADER_COLUMNS: FifoHeaderColumn[] = [
  {
    key: "invoiceNo",
    titleKey: "vinfastParts:FIFO_INVOICE_NO",
    titleDefault: "Số HĐ",
    align: "center",
    className: `${CELL_DIVIDER} text-center bg-slate-50 dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-400 ${SHADOW}`,
  },
  // IN
  {
    key: "inQty",
    titleKey: "vinfastParts:FIFO_QTY",
    titleDefault: "SL",
    align: "right",
    className: `${CELL_BASE} text-right bg-amber-500/[0.03] dark:bg-amber-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW} w-[80px]`,
  },
  {
    key: "inUnitCost",
    titleKey: "vinfastParts:FIFO_UNIT_PRICE",
    titleDefault: "Đơn giá",
    align: "right",
    className: `${CELL_BASE} text-right bg-amber-500/[0.03] dark:bg-amber-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW}`,
  },
  {
    key: "inTotal",
    titleKey: "vinfastParts:FIFO_AMOUNT",
    titleDefault: "Thành tiền",
    align: "right",
    className: `${CELL_DIVIDER} text-right bg-amber-500/[0.03] dark:bg-amber-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW}`,
  },
  // OUT
  {
    key: "outQty",
    titleKey: "vinfastParts:FIFO_QTY",
    titleDefault: "SL",
    align: "right",
    className: `${CELL_BASE} text-right bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW} w-[80px]`,
  },
  {
    key: "outUnitCost",
    titleKey: "vinfastParts:FIFO_UNIT_PRICE",
    titleDefault: "Đơn giá",
    align: "right",
    className: `${CELL_BASE} text-right bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW}`,
  },
  {
    key: "outCogs",
    titleKey: "vinfastParts:FIFO_AMOUNT",
    titleDefault: "Thành tiền",
    align: "right",
    className: `${CELL_DIVIDER} text-right bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW}`,
  },
  // TỒN
  {
    key: "balanceQty",
    titleKey: "vinfastParts:FIFO_QTY",
    titleDefault: "SL",
    align: "right",
    className: `${CELL_BASE} text-right bg-slate-500/[0.02] dark:bg-zinc-500/[0.04] text-slate-600 dark:text-zinc-400 ${SHADOW} w-[80px]`,
  },
  {
    key: "balanceValue",
    titleKey: "vinfastParts:FIFO_AMOUNT",
    titleDefault: "Thành tiền",
    align: "right",
    className: `${CELL_DIVIDER} text-right bg-slate-500/[0.02] dark:bg-zinc-500/[0.04] text-slate-600 dark:text-zinc-400 ${SHADOW}`,
  },
  // HIỆU QUẢ KINH DOANH (6 cột: SL, Đơn giá bán, Doanh thu, Giá vốn, Lợi nhuận gộp, % biên LN)
  {
    key: "outQty",
    titleKey: "vinfastParts:FIFO_QTY",
    titleDefault: "SL",
    align: "right",
    className: `${CELL_BASE} text-right bg-purple-500/[0.03] dark:bg-purple-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW} w-[80px]`,
  },
  {
    key: "outSellPrice",
    titleKey: "vinfastParts:FIFO_SELL_UNIT_PRICE",
    titleDefault: "Đơn giá bán",
    align: "right",
    className: `${CELL_BASE} text-right bg-purple-500/[0.03] dark:bg-purple-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW}`,
  },
  {
    key: "outRevenue",
    titleKey: "vinfastParts:FIFO_REVENUE",
    titleDefault: "Doanh thu",
    align: "right",
    className: `${CELL_BASE} text-right bg-purple-500/[0.03] dark:bg-purple-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW} min-w-[100px]`,
  },
  {
    key: "outCogs",
    titleKey: "vinfastParts:FIFO_COGS",
    titleDefault: "Giá vốn",
    align: "right",
    className: `${CELL_BASE} text-right bg-purple-500/[0.03] dark:bg-purple-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW} min-w-[100px]`,
  },
  {
    key: "outProfit",
    titleKey: "vinfastParts:FIFO_GROSS_PROFIT",
    titleDefault: "Lợi nhuận gộp",
    align: "right",
    className: `${CELL_BASE} text-right bg-purple-500/[0.03] dark:bg-purple-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW} min-w-[100px]`,
  },
  {
    key: "outMargin",
    titleKey: "vinfastParts:FIFO_MARGIN",
    titleDefault: "% biên LN",
    align: "right",
    className: `px-3 py-2 border-t border-border/20 dark:border-white/[0.03] text-[11px] uppercase tracking-wider font-semibold text-right bg-purple-500/[0.03] dark:bg-purple-500/[0.06] text-slate-600 dark:text-zinc-400 ${SHADOW} min-w-[70px]`,
  },
];

export const FIFO_DATE_HEADER_CLASS = `px-3 py-2 border-r border-t border-border/20 dark:border-white/[0.03] text-[11px] uppercase tracking-wider font-semibold text-center bg-slate-50 dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-400 ${SHADOW} min-w-[100px]`;
