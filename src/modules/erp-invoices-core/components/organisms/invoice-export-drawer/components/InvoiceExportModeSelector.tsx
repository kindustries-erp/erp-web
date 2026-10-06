import React from "react";
import { Calendar, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomRadioIndicator } from "./CustomRadioIndicator";

export type InvoiceExportMode = "by-period" | "by-current-filter";

export interface InvoiceExportModeSelectorProps {
  exportMode: InvoiceExportMode;
  onChange: (mode: InvoiceExportMode) => void;
}

export function InvoiceExportModeSelector({
  exportMode,
  onChange,
}: InvoiceExportModeSelectorProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-2">
        {t("erpInvoices:exportDrawer.modeLabel", "Chế độ xuất dữ liệu")}
      </label>
      <div className="grid grid-cols-1 gap-2">
        {/* Option 1: Theo kỳ */}
        <label
          onClick={() => onChange("by-period")}
          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all outline-none focus:outline-none active:outline-none focus-within:outline-none select-none [-webkit-tap-highlight-color:transparent] ${
            exportMode === "by-period"
              ? "border-foreground bg-muted/40 text-foreground shadow-2xs"
              : "border-border/70 hover:border-border hover:bg-muted/20 text-muted-foreground"
          }`}
        >
          <input
            type="radio"
            name="invoiceExportMode"
            value="by-period"
            checked={exportMode === "by-period"}
            onChange={() => onChange("by-period")}
            className="sr-only outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none [accent-color:currentColor]"
          />
          <CustomRadioIndicator checked={exportMode === "by-period"} />
          <div className="flex flex-col gap-0.5 text-xs flex-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t("erpInvoices:exportDrawer.modePeriod", "Theo kỳ")}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              {t(
                "erpInvoices:exportDrawer.modePeriodDesc",
                "Chọn khoảng thời gian theo kỳ hoặc ngày tùy chỉnh",
              )}
            </p>
          </div>
        </label>

        {/* Option 2: Theo filter hiện tại */}
        <label
          onClick={() => onChange("by-current-filter")}
          className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all outline-none focus:outline-none active:outline-none focus-within:outline-none select-none [-webkit-tap-highlight-color:transparent] ${
            exportMode === "by-current-filter"
              ? "border-foreground bg-muted/40 text-foreground shadow-2xs"
              : "border-border/70 hover:border-border hover:bg-muted/20 text-muted-foreground"
          }`}
        >
          <input
            type="radio"
            name="invoiceExportMode"
            value="by-current-filter"
            checked={exportMode === "by-current-filter"}
            onChange={() => onChange("by-current-filter")}
            className="sr-only outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none [accent-color:currentColor]"
          />
          <CustomRadioIndicator checked={exportMode === "by-current-filter"} />
          <div className="flex flex-col gap-0.5 text-xs flex-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Filter className="w-3.5 h-3.5 text-foreground" />
              <span>
                {t(
                  "erpInvoices:exportDrawer.modeCurrentFilter",
                  "Theo filter hiện tại",
                )}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              {t(
                "erpInvoices:exportDrawer.modeCurrentFilterDesc",
                "Giữ nguyên toàn bộ bộ lọc và khoảng ngày đang xem trên bảng",
              )}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
