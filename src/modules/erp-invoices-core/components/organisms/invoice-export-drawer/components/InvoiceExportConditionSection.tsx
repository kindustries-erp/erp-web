import React from "react";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PillTabs } from "@/shared/components/PillTabs";
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
  periodType?: "month" | "quarter" | "custom";
  onPeriodTypeChange?: (type: "month" | "quarter" | "custom") => void;
  period: string;
  onPeriodChange: (period?: string) => void;
  periodOptions: Array<{ value: string; label: string }>;
  quarter?: string;
  onQuarterChange?: (quarter?: string) => void;
  quarterOptions?: Array<{ value: string; label: string }>;
  dateFrom?: string;
  onDateFromChange: (val?: string) => void;
  dateTo?: string;
  onDateToChange: (val?: string) => void;
  currentFilterSummary?: InvoiceExportDrawerProps["currentFilterSummary"];
  starting: boolean;
  onStartExport: () => void;
  /** Chế độ phạm vi được phép; mặc định theo kỳ + theo filter. */
  modes?: InvoiceExportMode[];
  selectedCount?: number;
  /** Nhãn/icon nút chạy; mặc định "Xuất Excel". */
  startLabel?: string;
  startIcon?: React.ReactNode;
  /** Nội dung chèn trước nút chạy (vd: chọn loại file PDF/XML). */
  children?: React.ReactNode;
}

export function InvoiceExportConditionSection({
  exportMode,
  onExportModeChange,
  periodType = "month",
  onPeriodTypeChange,
  period,
  onPeriodChange,
  periodOptions,
  quarter = "",
  onQuarterChange,
  quarterOptions = [],
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  currentFilterSummary,
  starting,
  onStartExport,
  modes,
  selectedCount,
  startLabel,
  startIcon,
  children,
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
          modes={modes}
          selectedCount={selectedCount}
        />

        {exportMode === "by-period" ? (
          <>
            {onPeriodTypeChange && (
              <div className="pt-0.5 pb-0.5">
                <PillTabs<"month" | "quarter" | "custom">
                  size="sm"
                  variant="pill"
                  className="w-full shrink-0"
                  listClassName="w-full grid grid-cols-3"
                  triggerClassName="justify-center flex-1"
                  value={periodType}
                  onValueChange={onPeriodTypeChange}
                  items={[
                    {
                      value: "month",
                      label: t(
                        "erpInvoices:exportDrawer.periodTypeMonth",
                        "Theo tháng",
                      ),
                    },
                    {
                      value: "quarter",
                      label: t(
                        "erpInvoices:exportDrawer.periodTypeQuarter",
                        "Theo quý",
                      ),
                    },
                    {
                      value: "custom",
                      label: t(
                        "erpInvoices:exportDrawer.periodTypeCustom",
                        "Tùy chỉnh",
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {periodType === "month" && (
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
            )}

            {periodType === "quarter" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("erpInvoices:exportDrawer.quarter", "Quý")}
                </label>
                <Combobox
                  options={quarterOptions}
                  value={quarter}
                  onChange={(v) => onQuarterChange?.(v ?? "")}
                  placeholder={t(
                    "erpInvoices:exportDrawer.selectQuarter",
                    "Chọn quý...",
                  )}
                  allowClear={false}
                />
              </div>
            )}

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
        ) : exportMode === "by-current-filter" ? (
          <InvoiceExportFilterPreview
            currentFilterSummary={currentFilterSummary}
          />
        ) : null}

        {children}

        <div className="pt-2">
          <Button
            className="w-full justify-center"
            onClick={onStartExport}
            disabled={starting}
          >
            {startIcon ?? <Play className="w-4 h-4 mr-1.5" />}
            {starting
              ? t("erpInvoices:exportDrawer.starting", "Đang khởi tạo...")
              : (startLabel ??
                t("erpInvoices:exportDrawer.start", "Xuất Excel"))}
          </Button>
        </div>
      </div>
    </DrawerSection>
  );
}
