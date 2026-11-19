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
import { DebtDetailTypeSwitch } from "./DebtDetailTypeSwitch";
import { filterDebtRemainingCases } from "./DebtRemainingCasesTab.helper";
import { createDebtRemainingCasesColumns } from "./DebtRemainingCasesTab.columns";
import type {
  DebtRemainingCasesTabProps,
  PartnerDebtCategory,
  DebtRemainingCaseRow,
} from "./DebtRemainingCasesTab.type";

export const DebtRemainingCasesTab: React.FC<DebtRemainingCasesTabProps> = ({
  cases,
  initialDebtType = "receivables",
  onOpenCaseDetail,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const [debtType, setDebtType] = useState<"receivables" | "payables">(
    initialDebtType,
  );
  const [partnerFilter, setPartnerFilter] =
    useState<PartnerDebtCategory>("all");
  const [search, setSearch] = useState("");

  const isPayable = debtType === "payables";

  const { counts, filteredCases, totalRemaining } = useMemo(
    () => filterDebtRemainingCases(cases, isPayable, partnerFilter, search),
    [cases, isPayable, partnerFilter, search],
  );

  const columns = useMemo(
    () =>
      createDebtRemainingCasesColumns({
        isPayable,
        onOpenCaseDetail,
        t,
      }),
    [isPayable, onOpenCaseDetail, t],
  );

  const filterTabs = useMemo(
    () => [
      {
        key: "all",
        label: t("progress.partnerFilterTabs.all", "Tất cả"),
        badgeCount: counts.all,
      },
      {
        key: "enterprise",
        label: t("progress.partnerFilterTabs.enterprise", "Doanh nghiệp"),
        badgeCount: counts.enterprise,
      },
      {
        key: "individual",
        label: t("progress.partnerFilterTabs.individual", "Cá nhân"),
        badgeCount: counts.individual,
      },
      {
        key: "insurance",
        label: t("progress.partnerFilterTabs.insurance", "Bảo hiểm"),
        badgeCount: counts.insurance,
      },
    ],
    [counts, t],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar lọc đối tượng, tìm kiếm và chuyển đổi Phải thu / Phải trả */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center overflow-x-auto scrollbar-none min-w-0">
          <V2TabBar
            variant={V2TabBarVariant.SUB}
            tabs={filterTabs}
            activeTabKey={partnerFilter}
            onTabChange={(key) => setPartnerFilter(key as PartnerDebtCategory)}
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
          <DebtDetailTypeSwitch value={debtType} onChange={setDebtType} />
        </div>
      </div>

      {/* Bọc bảng trong DrawerSection V2 */}
      <DrawerSection
        title={
          isPayable
            ? t(
                "debts.detailDrawer.unpaidPayableCases",
                "Danh sách phiếu còn phải chi",
              )
            : t(
                "debts.detailDrawer.unpaidReceivableCases",
                "Danh sách phiếu còn phải thu",
              )
        }
        titleExtra={
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground">
              {filteredCases.length} {t("common.cases", "phiếu")}
            </span>
            {totalRemaining > 0 && (
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
        <V2StandardTable<DebtRemainingCaseRow>
          tableId="garage-debt-detail-unpaid-cases-table"
          mode="client"
          columns={columns}
          items={filteredCases}
          getRowKey={(row) => row.rowKey}
          initialQuery={{ pageSize: 10, page: 1 }}
          emptyLabel={t(
            "debts.detailDrawer.emptyUnpaid",
            "Không có phiếu nào còn công nợ trong kỳ",
          )}
        />
      </DrawerSection>
    </div>
  );
};
