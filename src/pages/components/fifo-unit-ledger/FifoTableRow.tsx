import React from "react";
import { format } from "date-fns";
import { money } from "@/shared/utils/format";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { LedgerDisplayRow } from "./fifoTransform";
import { FifoRowBadges } from "./FifoRowBadges";

const QTY_FORMAT = { minimumFractionDigits: 0, maximumFractionDigits: 2 };

interface FifoTableRowProps {
  row: LedgerDisplayRow;
  index: number;
  onOpenInvoice: (invoiceId: string) => void;
}

/** Một dòng dữ liệu của bảng FIFO: nhập, xuất, tồn và hiệu quả. */
export function FifoTableRow({ row, index, onOpenInvoice }: FifoTableRowProps) {
  return (
    <TableRow className="hover:bg-slate-50 group">
      <TableCell className="px-3 py-2 border-r border-slate-200 text-center text-slate-400">
        {index + 1}
      </TableCell>

      {/* THÔNG TIN CHUNG */}
      <TableCell className="px-3 py-2 border-r border-slate-200 text-center bg-white">
        {row.transactionDate
          ? format(new Date(row.transactionDate), "dd/MM/yyyy")
          : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-center bg-white">
        {row.invoiceNo && (
          <TableText
            text={row.invoiceNo}
            tooltip={[row.invoiceNo, row.partnerName, row.partnerTaxCode]
              .filter(Boolean)
              .join(" - ")}
            enableCopy={false}
            onDrawerClick={() => {
              if (row.invoiceId) onOpenInvoice(row.invoiceId);
            }}
            className="text-slate-600 cursor-pointer justify-center w-full"
          />
        )}
      </TableCell>

      {/* NHẬP KHO */}
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-slate-700 tabular-nums bg-white w-[80px]">
        {row.inQty ? row.inQty.toLocaleString(undefined, QTY_FORMAT) : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-700 tabular-nums bg-white">
        {row.inUnitCost != null ? money(row.inUnitCost) : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-slate-700 tabular-nums bg-white">
        {row.inTotal != null ? money(row.inTotal) : ""}
      </TableCell>

      {/* XUẤT KHO - FIFO */}
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-emerald-700 tabular-nums bg-white w-[80px]">
        {row.outQty ? row.outQty.toLocaleString(undefined, QTY_FORMAT) : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
        {row.outCogs != null && row.outQty
          ? money(row.outCogs / row.outQty)
          : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-emerald-700 tabular-nums bg-white">
        {row.outCogs != null ? money(row.outCogs) : ""}
      </TableCell>

      {/* TỒN KHO (lũy kế từ API, có thể âm) */}
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold tabular-nums bg-white w-[80px]">
        <FifoRowBadges row={row} />
        <span className={row.balanceQty < 0 ? "text-red-600" : "text-blue-700"}>
          {row.balanceQty.toLocaleString(undefined, QTY_FORMAT)}
        </span>
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 tabular-nums bg-white">
        {money(row.balanceValue)}
      </TableCell>

      {/* HIỆU QUẢ KINH DOANH */}
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-purple-700 tabular-nums bg-white w-[80px]">
        {row.outQty ? row.outQty.toLocaleString(undefined, QTY_FORMAT) : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
        {row.outUnitCost != null && row.direction === "OUT"
          ? money(row.outUnitCost)
          : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
        {row.outCogs != null && row.direction === "OUT"
          ? money(row.outCogs)
          : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
        {row.outSellPrice != null && row.direction === "OUT"
          ? money(row.outSellPrice)
          : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right text-slate-600 tabular-nums bg-white">
        {row.outRevenue != null && row.direction === "OUT"
          ? money(row.outRevenue)
          : ""}
      </TableCell>
      <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-medium text-purple-700 tabular-nums bg-white">
        {row.outProfit != null && row.direction === "OUT"
          ? money(row.outProfit)
          : ""}
      </TableCell>
      <TableCell className="px-3 py-2 text-right text-slate-600 tabular-nums bg-white">
        {row.outMargin != null && row.direction === "OUT"
          ? `${row.outMargin.toFixed(1)}%`
          : ""}
      </TableCell>
    </TableRow>
  );
}
