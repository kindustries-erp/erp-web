import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/utils";
import type { QuotePreviewMode } from "../GarageCasePreview.type";

export interface QuotePreviewViewSwitchProps {
  viewMode: QuotePreviewMode;
  onViewModeChange: (mode: QuotePreviewMode) => void;
  className?: string;
}

export function QuotePreviewViewSwitch({
  viewMode,
  onViewModeChange,
  className,
}: QuotePreviewViewSwitchProps) {
  const { t } = useTranslation(["garage", "common"]);
  const isTable = viewMode === "TABLE";

  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-shrink-0 text-xs font-normal normal-case select-none",
        className,
      )}
    >
      <span
        role="button"
        tabIndex={0}
        className={cn(
          "cursor-pointer transition-colors px-1 py-0.5 rounded text-[11px] sm:text-xs",
          !isTable
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onViewModeChange("DOCUMENT")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewModeChange("DOCUMENT");
          }
        }}
      >
        {t("cases.quotePreview.viewDocument", "Bản in")}
      </span>

      <Switch
        checked={isTable}
        onCheckedChange={(checked) =>
          onViewModeChange(checked ? "TABLE" : "DOCUMENT")
        }
        aria-label={t(
          "cases.quotePreview.switchAria",
          "Chuyển đổi chế độ xem Bản in hoặc Bảng dữ liệu",
        )}
      />

      <span
        role="button"
        tabIndex={0}
        className={cn(
          "cursor-pointer transition-colors px-1 py-0.5 rounded text-[11px] sm:text-xs",
          isTable
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => onViewModeChange("TABLE")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onViewModeChange("TABLE");
          }
        }}
      >
        {t("cases.quotePreview.viewTable", "Bảng dữ liệu")}
      </span>
    </div>
  );
}
