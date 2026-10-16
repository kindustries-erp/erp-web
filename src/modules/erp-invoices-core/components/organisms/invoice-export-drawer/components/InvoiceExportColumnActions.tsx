import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import type { InvoiceExportColumnActionsProps } from "./InvoiceExportColumnSelector.type";

export function InvoiceExportColumnActions({
  onSelectAll,
  onResetDefault,
  onDeselectAll,
}: InvoiceExportColumnActionsProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div
      className="flex items-center gap-1 text-[11px] font-normal normal-case"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-1.5 text-[11px] text-primary hover:text-primary hover:bg-primary/10 font-medium"
        onClick={onSelectAll}
      >
        {t("erpInvoices:exportDrawer.selectAllColumns", "Chọn tất cả")}
      </Button>
      <span className="text-border/80 select-none text-[10px]">|</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
        onClick={onResetDefault}
      >
        {t("erpInvoices:exportDrawer.defaultColumns", "Mặc định")}
      </Button>
      <span className="text-border/80 select-none text-[10px]">|</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onDeselectAll}
      >
        {t("erpInvoices:exportDrawer.deselectAllColumns", "Bỏ chọn")}
      </Button>
    </div>
  );
}
