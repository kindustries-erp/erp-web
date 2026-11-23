import * as React from "react";
import { TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { STOCK_LEDGER_COLUMNS } from "./stockLedgerColumns";

const HASH_CELL_CLASS =
  "px-3 py-2.5 border-r border-t border-slate-300/60 dark:border-zinc-700/60 font-semibold text-center w-11 bg-slate-100/90 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-200 shadow-[0_1px_0_0_var(--border-light)] text-[11px]";

export function StockLedgerTableHeader() {
  const { t } = useV2Translation();

  return (
    <TableHeader className="sticky top-0 z-10 table-header-glass text-slate-700 dark:text-zinc-200 border-b border-border/30">
      <TableRow className="hover:bg-transparent border-b-0 shadow-[0_1px_0_0_var(--border-light)]">
        <TableHead className={HASH_CELL_CLASS}>#</TableHead>
        {STOCK_LEDGER_COLUMNS.map((col) => (
          <TableHead key={col.id} className={col.className}>
            <span
              className={`block ${
                col.align === "right"
                  ? "text-right"
                  : col.align === "center"
                    ? "text-center"
                    : "text-left"
              }`}
            >
              {t(col.headerKey, col.headerDefault)}
            </span>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
