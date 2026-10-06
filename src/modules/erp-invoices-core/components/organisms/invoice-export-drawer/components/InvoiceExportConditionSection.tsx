import React from "react";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import type { InvoiceExportDrawerProps } from "../InvoiceExportDrawer.type";
import {
  InvoiceExportModeSelector,
  type InvoiceExportMode,
} from "./InvoiceExportModeSelector";
import { InvoiceExportFilterPreview } from "./InvoiceExportFilterPreview";

export interface InvoiceExportConditionSectionProps {
  exportMode: InvoiceExportMode;
  onExportModeChange: (mode: InvoiceExportMode) => void;
  period: string;
  onPeriodChange: (period?: string) => void;
  periodOptions: Array<{ value: string; label: string }>;
  dateFrom?: string;
  onDateFromChange: (val?: string) => void;
  dateTo?: string;
  onDateToChange: (val?: string) => void;
  currentFilterSummary?: InvoiceExportDrawerProps["currentFilterSummary"];
  starting: boolean;
  onStartExport: () => void;
}

export function InvoiceExportConditionSection({
  exportMode,
  onExportModeChange,
  period,
  onPeriodChange,
  periodOptions,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  currentFilterSummary,
  starting,
  onStartExport,
}: InvoiceExportConditionSectionProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <DrawerSection
      title={t(
        "erpInvoices:exportDrawer.filterConditions",
        "Điều kiện xuất dữ liệu",
      )}
      collapsible
      defaultCollapsed={false}
    >
      <div className="space-y-3">
        <InvoiceExportModeSelector
          exportMode={exportMode}
          onChange={onExportModeChange}
        />

        {exportMode === "by-period" ? (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("erpInvoices:exportDrawer.period", "Kỳ")}
              </label>
              <Combobox
                options={periodOptions}
                value={period}
                onChange={(v) => onPeriodChange(v ?? "")}
                placeholder={t(
                  "erpInvoices:exportDrawer.selectPeriod",
                  "Chọn kỳ...",
                )}
                allowClear={false}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("erpInvoices:exportDrawer.dateFrom", "Từ ngày")}
              </label>
              <DatePicker
                value={dateFrom || ""}
                onChange={onDateFromChange}
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("erpInvoices:exportDrawer.dateTo", "Đến ngày")}
              </label>
              <DatePicker
                value={dateTo || ""}
                onChange={onDateToChange}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </>
        ) : (
          <InvoiceExportFilterPreview
            currentFilterSummary={currentFilterSummary}
          />
        )}

        <div className="pt-2">
          <Button
            className="w-full justify-center"
            onClick={onStartExport}
            disabled={starting}
          >
            <Play className="w-4 h-4 mr-1.5" />
            {starting
              ? t("erpInvoices:exportDrawer.starting", "Đang khởi tạo...")
              : t("erpInvoices:exportDrawer.start", "Xuất Excel")}
          </Button>
        </div>
      </div>
    </DrawerSection>
  );
}
