import React, { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Table as TableIcon, Minimize2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import type {
  Table as TanstackTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ColumnToggle } from "./ColumnToggle";
import { PageHeader } from "@/shared/components/PageHeader";

export interface FullscreenPlaceholderProps {
  tableTitle?: ReactNode;
  tableDesc?: ReactNode;
  tableIcon?: ReactNode;
  onExit: () => void;
}

export function FullscreenPlaceholder({
  tableTitle,
  tableDesc,
  tableIcon,
  onExit,
}: FullscreenPlaceholderProps) {
  const t = useT();
  return (
    <div className="w-full rounded-xl border border-dashed border-primary/40 bg-primary/[0.02] dark:bg-primary/[0.04] p-8 flex flex-col items-center justify-center text-center gap-3 fullscreen-placeholder-enter">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {tableIcon || <TableIcon className="w-6 h-6 animate-pulse" />}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">
          {tableTitle || t("table.viewTable", "Bảng dữ liệu")}
        </h4>
        {tableDesc && (
          <p className="text-xs text-muted-foreground max-w-md">{tableDesc}</p>
        )}
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
  tableDesc?: ReactNode;
  tableIcon?: ReactNode;
  total?: number;
  isExiting?: boolean;
  fullscreenClassName?: string;
  fullscreenHeaderExtra?: ReactNode;
  fullscreenTabs?: ReactNode;
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
  tableDesc,
  tableIcon,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  total,
  isExiting = false,
  fullscreenClassName,
  fullscreenHeaderExtra,
  fullscreenTabs,
  enableColumnVisibility,
  internalVisibility,
  internalColumnOrder,
  onResetTableLayout,
  onExit,
  children,
}: FullscreenModalProps<T>) {
  const t = useT();

  if (typeof document === "undefined") return null;

  const defaultActions = (
    <div className="flex items-center gap-2">
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
    </div>
  );

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[200] bg-surface dark:bg-slate-950 shadow-2xl overflow-hidden flex flex-col px-5 pt-[18px] pb-4 space-y-4",
        isExiting ? "fullscreen-modal-exit" : "fullscreen-modal-enter",
        fullscreenClassName,
      )}
    >
      {/* Top Fullscreen Header Bar */}
      <PageHeader
        title={tableTitle || t("table.viewTable", "Bảng dữ liệu")}
        desc={tableDesc}
        icon={tableIcon || <TableIcon className="w-5 h-5" />}
        actions={fullscreenHeaderExtra || defaultActions}
        className="mb-0 shrink-0"
      />

      {/* Tabs bar in fullscreen mode */}
      {fullscreenTabs && <div className="shrink-0">{fullscreenTabs}</div>}

      {/* Main Table Content Body */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {children}
      </div>
    </div>,
    document.body,
  );
}
