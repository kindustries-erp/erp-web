import { ReactNode, useRef, useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useT } from "@/core/i18n";

export interface DocumentLineTableColumn<T> {
  key: string;
  header: ReactNode;
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
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
}: DocumentLineTableProps<T>) {
  const t = useT();
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [tableWidth, setTableWidth] = useState(0);

  const handleTopScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleBottomScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    if (!tableRef.current || !bottomScrollRef.current) return;
    const observer = new ResizeObserver(() => {
      if (bottomScrollRef.current) {
        setTableWidth(bottomScrollRef.current.scrollWidth);
      }
    });
    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, []);

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
            width: tableWidth ? `${tableWidth}px` : "100%",
            height: "1px",
          }}
        />
      </div>
      <div
        ref={bottomScrollRef}
        className="w-full overflow-x-auto rounded-lg border border-[color:var(--border)]"
        onScroll={handleBottomScroll}
      >
        <table ref={tableRef} className="w-full text-sm text-left relative">
          <thead className="bg-muted text-muted-foreground text-xs uppercase sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-medium ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left"
                  }`}
                  style={{ width: col.width, minWidth: col.minWidth }}
                >
                  {col.header}
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
                  className="group hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-2 align-top mt-2 ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      {col.cell(row, idx)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-3 py-2 align-top text-center mt-2">
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
