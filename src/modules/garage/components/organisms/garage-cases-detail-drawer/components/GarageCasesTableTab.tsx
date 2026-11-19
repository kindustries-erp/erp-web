import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2TabBarVariant } from "@/v2/shared/components/molecules/v2-tab-bar/V2TabBar.type";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { Badge } from "@/v2/shared/ui/badge";
import { V2SearchInput } from "@/v2/shared/components/molecules/v2-search-input";
import { money } from "@/shared/utils/format";
import {
  filterGarageCases,
  calculateFunnelStatusCounts,
} from "./GarageCasesTableTab.helper";
import { buildGarageCaseFilterTabs } from "./GarageCasesTableTab.subtabs";
import { createGarageCasesColumns } from "./GarageCasesTableTab.columns";
import type {
  GarageCasesTableTabProps,
  GarageCaseDetailRow,
} from "./GarageCasesTableTab.type";

export const GarageCasesTableTab: React.FC<GarageCasesTableTabProps> = ({
  cases,
  onOpenCaseDetail,
  showProfitMetrics = false,
  classification,
  funnelCounts,
  isFunnelScope,
  initialCategoryFilter,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const isFunnelMode = Boolean(
    isFunnelScope || (classification && classification !== "ALL"),
  );

  const normalizedInitial = useMemo(() => {
    if (!initialCategoryFilter) return showProfitMetrics ? "ALL" : "all";
    return isFunnelMode
      ? initialCategoryFilter.toUpperCase()
      : initialCategoryFilter;
  }, [initialCategoryFilter, showProfitMetrics, isFunnelMode]);

  const [categoryFilter, setCategoryFilter] =
    useState<string>(normalizedInitial);

  useEffect(() => {
    if (initialCategoryFilter) {
      setCategoryFilter(
        isFunnelMode
          ? initialCategoryFilter.toUpperCase()
          : initialCategoryFilter,
      );
    }
  }, [initialCategoryFilter, isFunnelMode]);
  const [search, setSearch] = useState("");

  const funnelStatusCounts = useMemo(
    () => calculateFunnelStatusCounts(cases),
    [cases],
  );

  const { filteredCases, totalRemaining, totalBilled } = useMemo(
    () =>
      filterGarageCases(cases, {
        showProfitMetrics,
        isPayable: false,
        categoryFilter,
        search,
        isFunnelStatusFilter: isFunnelMode,
      }),
    [cases, showProfitMetrics, categoryFilter, search, isFunnelMode],
  );

  const columns = useMemo(
    () =>
      createGarageCasesColumns({
        isPayable: false,
        onOpenCaseDetail,
        showProfitMetrics,
        t,
      }),
    [onOpenCaseDetail, showProfitMetrics, t],
  );

  const filterTabs = useMemo(
    () =>
      buildGarageCaseFilterTabs({
        isFunnelMode,
        showProfitMetrics,
        cases,
        t,
        funnelCounts,
        funnelStatusCounts,
      }),
    [
      isFunnelMode,
      showProfitMetrics,
      cases,
      t,
      funnelCounts,
      funnelStatusCounts,
    ],
  );

  const sectionTitle = showProfitMetrics
    ? t("cases.title.periodCases", "Danh sách vụ việc dịch vụ trong kỳ")
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
            className="w-48 sm:w-64"
          />
        </div>
      </div>

      <DrawerSection
        title={sectionTitle}
        titleExtra={
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground">
              {filteredCases.length} {t("common.cases", "phiếu")}
            </span>
            {showProfitMetrics ? (
              <>
                {totalBilled > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-mono font-bold bg-primary/10 text-primary border-primary/20"
                  >
                    {money(totalBilled)}
                  </Badge>
                )}
                {totalRemaining > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  >
                    {money(totalRemaining)}
                  </Badge>
                )}
              </>
            ) : (
              totalRemaining > 0 && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                >
                  {money(totalRemaining)}
                </Badge>
              )
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
