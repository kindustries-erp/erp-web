import type { ReactNode } from "react";
import { cn } from "@/shared/utils";

interface SortThProps {
  col: string;
  active: string;
  onSort: (col: string) => void;
  className?: string;
  children: ReactNode;
}

/**
 * SortTh — Atom: th có icon sắp xếp tăng/giảm.
 * Dùng trong mọi bảng dữ liệu cần sắp xếp theo cột.
 */
export function SortTh({ col, active, onSort, className, children }: SortThProps) {
  const isDesc = active === `-${col}`;
  const isAsc = active === col;
  return (
    <th
      onClick={() => onSort(col)}
      className={cn(className, "cursor-pointer select-none hover:text-foreground transition-colors")}
    >
      <span className="inline-flex items-center gap-[4px]">
        {children}
        <span className={cn("text-[10px]", isDesc || isAsc ? "opacity-70" : "opacity-0")}>
          {isDesc ? "↓" : "↑"}
        </span>
      </span>
    </th>
  );
}
