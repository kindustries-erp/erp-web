import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2TabBarVariant } from "@/v2/shared/components/molecules/v2-tab-bar/V2TabBar.type";
import { V2SearchInput } from "@/v2/shared/components/molecules/v2-search-input";
import { MonthPartnerCategorizedSection } from "../../garage-month-detail-drawer/components/MonthPartnerCategorizedSection";
import type {
  MonthlyReceivablesGroupCategorized,
  MonthlyReceivablesGroupItem,
} from "@/modules/garage/api/garageDashboardApi";
import { DebtDetailTypeSwitch } from "./DebtDetailTypeSwitch";
import {
  buildCombinedCategorized,
  getActivePartnerSectionConfig,
  filterPartnerCategorized,
  type PartnerTypeFilter,
} from "./DebtPartnerTab.helper";

export interface DebtPartnerTabProps {
  safeCategorized: {
    enterprise: MonthlyReceivablesGroupCategorized;
    individual: MonthlyReceivablesGroupCategorized;
    insurance: MonthlyReceivablesGroupCategorized;
  };
  partnerDebtType: "receivables" | "payables";
  onPartnerDebtTypeChange: (val: "receivables" | "payables") => void;
  effectiveBreakdownTotal: number;
  onSelectGroup: (group: MonthlyReceivablesGroupItem) => void;
  onOpenCaseDetail?: (code: string) => void;
}

/** Tab "Phân loại theo đối tượng": KH doanh nghiệp, KH cá nhân, bảo hiểm. Dùng chung cho tháng và mốc. */
export const DebtPartnerTab: React.FC<DebtPartnerTabProps> = ({
  safeCategorized,
  partnerDebtType,
  onPartnerDebtTypeChange,
  effectiveBreakdownTotal,
  onSelectGroup,
  onOpenCaseDetail,
}) => {
  const { t } = useTranslation(["garage", "common"]);
  const [partnerTypeFilter, setPartnerTypeFilter] =
    useState<PartnerTypeFilter>("all");
  const [search, setSearch] = useState("");

  const { enterprise, individual, insurance } = safeCategorized;
  const totalPartnerCount =
    enterprise.all.length + individual.all.length + insurance.all.length;
  const isPayableBreakdown = partnerDebtType === "payables";

  const allCombinedCategorized = useMemo(
    () => buildCombinedCategorized(enterprise, individual, insurance),
    [enterprise, individual, insurance],
  );

  const activeSectionConfig = useMemo(
    () =>
      getActivePartnerSectionConfig(
        partnerTypeFilter,
        isPayableBreakdown,
        enterprise,
        individual,
        insurance,
        allCombinedCategorized,
        t,
      ),
    [
      partnerTypeFilter,
      isPayableBreakdown,
      enterprise,
      individual,
      insurance,
      allCombinedCategorized,
      t,
    ],
  );

  const displayedCategorized = useMemo(
    () => filterPartnerCategorized(activeSectionConfig.categorized, search),
    [activeSectionConfig.categorized, search],
  );

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center overflow-x-auto scrollbar-none min-w-0">
          <V2TabBar
            variant={V2TabBarVariant.SUB}
            tabs={[
              {
                key: "all",
                label: t("progress.partnerFilterTabs.all", "Tất cả đối tượng"),
                badgeCount: totalPartnerCount,
              },
              {
                key: "enterprise",
                label: t(
                  "progress.partnerFilterTabs.enterprise",
                  "KH Doanh nghiệp",
                ),
                badgeCount: enterprise.all.length,
              },
              {
                key: "individual",
                label: t("progress.partnerFilterTabs.individual", "KH Cá nhân"),
                badgeCount: individual.all.length,
              },
              {
                key: "insurance",
                label: t("progress.partnerFilterTabs.insurance", "Bảo hiểm"),
                badgeCount: insurance.all.length,
              },
            ]}
            activeTabKey={partnerTypeFilter}
            onTabChange={(key) =>
              setPartnerTypeFilter(key as PartnerTypeFilter)
            }
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <V2SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("common.searchPartner", "Tìm đối tượng, MST, xe...")}
            debounceMs={150}
            className="w-36 sm:w-48"
          />
          <DebtDetailTypeSwitch
            value={partnerDebtType}
            onChange={onPartnerDebtTypeChange}
          />
        </div>
      </div>

      {/* Render duy nhất 1 component section tương ứng với tab đang chọn */}
      <MonthPartnerCategorizedSection
        title={activeSectionConfig.title}
        categorized={displayedCategorized}
        tableIdPrefix={activeSectionConfig.tableIdPrefix}
        totalBilled={effectiveBreakdownTotal}
        debtType={partnerDebtType}
        isAllTab={activeSectionConfig.isAllTab}
        onSelectGroup={onSelectGroup}
        onOpenCaseDetail={onOpenCaseDetail}
        defaultCollapsed={false}
      />
    </div>
  );
};
