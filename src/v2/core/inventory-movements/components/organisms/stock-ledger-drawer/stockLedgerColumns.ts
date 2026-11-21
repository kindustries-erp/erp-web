export interface StockLedgerHeaderColumn {
  id: string;
  headerKey: string;
  headerDefault: string;
  align: "left" | "center" | "right";
  className: string;
  width?: string;
}

const SHADOW = "shadow-[0_1px_0_0_var(--border-light)]";
const CELL_BASE =
  "px-3 py-2 border-r border-t border-border/20 dark:border-white/[0.03] text-[11px] uppercase tracking-wider font-semibold";
const CELL_DIVIDER =
  "px-3 py-2 border-r border-t border-slate-300/40 dark:border-zinc-700/40 text-[11px] uppercase tracking-wider font-semibold";

/**
 * Cấu hình 9 cột phẳng thiết yếu cho Thẻ kho Garage:
 * 1. Ngày
 * 2. Nghiệp vụ
 * 3. Số phiếu
 * 4. Nhập
 * 5. Xuất
 * 6. Điều chỉnh
 * 7. Tồn
 * 8. Đơn giá
 * (Cột 0 là # STT được render mặc định ở header)
 */
export const STOCK_LEDGER_COLUMNS: StockLedgerHeaderColumn[] = [
  {
    id: "transactionDate",
    headerKey: "v2.inventoryMovements.ledger.date",
    headerDefault: "Ngày",
    align: "center",
    className: `${CELL_BASE} text-center bg-slate-50 dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-400 w-[105px] ${SHADOW}`,
  },
  {
    id: "transactionType",
    headerKey: "v2.inventoryMovements.ledger.type",
    headerDefault: "Nghiệp vụ",
    align: "left",
    className: `${CELL_BASE} text-left bg-slate-50 dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-400 min-w-[125px] ${SHADOW}`,
  },
  {
    id: "documentNo",
    headerKey: "v2.inventoryMovements.ledger.documentNo",
    headerDefault: "Số phiếu",
    align: "center",
    className: `${CELL_DIVIDER} text-center bg-slate-50 dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-400 w-[115px] ${SHADOW}`,
  },
  {
    id: "qtyIn",
    headerKey: "v2.inventoryMovements.ledger.inbound",
    headerDefault: "Nhập",
    align: "right",
    className: `${CELL_BASE} text-right bg-amber-500/[0.04] dark:bg-amber-500/[0.08] text-amber-700 dark:text-amber-400 w-[85px] ${SHADOW}`,
  },
  {
    id: "qtyOut",
    headerKey: "v2.inventoryMovements.ledger.outbound",
    headerDefault: "Xuất",
    align: "right",
    className: `${CELL_BASE} text-right bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400 w-[85px] ${SHADOW}`,
  },
  {
    id: "qtyAdjusted",
    headerKey: "v2.inventoryMovements.ledger.adjusted",
    headerDefault: "Điều chỉnh",
    align: "right",
    className: `${CELL_BASE} text-right bg-orange-500/[0.04] dark:bg-orange-500/[0.08] text-orange-700 dark:text-orange-400 w-[95px] ${SHADOW}`,
  },
  {
    id: "balanceQty",
    headerKey: "v2.inventoryMovements.ledger.balance",
    headerDefault: "Tồn",
    align: "right",
    className: `${CELL_BASE} text-right bg-slate-500/[0.03] dark:bg-zinc-500/[0.06] text-foreground font-bold w-[90px] ${SHADOW}`,
  },
  {
    id: "unitCost",
    headerKey: "v2.inventoryMovements.ledger.unitCost",
    headerDefault: "Đơn giá",
    align: "right",
    className: `${CELL_DIVIDER} text-right bg-slate-50 dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-400 w-[110px] ${SHADOW}`,
  },
];
