import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import type { BankStatementExportColumnActionsProps } from "./BankStatementExportColumnSelector.type";

export function BankStatementExportColumnActions({
  onSelectAll,
  onResetDefault,
  onDeselectAll,
}: BankStatementExportColumnActionsProps) {
  const { t } = useTranslation("bankStatement");

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
        {t("bankStatement.exportDrawer.selectAllColumns", "Chọn tất cả")}
      </Button>
      <span className="text-border/80 select-none text-[10px]">|</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
        onClick={onResetDefault}
      >
        {t("bankStatement.exportDrawer.defaultColumns", "Mặc định")}
      </Button>
      <span className="text-border/80 select-none text-[10px]">|</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onDeselectAll}
      >
        {t("bankStatement.exportDrawer.deselectAllColumns", "Bỏ chọn")}
      </Button>
    </div>
  );
}
