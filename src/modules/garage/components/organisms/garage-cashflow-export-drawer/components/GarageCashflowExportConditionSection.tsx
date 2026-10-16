import React from "react";
import { Play } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  GarageCashflowExportModeSelector,
  type GarageCashflowExportMode,
} from "./GarageCashflowExportModeSelector";
import {
  GarageCashflowExportFilterPreview,
  type GarageCashflowExportFilterSummary,
} from "./GarageCashflowExportFilterPreview";

export type { GarageCashflowExportMode };
export type GarageCashflowPeriodType = "week" | "month" | "quarter" | "custom";

export interface GarageCashflowExportConditionSectionProps {
  exportMode: GarageCashflowExportMode;
  onExportModeChange: (mode: GarageCashflowExportMode) => void;
  periodType: GarageCashflowPeriodType;
  onPeriodTypeChange: (type: GarageCashflowPeriodType) => void;
  week: string;
  onWeekChange: (val: string) => void;
  weekOptions: Array<{ value: string; label: string }>;
  period: string;
  onPeriodChange: (val: string) => void;
  periodOptions: Array<{ value: string; label: string }>;
  quarter: string;
  onQuarterChange: (val: string) => void;
  quarterOptions: Array<{ value: string; label: string }>;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  accountOptions: Array<{ value: string; label: string }>;
  selectedAccountId: string;
  onSelectedAccountIdChange: (val: string) => void;
  transactionTypeOptions: Array<{ value: string; label: string }>;
  transactionType: string;
  onTransactionTypeChange: (val: string) => void;
  filterSummary?: GarageCashflowExportFilterSummary;
  starting: boolean;
  onStartExport: () => void;
}

export function GarageCashflowExportConditionSection(
  props: GarageCashflowExportConditionSectionProps,
) {
  const {
    exportMode,
    onExportModeChange,
    periodType,
    onPeriodTypeChange,
    week,
    onWeekChange,
    weekOptions,
    period,
    onPeriodChange,
    periodOptions,
    quarter,
    onQuarterChange,
    quarterOptions,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    accountOptions,
    selectedAccountId,
    onSelectedAccountIdChange,
    transactionTypeOptions,
    transactionType,
    onTransactionTypeChange,
    filterSummary,
    starting,
    onStartExport,
  } = props;

  return (
    <DrawerSection
      title="ĐIỀU KIỆN XUẤT DỮ LIỆU"
      collapsible
      defaultCollapsed={false}
    >
      <div className="space-y-4">
        {/* Chế độ xuất dữ liệu (Theo kỳ vs Theo filter hiện tại) */}
        <GarageCashflowExportModeSelector
          exportMode={exportMode}
          onChange={onExportModeChange}
        />

        {exportMode === "by-period" ? (
          <div className="space-y-3 pt-1 border-t border-border/60">
            <div className="pt-0.5 pb-0.5">
              <PillTabs<GarageCashflowPeriodType>
                size="sm"
                variant="pill"
                className="w-full shrink-0"
                listClassName="w-full grid grid-cols-4"
                triggerClassName="justify-center flex-1"
                value={periodType}
                onValueChange={onPeriodTypeChange}
                items={[
                  { value: "week", label: "Theo tuần" },
                  { value: "month", label: "Theo tháng" },
                  { value: "quarter", label: "Theo quý" },
                  { value: "custom", label: "Tùy chỉnh" },
                ]}
              />
            </div>

            {periodType === "week" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Tuần
                </label>
                <Combobox
                  options={weekOptions}
                  value={week}
                  onChange={onWeekChange}
                  placeholder="Chọn tuần..."
                  allowClear={false}
                />
              </div>
            )}

            {periodType === "month" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Kỳ
                </label>
                <Combobox
                  options={periodOptions}
                  value={period}
                  onChange={onPeriodChange}
                  placeholder="Chọn kỳ..."
                  allowClear={false}
                />
              </div>
            )}

            {periodType === "quarter" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Quý
                </label>
                <Combobox
                  options={quarterOptions}
                  value={quarter}
                  onChange={onQuarterChange}
                  placeholder="Chọn quý..."
                  allowClear={false}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Từ ngày
              </label>
              <DatePicker
                value={dateFrom}
                onChange={(val) => onDateFromChange(val || "")}
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Đến ngày
              </label>
              <DatePicker
                value={dateTo}
                onChange={(val) => onDateToChange(val || "")}
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Tài khoản ngân hàng
              </label>
              <Combobox
                options={accountOptions}
                value={selectedAccountId}
                onChange={(val) => onSelectedAccountIdChange(val || "")}
                placeholder="Tất cả tài khoản ngân hàng"
                allowClear={false}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Loại giao dịch
              </label>
              <Combobox
                options={transactionTypeOptions}
                value={transactionType}
                onChange={(val) => onTransactionTypeChange(val || "")}
                placeholder="Tất cả loại giao dịch"
                allowClear={false}
              />
            </div>
          </div>
        ) : (
          <div className="pt-1 border-t border-border/60">
            <GarageCashflowExportFilterPreview summary={filterSummary} />
          </div>
        )}

        <div className="pt-2">
          <Button
            className="w-full justify-center"
            onClick={onStartExport}
            disabled={starting}
          >
            <Play className="w-4 h-4 mr-1.5" />
            {starting ? "Đang khởi tạo..." : "Xuất Excel"}
          </Button>
        </div>
      </div>
    </DrawerSection>
  );
}
