import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2TabBarVariant } from "@/v2/shared/components/molecules/v2-tab-bar/V2TabBar.type";
import { CustomerDetailDebtSwitch } from "../../garage-customer-detail-drawer/components/CustomerDetailDebtSwitch";
import { MonthPartnerCategorizedSection } from "../../garage-month-detail-drawer/components/MonthPartnerCategorizedSection";
import type {
  MonthlyReceivablesGroupCategorized,
  MonthlyReceivablesGroupItem,
} from "@/modules/garage/api/garageDashboardApi";

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

type PartnerTypeFilter = "all" | "enterprise" | "individual" | "insurance";

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

  const { enterprise, individual, insurance } = safeCategorized;
  const totalPartnerCount =
    enterprise.all.length + individual.all.length + insurance.all.length;
  const isPayableBreakdown = partnerDebtType === "payables";

  // Gom toàn bộ đối tượng về 1 nhóm tổng hợp khi ở tab "all"
  const allCombinedCategorized =
    useMemo<MonthlyReceivablesGroupCategorized>(() => {
      const allGroups = [
        ...insurance.all,
        ...enterprise.all,
        ...individual.all,
      ];
      return {
        all: allGroups,
        withInvoice: allGroups.filter((i) => i.hasInvoice),
        pendingInvoice: allGroups.filter((i) => i.vatWarning),
        noInvoice: allGroups.filter((i) => !i.hasInvoice && !i.vatWarning),
        totals: {
          billed:
            enterprise.totals.billed +
            individual.totals.billed +
            insurance.totals.billed,
          paid:
            enterprise.totals.paid +
            individual.totals.paid +
            insurance.totals.paid,
          remaining:
            enterprise.totals.remaining +
            individual.totals.remaining +
            insurance.totals.remaining,
          cost:
            (enterprise.totals.cost ?? 0) +
            (individual.totals.cost ?? 0) +
            (insurance.totals.cost ?? 0),
          paidCost:
            (enterprise.totals.paidCost ?? 0) +
            (individual.totals.paidCost ?? 0) +
            (insurance.totals.paidCost ?? 0),
          remainingCost:
            (enterprise.totals.remainingCost ?? 0) +
            (individual.totals.remainingCost ?? 0) +
            (insurance.totals.remainingCost ?? 0),
          caseCount:
            enterprise.totals.caseCount +
            individual.totals.caseCount +
            insurance.totals.caseCount,
          partnerCount:
            enterprise.totals.partnerCount +
            individual.totals.partnerCount +
            insurance.totals.partnerCount,
        },
      };
    }, [enterprise, individual, insurance]);

  const activeSectionConfig = useMemo(() => {
    switch (partnerTypeFilter) {
      case "enterprise":
        return {
          title: isPayableBreakdown
            ? t(
                "progress.sections.enterprisePayment",
                "Chi Khách hàng Doanh nghiệp",
              )
            : t(
                "progress.sections.enterpriseCollection",
                "Thu Khách hàng Doanh nghiệp",
              ),
          categorized: enterprise,
          tableIdPrefix: "garage-debt-detail-enterprise",
          isAllTab: false,
        };
      case "individual":
        return {
          title: isPayableBreakdown
            ? t("progress.sections.individualPayment", "Chi Khách hàng Cá nhân")
            : t(
                "progress.sections.individualCollection",
                "Thu Khách hàng Cá nhân",
              ),
          categorized: individual,
          tableIdPrefix: "garage-debt-detail-individual",
          isAllTab: false,
        };
      case "insurance":
        return {
          title: isPayableBreakdown
            ? t("progress.sections.insurancePayment", "Chi bảo hiểm")
            : t("progress.sections.insuranceCollection", "Thu bảo hiểm"),
          categorized: insurance,
          tableIdPrefix: "garage-debt-detail-insurance",
          isAllTab: false,
        };
      case "all":
      default:
        return {
          title: isPayableBreakdown
            ? t("progress.sections.allPayment", "Chi tất cả đối tượng")
            : t("progress.sections.allCollection", "Thu tất cả đối tượng"),
          categorized: allCombinedCategorized,
          tableIdPrefix: "garage-debt-detail-all-partners",
          isAllTab: true,
        };
    }
  }, [
    partnerTypeFilter,
    isPayableBreakdown,
    t,
    enterprise,
    individual,
    insurance,
    allCombinedCategorized,
  ]);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3 w-full">
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
        <div className="shrink-0 flex items-center">
          <CustomerDetailDebtSwitch
            className="w-auto"
            value={partnerDebtType}
            onChange={onPartnerDebtTypeChange}
          />
        </div>
      </div>

      {/* Render duy nhất 1 component section tương ứng với tab đang chọn */}
      <MonthPartnerCategorizedSection
        title={activeSectionConfig.title}
        categorized={activeSectionConfig.categorized}
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
