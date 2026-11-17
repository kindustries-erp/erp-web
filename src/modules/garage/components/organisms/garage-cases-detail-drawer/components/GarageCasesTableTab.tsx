import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2TabBarVariant } from "@/v2/shared/components/molecules/v2-tab-bar/V2TabBar.type";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { Badge } from "@/v2/shared/ui/badge";
import { V2SearchInput } from "@/v2/shared/components/molecules/v2-search-input";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { DebtDetailTypeSwitch } from "../../garage-debt-detail-drawer/components/DebtDetailTypeSwitch";
import { filterGarageCases } from "./GarageCasesTableTab.helper";
import { createGarageCasesColumns } from "./GarageCasesTableTab.columns";
import type {
  GarageCasesTableTabProps,
  GarageCaseDetailRow,
} from "./GarageCasesTableTab.type";

export const GarageCasesTableTab: React.FC<GarageCasesTableTabProps> = ({
  cases,
  initialDebtType = "receivables",
  onOpenCaseDetail,
  showProfitMetrics = false,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const [debtType, setDebtType] = useState<"receivables" | "payables">(
    initialDebtType,
  );
  const [categoryFilter, setCategoryFilter] = useState<string>(
    showProfitMetrics ? "ALL" : "all",
  );
  const [search, setSearch] = useState("");

  const isPayable = debtType === "payables";

  const { filteredCases, totalRemaining, totalBilled } = useMemo(
    () =>
      filterGarageCases(cases, {
        showProfitMetrics,
        isPayable,
        categoryFilter,
        search,
      }),
    [cases, showProfitMetrics, isPayable, categoryFilter, search],
  );

  const columns = useMemo(
    () =>
      createGarageCasesColumns({
        isPayable,
        onOpenCaseDetail,
        showProfitMetrics,
        t,
      }),
    [isPayable, onOpenCaseDetail, showProfitMetrics, t],
  );

  const filterTabs = useMemo(() => {
    if (showProfitMetrics) {
      const getCount = (key: string) =>
        key === "ALL"
          ? cases.length
          : cases.filter((c) => (c.classification || "KHAC") === key).length;

      return [
        {
          key: "ALL",
          label: t("cases.classification.all", "Tất cả"),
          badgeCount: getCount("ALL"),
        },
        {
          key: "SUA_CHUA_CHUNG",
          label: t("cases.classification.repair", "Sửa chữa chung"),
          badgeCount: getCount("SUA_CHUA_CHUNG"),
        },
        {
          key: "KY_GUI_NOI_BO",
          label: t("cases.classification.consignment", "Ký gửi / Nội bộ"),
          badgeCount: getCount("KY_GUI_NOI_BO"),
        },
        {
          key: "OJ_NGOAI",
          label: t("cases.classification.outsource", "OJ Ngoài"),
          badgeCount: getCount("OJ_NGOAI"),
        },
        {
          key: "KHAC",
          label: t("cases.classification.other", "Khác"),
          badgeCount: getCount("KHAC"),
        },
      ];
    }

    const debtCases = cases.filter((c) =>
      isPayable ? c.remainingCost > 0 : c.remaining > 0,
    );
    return [
      {
        key: "all",
        label: t("progress.partnerFilterTabs.all", "Tất cả"),
        badgeCount: debtCases.length,
      },
      {
        key: "enterprise",
        label: t("progress.partnerFilterTabs.enterprise", "Doanh nghiệp"),
        badgeCount: debtCases.filter((c) => c.partnerType === "enterprise")
          .length,
      },
      {
        key: "individual",
        label: t("progress.partnerFilterTabs.individual", "Cá nhân"),
        badgeCount: debtCases.filter((c) => c.partnerType === "individual")
          .length,
      },
      {
        key: "insurance",
        label: t("progress.partnerFilterTabs.insurance", "Bảo hiểm"),
        badgeCount: debtCases.filter((c) => c.partnerType === "insurance")
          .length,
      },
    ];
  }, [showProfitMetrics, cases, isPayable, t]);

  const sectionTitle = showProfitMetrics
    ? t("cases.title.periodCases", "Danh sách vụ việc dịch vụ trong kỳ")
    : isPayable
      ? t(
          "debts.detailDrawer.unpaidPayableCases",
          "Danh sách phiếu còn phải chi",
        )
      : t(
          "debts.detailDrawer.unpaidReceivableCases",
          "Danh sách phiếu còn phải thu",
        );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center overflow-x-auto scrollbar-none min-w-0">
          <V2TabBar
            variant={V2TabBarVariant.SUB}
            tabs={filterTabs}
            activeTabKey={categoryFilter}
            onTabChange={setCategoryFilter}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <V2SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("common.search", "Tìm số phiếu, xe...")}
            debounceMs={150}
            className="w-36 sm:w-48"
          />
          {!showProfitMetrics && (
            <DebtDetailTypeSwitch value={debtType} onChange={setDebtType} />
          )}
        </div>
      </div>

      <DrawerSection
        title={sectionTitle}
        titleExtra={
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground">
              {filteredCases.length} {t("common.cases", "phiếu")}
            </span>
            {showProfitMetrics
              ? totalBilled > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-mono font-bold bg-primary/10 text-primary border-primary/20"
                  >
                    {money(totalBilled)}
                  </Badge>
                )
              : totalRemaining > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] font-mono font-bold",
                      isPayable
                        ? "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
                    )}
                  >
                    {money(totalRemaining)}
                  </Badge>
                )}
          </div>
        }
        collapsible
        defaultCollapsed={false}
      >
        <V2StandardTable<GarageCaseDetailRow>
          tableId="garage-cases-detail-table"
          mode="client"
          columns={columns}
          items={filteredCases}
          getRowKey={(row) => row.rowKey}
          initialQuery={{ pageSize: 10, page: 1 }}
          emptyLabel={t(
            "cases.emptyLabel",
            "Không có vụ việc nào phù hợp với bộ lọc",
          )}
        />
      </DrawerSection>
    </div>
  );
};
