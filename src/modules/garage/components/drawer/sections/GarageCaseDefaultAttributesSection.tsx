import React, { useMemo } from "react";
import {
  DrawerSection,
  DrawerRow,
  DrawerField,
} from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { GarageCaseClassificationBadge } from "../../GarageCaseClassificationBadge";
import { GarageCaseExclusionBadges } from "../../GarageCaseExclusionBadges";
import { GARAGE_CASE_CLASSIFICATIONS } from "../../GarageCaseClassificationBadge";
import { moduleConfigApi } from "@/core/api/moduleConfigApi";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/core/config/appStore";

export interface GarageCaseDefaultAttributesSectionProps {
  caseData: any;
  editMode: boolean;
  categoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  excludeFromReports: boolean;
  onExcludeFromReportsChange: (val: boolean) => void;
  excludeFromDebt: boolean;
  onExcludeFromDebtChange: (val: boolean) => void;
  onStartEdit?: () => void;
}

export function GarageCaseDefaultAttributesSection({
  caseData,
  editMode,
  categoryId,
  onCategoryChange,
  excludeFromReports,
  onExcludeFromReportsChange,
  excludeFromDebt,
  onExcludeFromDebtChange,
  onStartEdit,
}: GarageCaseDefaultAttributesSectionProps) {
  const { t } = useTranslation("garage");
  const locale = useAppStore((s) => s.locale);

  // Fetch Module Categories for GARAGE_CASE
  const { data: categories = [] } = useQuery({
    queryKey: ["module-config-categories", "GARAGE_CASE"],
    queryFn: () => moduleConfigApi.getCategories("GARAGE_CASE"),
    staleTime: 60000,
  });

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    if (categories.length > 0) {
      return categories.map((c) => {
        const nameDisplay = locale === "en" && c.nameEn ? c.nameEn : c.name;
        const meta = GARAGE_CASE_CLASSIFICATIONS[c.code];
        return {
          value: c.id,
          label: nameDisplay,
          subLabel: c.description || meta?.subLabel,
        };
      });
    }

    return Object.values(GARAGE_CASE_CLASSIFICATIONS).map((c) => ({
      value: c.value,
      label: c.label,
      subLabel: c.subLabel,
    }));
  }, [categories, locale]);

  const resolvedCategory = useMemo(() => {
    if (caseData.category) return caseData.category;
    if (caseData.categoryId && categories.length > 0) {
      return categories.find((c: any) => c.id === caseData.categoryId) || null;
    }
    return null;
  }, [caseData.category, caseData.categoryId, categories]);

  if (!caseData) return null;

  return (
    <DrawerSection
      title={t("cases.drawer.defaultAttributes", "Thuộc tính mặc định")}
      collapsible
      defaultCollapsed={false}
    >
      {!editMode ? (
        <>
          <DrawerRow
            label={t("cases.drawer.classification", "Phân loại")}
            value={
              <button
                type="button"
                onClick={() => onStartEdit?.()}
                className="cursor-pointer transition-transform hover:scale-105 inline-flex"
                title={t(
                  "cases.actions.clickToEditClassification",
                  "Nhấn để chỉnh sửa phân loại",
                )}
              >
                <GarageCaseClassificationBadge
                  category={resolvedCategory}
                  classification={caseData.classification}
                  interactive={true}
                />
              </button>
            }
          />

          {(caseData.excludeFromReports || caseData.excludeFromDebt) && (
            <DrawerRow
              label={t("cases.drawer.exclusionsSection", "Quy tắc loại trừ")}
              value={
                <GarageCaseExclusionBadges
                  excludeFromReports={caseData.excludeFromReports}
                  excludeFromDebt={caseData.excludeFromDebt}
                  showLabels={true}
                />
              }
            />
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3.5 pt-0.5">
          <DrawerField
            label={t(
              "cases.configDrawer.classificationLabel",
              "Phân loại phiếu (ERP)",
            )}
          >
            <Combobox
              options={categoryOptions}
              value={categoryId || ""}
              onChange={(val) => onCategoryChange(val || null)}
              allowClear={true}
              placeholder={t(
                "cases.configDrawer.classificationPlaceholder",
                "— Chọn phân loại —",
              )}
            />
          </DrawerField>

          {/* Cờ loại trừ Báo cáo */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20">
            <Checkbox
              id="case-exclude-from-reports"
              checked={excludeFromReports}
              onCheckedChange={(checked) =>
                onExcludeFromReportsChange(Boolean(checked))
              }
              className="mt-0.5"
            />
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="case-exclude-from-reports"
                className="text-xs font-semibold text-foreground cursor-pointer select-none"
              >
                {t("cases.drawer.excludeFromReports", "Không tính vào báo cáo")}
              </label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t(
                  "cases.drawer.excludeFromReportsDesc",
                  "Loại trừ vụ việc này khỏi Báo cáo P&L, Checkpoint & Doanh thu Garage",
                )}
              </p>
            </div>
          </div>

          {/* Cờ loại trừ Công nợ */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-rose-200/80 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20">
            <Checkbox
              id="case-exclude-from-debt"
              checked={excludeFromDebt}
              onCheckedChange={(checked) =>
                onExcludeFromDebtChange(Boolean(checked))
              }
              className="mt-0.5"
            />
            <div className="flex flex-col gap-0.5">
              <label
                htmlFor="case-exclude-from-debt"
                className="text-xs font-semibold text-foreground cursor-pointer select-none"
              >
                {t(
                  "cases.drawer.excludeFromDebt",
                  "Không tính công nợ doanh thu / chi phí",
                )}
              </label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t(
                  "cases.drawer.excludeFromDebtDesc",
                  "Loại trừ vụ việc này khỏi Sổ theo dõi công nợ khách hàng Garage",
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </DrawerSection>
  );
}
