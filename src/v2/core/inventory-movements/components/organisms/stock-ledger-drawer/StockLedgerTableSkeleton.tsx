import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/shared/components/ui/table";
import { V2Skeleton } from "@/v2/shared/components";
import { StockLedgerTableHeader } from "./StockLedgerTableHeader";

const SKELETON_ROWS = [1, 2, 3, 4, 5];

export function StockLedgerTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto overflow-y-visible border border-border/40 dark:border-zinc-800/60 rounded-lg bg-card/60 dark:bg-zinc-950/40 backdrop-blur-sm relative">
      <Table className="w-full text-sm text-left whitespace-nowrap min-w-max border-collapse">
        <StockLedgerTableHeader />
        <TableBody>
          {SKELETON_ROWS.map((key) => (
            <TableRow
              key={key}
              className="border-b border-border/20 dark:border-white/[0.03]"
            >
              {/* 1. STT */}
              <TableCell className="px-3 py-3 border-r border-border/15 w-11 text-center">
                <V2Skeleton className="h-4 w-5 mx-auto" />
              </TableCell>

              {/* 2. Ngày */}
              <TableCell className="px-3 py-3 border-r border-border/15 w-[100px] text-center">
                <V2Skeleton className="h-4 w-16 mx-auto" />
              </TableCell>

              {/* 3. Nghiệp vụ */}
              <TableCell className="px-3 py-3 border-r border-border/15 min-w-[125px]">
                <V2Skeleton className="h-4 w-24" />
              </TableCell>

              {/* 4. Số phiếu */}
              <TableCell className="px-3 py-3 border-r border-slate-300/40 dark:border-zinc-700/40 w-[115px] text-center">
                <V2Skeleton className="h-4 w-20 mx-auto" />
              </TableCell>

              {/* 5. Nhập */}
              <TableCell className="px-3 py-3 border-r border-border/15 w-[85px]">
                <V2Skeleton className="h-4 w-12 ml-auto" />
              </TableCell>

              {/* 6. Xuất */}
              <TableCell className="px-3 py-3 border-r border-border/15 w-[85px]">
                <V2Skeleton className="h-4 w-12 ml-auto" />
              </TableCell>

              {/* 7. Điều chỉnh */}
              <TableCell className="px-3 py-3 border-r border-border/15 w-[95px]">
                <V2Skeleton className="h-4 w-14 ml-auto" />
              </TableCell>

              {/* 8. Tồn */}
              <TableCell className="px-3 py-3 border-r border-border/15 w-[90px]">
                <V2Skeleton className="h-4 w-14 ml-auto" />
              </TableCell>

              {/* 9. Đơn giá */}
              <TableCell className="px-3 py-3 border-r border-slate-300/40 dark:border-zinc-700/40 w-[110px]">
                <V2Skeleton className="h-4 w-16 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
