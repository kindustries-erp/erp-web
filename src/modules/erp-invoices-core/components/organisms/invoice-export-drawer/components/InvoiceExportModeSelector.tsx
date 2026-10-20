import React from "react";
import { Calendar, CheckSquare, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomRadioIndicator } from "./CustomRadioIndicator";

export type InvoiceExportMode = "by-period" | "by-current-filter" | "selected";

export const DEFAULT_INVOICE_EXPORT_MODES: InvoiceExportMode[] = [
  "by-period",
  "by-current-filter",
];

export interface InvoiceExportModeSelectorProps {
  exportMode: InvoiceExportMode;
  onChange: (mode: InvoiceExportMode) => void;
  modes?: InvoiceExportMode[];
  selectedCount?: number;
}

export function InvoiceExportModeSelector({
  exportMode,
  onChange,
  modes = DEFAULT_INVOICE_EXPORT_MODES,
  selectedCount = 0,
}: InvoiceExportModeSelectorProps) {
  const { t } = useTranslation("erpInvoices");

  const options: Record<
    InvoiceExportMode,
    { icon: React.ReactNode; label: string; desc: string }
  > = {
    "by-period": {
      icon: <Calendar className="w-3.5 h-3.5 text-muted-foreground" />,
      label: t("erpInvoices:exportDrawer.modePeriod", "Theo kỳ"),
      desc: t(
        "erpInvoices:exportDrawer.modePeriodDesc",
        "Chọn khoảng thời gian theo kỳ hoặc ngày tùy chỉnh",
      ),
    },
    "by-current-filter": {
      icon: <Filter className="w-3.5 h-3.5 text-foreground" />,
      label: t(
        "erpInvoices:exportDrawer.modeCurrentFilter",
        "Theo filter hiện tại",
      ),
      desc: t(
        "erpInvoices:exportDrawer.modeCurrentFilterDesc",
        "Giữ nguyên toàn bộ bộ lọc và khoảng ngày đang xem trên bảng",
      ),
    },
    selected: {
      icon: <CheckSquare className="w-3.5 h-3.5 text-foreground" />,
      label: t(
        "erpInvoices:exportDrawer.modeSelected",
        "Hóa đơn đã chọn ({{count}})",
        { count: selectedCount },
      ),
      desc: t(
        "erpInvoices:exportDrawer.modeSelectedDesc",
        "Chỉ các hóa đơn đang được chọn trên bảng",
      ),
    },
  };

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-2">
        {t("erpInvoices:exportDrawer.modeLabel", "Chế độ xuất dữ liệu")}
      </label>
      <div className="grid grid-cols-1 gap-2">
        {modes.map((mode) => {
          const checked = exportMode === mode;
          const opt = options[mode];
          return (
            <label
              key={mode}
              onClick={() => onChange(mode)}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all outline-none focus:outline-none active:outline-none focus-within:outline-none select-none [-webkit-tap-highlight-color:transparent] ${
                checked
                  ? "border-foreground bg-muted/40 text-foreground shadow-2xs"
                  : "border-border/70 hover:border-border hover:bg-muted/20 text-muted-foreground"
              }`}
            >
              <input
                type="radio"
                name="invoiceExportMode"
                value={mode}
                checked={checked}
                onChange={() => onChange(mode)}
                className="sr-only outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none [accent-color:currentColor]"
              />
              <CustomRadioIndicator checked={checked} />
              <div className="flex flex-col gap-0.5 text-xs flex-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {opt.desc}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
