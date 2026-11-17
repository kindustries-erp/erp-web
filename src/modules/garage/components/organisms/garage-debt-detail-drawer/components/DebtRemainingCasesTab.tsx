import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2TabBarVariant } from "@/v2/shared/components/molecules/v2-tab-bar/V2TabBar.type";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { CustomerDetailDebtSwitch } from "../../garage-customer-detail-drawer/components/CustomerDetailDebtSwitch";
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

  // Lọc theo trạng thái nợ còn lại
  const debtActiveCases = useMemo(() => {
    return cases.filter((c) =>
      isPayable ? c.remainingCost > 0 : c.remaining > 0,
    );
  }, [cases, isPayable]);

  // Đếm số lượng theo nhóm đối tượng
  const counts = useMemo(() => {
    return {
      all: debtActiveCases.length,
      enterprise: debtActiveCases.filter((c) => c.partnerType === "enterprise")
        .length,
      individual: debtActiveCases.filter((c) => c.partnerType === "individual")
        .length,
      insurance: debtActiveCases.filter((c) => c.partnerType === "insurance")
        .length,
    };
  }, [debtActiveCases]);

  // Lọc theo partnerFilter và từ khóa tìm kiếm
  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase();
    return debtActiveCases.filter((c) => {
      if (partnerFilter !== "all" && c.partnerType !== partnerFilter)
        return false;
      if (!q) return true;
      return (
        c.soChungTu?.toLowerCase().includes(q) ||
        c.bienSoXe?.toLowerCase().includes(q) ||
        c.khachHangName?.toLowerCase().includes(q) ||
        c.debtorName?.toLowerCase().includes(q)
      );
    });
  }, [debtActiveCases, partnerFilter, search]);

  const columns = useMemo(
    () =>
      createDebtRemainingCasesColumns({
        isPayable,
        onOpenCaseDetail,
        t,
      }),
    [isPayable, onOpenCaseDetail, t],
  );

  const totalRemaining = useMemo(() => {
    return filteredCases.reduce(
      (sum, c) => sum + (isPayable ? c.remainingCost : c.remaining),
      0,
    );
  }, [filteredCases, isPayable]);

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
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("common.search", "Tìm số phiếu, xe...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-md border border-input bg-background focus:outline-hidden focus:ring-1 focus:ring-ring w-36 sm:w-44"
            />
          </div>
          <CustomerDetailDebtSwitch
            className="w-auto"
            value={debtType}
            onChange={setDebtType}
          />
        </div>
      </div>

      {/* Bọc bảng trong DrawerSection đồng bộ với các tab khác */}
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
