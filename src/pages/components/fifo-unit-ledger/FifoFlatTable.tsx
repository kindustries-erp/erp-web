import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/shared/components/ui/table";
import { useTranslation } from "react-i18next";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { LedgerDisplayRow } from "./fifoTransform";
import type { FifoFlatTableTotals } from "./fifoTotals";
import { FifoTableHeader } from "./FifoTableHeader";
import { FifoTableRow } from "./FifoTableRow";
import { FifoTableFooter } from "./FifoTableFooter";

export type { FifoFlatTableTotals } from "./fifoTotals";

interface FifoFlatTableProps {
  data: LedgerDisplayRow[];
  onOpenInvoice: (invoiceId: string) => void;
  tableState: ReturnType<typeof useTableColumnState>;
  totals: FifoFlatTableTotals;
  optionsMap?: Record<string, { label: string; value: string }[]>;
}

const COLUMN_COUNT = 17;

/** Bảng FIFO: khung, tiêu đề, các dòng và hàng tổng. */
export function FifoFlatTable({
  data,
  onOpenInvoice,
  tableState,
  totals,
  optionsMap = {},
}: FifoFlatTableProps) {
  const { t } = useTranslation(["vinfastParts", "common"]);

  return (
    <div className="w-full overflow-x-auto overflow-y-visible border border-border/30 dark:border-zinc-800/40 rounded-lg bg-card/40 dark:bg-zinc-950/40 backdrop-blur-sm relative">
      <Table className="w-full text-sm text-left whitespace-nowrap min-w-max border-collapse">
        <FifoTableHeader tableState={tableState} optionsMap={optionsMap} />

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT}
                className="text-center py-6 text-slate-500 dark:text-zinc-400"
              >
                {t("common:noData", "Không có dữ liệu")}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <FifoTableRow
                key={row.id}
                row={row}
                index={i}
                onOpenInvoice={onOpenInvoice}
              />
            ))
          )}
        </TableBody>

        <FifoTableFooter totals={totals} />
      </Table>
    </div>
  );
}
