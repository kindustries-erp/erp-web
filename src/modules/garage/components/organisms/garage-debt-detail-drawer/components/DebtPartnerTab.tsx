import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PillTabs } from "@/shared/components/PillTabs";
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
  const showAll = partnerTypeFilter === "all";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center overflow-x-auto scrollbar-none min-w-0">
          <PillTabs<PartnerTypeFilter>
            size="sm"
            className="w-auto"
            headerClassName="flex-nowrap"
            items={[
              {
                value: "all",
                label: t("progress.partnerFilterTabs.all", "Tất cả đối tượng"),
                badge: totalPartnerCount,
              },
              {
                value: "enterprise",
                label: t(
                  "progress.partnerFilterTabs.enterprise",
                  "KH Doanh nghiệp",
                ),
                badge: enterprise.all.length,
              },
              {
                value: "individual",
                label: t("progress.partnerFilterTabs.individual", "KH Cá nhân"),
                badge: individual.all.length,
              },
              {
                value: "insurance",
                label: t("progress.partnerFilterTabs.insurance", "Bảo hiểm"),
                badge: insurance.all.length,
              },
            ]}
            value={partnerTypeFilter}
            onValueChange={setPartnerTypeFilter}
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

      {(showAll || partnerTypeFilter === "enterprise") && (
        <MonthPartnerCategorizedSection
          title={
            isPayableBreakdown
              ? t(
                  "progress.sections.enterprisePayment",
                  "Chi Khách hàng Doanh nghiệp",
                )
              : t(
                  "progress.sections.enterpriseCollection",
                  "Thu Khách hàng Doanh nghiệp",
                )
          }
          categorized={enterprise}
          tableIdPrefix="garage-debt-detail-enterprise"
          totalBilled={effectiveBreakdownTotal}
          debtType={partnerDebtType}
          isAllTab={showAll}
          onSelectGroup={onSelectGroup}
          onOpenCaseDetail={onOpenCaseDetail}
          defaultCollapsed={false}
        />
      )}

      {(showAll || partnerTypeFilter === "individual") && (
        <MonthPartnerCategorizedSection
          title={
            isPayableBreakdown
              ? t(
                  "progress.sections.individualPayment",
                  "Chi Khách hàng Cá nhân",
                )
              : t(
                  "progress.sections.individualCollection",
                  "Thu Khách hàng Cá nhân",
                )
          }
          categorized={individual}
          tableIdPrefix="garage-debt-detail-individual"
          totalBilled={effectiveBreakdownTotal}
          debtType={partnerDebtType}
          isAllTab={showAll}
          onSelectGroup={onSelectGroup}
          onOpenCaseDetail={onOpenCaseDetail}
          defaultCollapsed={false}
        />
      )}

      {(showAll || partnerTypeFilter === "insurance") && (
        <MonthPartnerCategorizedSection
          title={
            isPayableBreakdown
              ? t("progress.sections.insurancePayment", "Chi bảo hiểm")
              : t("progress.sections.insuranceCollection", "Thu bảo hiểm")
          }
          categorized={insurance}
          tableIdPrefix="garage-debt-detail-insurance"
          totalBilled={effectiveBreakdownTotal}
          debtType={partnerDebtType}
          isAllTab={showAll}
          onSelectGroup={onSelectGroup}
          onOpenCaseDetail={onOpenCaseDetail}
          defaultCollapsed={false}
        />
      )}
    </div>
  );
};
