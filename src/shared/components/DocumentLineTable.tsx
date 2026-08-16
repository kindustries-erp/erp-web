import { ReactNode, useRef, useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";

export interface DocumentLineTableColumn<T> {
  key: string;
  header: ReactNode;
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  fixed?: "left" | "right";
  cell: (row: T, index: number) => ReactNode;
}

export interface DocumentLineTableProps<T> {
  columns: DocumentLineTableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string | number;
  onAddLine?: () => void;
  onRemoveLine?: (index: number) => void;
  addLabel?: string;
  disabled?: boolean;
  viewOnly?: boolean;
  sortConfig?: { key: string; direction: "asc" | "desc" } | null;
  onSort?: (key: string) => void;
  rowClassName?: (row: T, index: number) => string;
  tableContainerClassName?: string;
  footer?: ReactNode;
  variant?: "default" | "spreadsheet";
}

export function DocumentLineTable<T>({
  columns,
  data,
  getRowKey,
  onAddLine,
  onRemoveLine,
  addLabel,
  disabled,
  viewOnly,
  sortConfig,
  onSort,
  rowClassName,
  tableContainerClassName,
  footer,
  variant = "default",
}: DocumentLineTableProps<T>) {
  const t = useT();
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [tableWidth, setTableWidth] = useState(0);

  const [isScrolledTop, setIsScrolledTop] = useState(false);
  const [isScrolledBottom, setIsScrolledBottom] = useState(false);

  const handleTopScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleBottomScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
    if (bottomScrollRef.current) {
      const el = bottomScrollRef.current;
      setIsScrolledTop(el.scrollTop > 2);
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      setIsScrolledBottom(!atBottom && el.scrollHeight > el.clientHeight);
    }
  };

  useEffect(() => {
    if (!tableRef.current || !bottomScrollRef.current) return;
    const observer = new ResizeObserver(() => {
      if (bottomScrollRef.current) {
        setTableWidth(bottomScrollRef.current.scrollWidth);
        const el = bottomScrollRef.current;
        setIsScrolledTop(el.scrollTop > 2);
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
        setIsScrolledBottom(!atBottom && el.scrollHeight > el.clientHeight);
      }
    });
    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, [data]);

  const hasActions = !viewOnly && !!onRemoveLine;
  const showAddBtn = !viewOnly && !!onAddLine && !disabled;

  return (
    <>
      <div
        ref={topScrollRef}
        className="w-full overflow-x-auto hidden md:block"
        onScroll={handleTopScroll}
      >
        <div
          style={{
            width: `${tableWidth}px`,
            height: "1px",
          }}
        />
      </div>
      <div
        ref={bottomScrollRef}
        className={cn(
          variant === "spreadsheet"
            ? "bg-surface border border-border rounded-[10px] overflow-auto shadow-panel"
            : "w-full overflow-x-auto rounded-lg border border-[color:var(--border)]",
          tableContainerClassName,
        )}
        onScroll={handleBottomScroll}
      >
        <table
          ref={tableRef}
          className={cn(
            "w-full text-sm text-left relative",
            variant === "spreadsheet" && "border-collapse border-spacing-0",
          )}
        >
          <thead
            className={cn(
              "table-header-glass text-muted-foreground text-xs uppercase sticky top-0 z-10 border-b border-border transition-shadow duration-200",
              isScrolledTop
                ? "shadow-[0_4px_16px_-2px_rgba(15,23,42,0.10),0_2px_4px_-2px_rgba(15,23,42,0.06)]"
                : "shadow-none",
            )}
          >
            <tr
              className={cn(
                variant === "spreadsheet" &&
                  "divide-x divide-[color:var(--border)]",
              )}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "font-medium",
                    variant === "spreadsheet"
                      ? "px-2 py-1 h-auto text-[11px]"
                      : "px-3 py-2",
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left",
                    col.sortable &&
                      "cursor-pointer hover:bg-muted/80 transition-colors select-none",
                    col.fixed === "left" &&
                      "sticky left-0 table-header-glass z-20 shadow-[1px_0_0_0_var(--border)]",
                    col.fixed === "right" &&
                      "sticky right-0 table-header-glass z-20 shadow-[-1px_0_0_0_var(--border)]",
                  )}
                  style={{ width: col.width, minWidth: col.minWidth }}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div
                    className={`flex items-center gap-1.5 ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : "justify-start"}`}
                  >
                    {col.header}
                    {col.sortable && (
                      <div className="flex flex-col -space-y-[3px] shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={
                            sortConfig?.key === col.key &&
                            sortConfig.direction === "asc"
                              ? 3.5
                              : 1.5
                          }
                          className={cn(
                            "transition-all duration-150",
                            sortConfig?.key === col.key
                              ? sortConfig.direction === "asc"
                                ? "text-foreground"
                                : "text-muted-foreground/20"
                              : "text-muted-foreground/40",
                          )}
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={
                            sortConfig?.key === col.key &&
                            sortConfig.direction === "desc"
                              ? 3.5
                              : 1.5
                          }
                          className={cn(
                            "transition-all duration-150",
                            sortConfig?.key === col.key
                              ? sortConfig.direction === "desc"
                                ? "text-foreground"
                                : "text-muted-foreground/20"
                              : "text-muted-foreground/40",
                          )}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th className="px-3 py-2 font-medium w-12 text-center shrink-0" />
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)] bg-background">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-3 py-4 text-center text-muted-foreground"
                >
                  {t("Không có dữ liệu")}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={getRowKey(row, idx)}
                  className={cn(
                    "group hover:bg-muted/30 transition-colors",
                    variant === "spreadsheet" &&
                      "divide-x divide-[color:var(--border)]",
                    rowClassName?.(row, idx),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-3 py-2 align-top",
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                            ? "text-right"
                            : "text-left",
                        col.fixed === "left" &&
                          "sticky left-0 bg-background group-hover:bg-muted/30 z-10 shadow-[1px_0_0_0_var(--border)]",
                        col.fixed === "right" &&
                          "sticky right-0 bg-background group-hover:bg-muted/30 z-10 shadow-[-1px_0_0_0_var(--border)]",
                      )}
                    >
                      {col.cell(row, idx)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-3 py-2 align-top text-center">
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors mt-1"
                        disabled={disabled}
                        onClick={() => onRemoveLine?.(idx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {footer && (
            <tfoot
              className={cn(
                "table-footer-glass border-t border-[color:var(--border)] font-medium sticky bottom-0 z-10 transition-shadow duration-200",
                isScrolledBottom
                  ? "shadow-[0_-4px_16px_-2px_rgba(15,23,42,0.10)]"
                  : "shadow-none",
              )}
            >
              {footer}
            </tfoot>
          )}
        </table>
        {showAddBtn && (
          <div className="p-3 border-t border-[color:var(--border)] bg-muted/10">
            <button
              type="button"
              className="text-sm font-medium text-muted-foreground hover:text-foreground bg-background hover:bg-muted border border-[color:var(--border)] px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors w-fit shadow-sm"
              disabled={disabled}
              onClick={onAddLine}
            >
              <Plus className="w-4 h-4" />
              {addLabel || t("Thêm dòng")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
