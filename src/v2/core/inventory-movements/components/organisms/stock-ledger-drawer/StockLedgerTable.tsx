import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/shared/components/ui/table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { StockLedgerTableHeader } from "./StockLedgerTableHeader";
import { StockLedgerTableRow } from "./StockLedgerTableRow";
import { StockLedgerTableFooter } from "./StockLedgerTableFooter";
import type {
  StockLedgerDisplayRow,
  StockLedgerTotals,
} from "./stockLedgerCalculator";

interface StockLedgerTableProps {
  rows: StockLedgerDisplayRow[];
  totals: StockLedgerTotals;
  onOpenDocument?: (docType: string, docId: string) => void;
}

const TOTAL_COLUMNS = 9;

export function StockLedgerTable({
  rows,
  totals,
  onOpenDocument,
}: StockLedgerTableProps) {
  const { t } = useV2Translation();

  return (
    <div className="w-full overflow-x-auto overflow-y-visible border border-border/40 dark:border-zinc-800/60 rounded-lg bg-card/60 dark:bg-zinc-950/40 backdrop-blur-sm relative">
      <Table className="w-full text-sm text-left whitespace-nowrap min-w-max border-collapse">
        <StockLedgerTableHeader />

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={TOTAL_COLUMNS}
                className="text-center py-8 text-muted-foreground"
              >
                {t("v2.inventoryMovements.ledger.empty", "Chưa có giao dịch")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <StockLedgerTableRow
                key={row.id}
                row={row}
                index={index}
                onOpenDocument={onOpenDocument}
              />
            ))
          )}
        </TableBody>

        <StockLedgerTableFooter totals={totals} />
      </Table>
    </div>
  );
}
