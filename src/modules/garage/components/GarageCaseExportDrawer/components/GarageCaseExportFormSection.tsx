import React from "react";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Button } from "@/shared/components/ui/Button";

export interface GarageCaseExportFormSectionProps {
  period: string;
  periodOptions: ComboboxOption[];
  onPeriodChange: (val?: string) => void;
  dateType: "completion_date" | "case_date";
  dateTypeOptions: ComboboxOption[];
  onDateTypeChange: (val: "completion_date" | "case_date") => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  selectedBranchId: string;
  branchOptions: ComboboxOption[];
  selectedClassification: string;
  classificationOptions: ComboboxOption[];
  onClassificationChange: (val: string) => void;
  selectedStatus: string;
  statusOptions: ComboboxOption[];
  onStatusChange: (val: string) => void;
  exporting: boolean;
  onStartExport: () => void;
}

export const GarageCaseExportFormSection = React.memo(
  function GarageCaseExportFormSection({
    period,
    periodOptions,
    onPeriodChange,
    dateType,
    dateTypeOptions,
    onDateTypeChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    selectedBranchId,
    branchOptions,
    selectedClassification,
    classificationOptions,
    onClassificationChange,
    selectedStatus,
    statusOptions,
    onStatusChange,
    exporting,
    onStartExport,
  }: GarageCaseExportFormSectionProps) {
    const { t } = useTranslation("garage");

    return (
      <div className="space-y-4">
        {/* Nhóm 1: Khoảng thời gian báo cáo */}
        <DrawerSection
          title={t(
            "cases.exportDrawer.timeConditions",
            "Khoảng thời gian báo cáo",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("cases.exportDrawer.period", "Kỳ báo cáo")}
              </label>
              <Combobox
                options={periodOptions}
                value={period}
                onChange={(v) => onPeriodChange(v ?? "")}
                placeholder={t("cases.exportDrawer.selectPeriod", "Chọn kỳ...")}
                allowClear={false}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("cases.exportDrawer.dateType", "Loại ngày lọc")}
              </label>
              <Combobox
                options={dateTypeOptions}
                value={dateType}
                onChange={(v) =>
                  onDateTypeChange(
                    (v as "completion_date" | "case_date") || "completion_date",
                  )
                }
                allowClear={false}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("cases.exportDrawer.dateFrom", "Từ ngày")}
              </label>
              <DatePicker
                value={dateFrom}
                onChange={(v) => onDateFromChange(v)}
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("cases.exportDrawer.dateTo", "Đến ngày")}
              </label>
              <DatePicker
                value={dateTo}
                onChange={(v) => onDateToChange(v)}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>
        </DrawerSection>

        {/* Nhóm 2: Phạm vi & Điều kiện lọc */}
        <DrawerSection
          title={t(
            "cases.exportDrawer.scopeConditions",
            "Phạm vi & Điều kiện lọc",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("cases.exportDrawer.branch", "Chi nhánh")}
              </label>
              {/* Field Chi nhánh: Disabled để user chỉ view, không chỉnh sửa */}
              <Combobox
                options={branchOptions}
                value={selectedBranchId}
                onChange={() => {}}
                placeholder={t(
                  "cases.exportDrawer.allBranches",
                  "Tất cả chi nhánh",
                )}
                disabled={true}
                allowClear={false}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("cases.exportDrawer.classification", "Phân loại vụ việc")}
              </label>
              <Combobox
                options={classificationOptions}
                value={selectedClassification}
                onChange={(v) => onClassificationChange(v ?? "")}
                placeholder={t(
                  "cases.exportDrawer.allClassifications",
                  "Tất cả phân loại",
                )}
                allowClear={true}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("cases.exportDrawer.status", "Trạng thái phiếu")}
              </label>
              <Combobox
                options={statusOptions}
                value={selectedStatus}
                onChange={(v) => onStatusChange(v ?? "completed")}
                allowClear={false}
              />
            </div>

            <div className="pt-2">
              <Button
                className="w-full justify-center"
                onClick={onStartExport}
                disabled={exporting}
              >
                <Play className="w-4 h-4 mr-1.5" />
                {exporting
                  ? t("cases.exportDrawer.exporting", "Đang tạo file Excel...")
                  : t("cases.exportDrawer.startExport", "Xuất Excel")}
              </Button>
            </div>
          </div>
        </DrawerSection>
      </div>
    );
  },
);
