import React, { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Table as TableIcon, Minimize2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import type {
  Table as TanstackTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ColumnToggle } from "./ColumnToggle";

export interface FullscreenPlaceholderProps {
  tableTitle?: ReactNode;
  onExit: () => void;
}

export function FullscreenPlaceholder({
  tableTitle,
  onExit,
}: FullscreenPlaceholderProps) {
  const t = useT();
  return (
    <div className="w-full rounded-xl border border-dashed border-primary/40 bg-primary/[0.02] dark:bg-primary/[0.04] p-8 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in-50 duration-200">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <TableIcon className="w-6 h-6 animate-pulse" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">
          {tableTitle || t("table.viewTable", "Bảng dữ liệu")}
        </h4>
        <p className="text-xs text-muted-foreground max-w-md">
          {t(
            "table.fullscreenActiveDesc",
            "Bảng đang được mở ở chế độ Toàn màn hình. Bạn có thể nhấn nút bên dưới hoặc phím Esc để thu nhỏ lại.",
          )}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onExit}
        className="mt-1 gap-1.5 text-xs cursor-pointer"
      >
        <Minimize2 className="w-3.5 h-3.5 text-primary" />
        <span>{t("table.exitFullscreen", "Thu nhỏ lại (Esc)")}</span>
      </Button>
    </div>
  );
}

export interface FullscreenModalProps<T> {
  table: TanstackTable<T>;
  tableTitle?: ReactNode;
  total?: number;
  fullscreenClassName?: string;
  fullscreenHeaderExtra?: ReactNode;
  enableColumnVisibility?: boolean;
  internalVisibility?: VisibilityState;
  internalColumnOrder?: string[];
  onResetTableLayout?: () => void;
  onExit: () => void;
  children: ReactNode;
}

export function FullscreenModal<T>({
  table,
  tableTitle,
  total,
  fullscreenClassName,
  fullscreenHeaderExtra,
  enableColumnVisibility,
  internalVisibility,
  internalColumnOrder,
  onResetTableLayout,
  onExit,
  children,
}: FullscreenModalProps<T>) {
  const t = useT();

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[200] bg-surface dark:bg-slate-950 shadow-2xl overflow-hidden animate-in fade-in duration-200 flex flex-col p-4 sm:p-5 gap-3",
        fullscreenClassName,
      )}
    >
      {/* Top Fullscreen Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/80 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <TableIcon className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate">
            {tableTitle || t("table.viewTable", "Bảng dữ liệu")}
          </span>
          {total != null && (
            <Badge variant="secondary" className="font-mono text-xs shrink-0">
              {total} {t("dòng")}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end flex-1 min-w-0">
          {fullscreenHeaderExtra ? (
            fullscreenHeaderExtra
          ) : (
            <>
              {enableColumnVisibility && (
                <ColumnToggle
                  table={table}
                  _visibility={internalVisibility}
                  _order={internalColumnOrder}
                  onReset={onResetTableLayout}
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExit}
                className="h-8 gap-1.5 text-xs cursor-pointer shrink-0"
                title={t("table.exitFullscreenShortcut", "Thu nhỏ (Esc)")}
              >
                <Minimize2 className="w-3.5 h-3.5 text-primary" />
                <span>{t("table.exitFullscreen", "Thu nhỏ (Esc)")}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Table Content Body */}
      <div className="flex-1 flex flex-col min-h-0 relative">{children}</div>
    </div>,
    document.body,
  );
}
