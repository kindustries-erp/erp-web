import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { ComingSoon } from "@/pages/ComingSoon";
import type { TabItem } from "@/shared/components/PageLayout";
import { AccountBalanceCards } from "./components/AccountBalanceCards";
import { CashTrendPanel } from "./components/CashTrendPanel";
import { SourceBreakdownPanels } from "./components/SourceBreakdownPanels";
import { BranchPartnerStatsTable } from "./components/BranchPartnerStatsTable";
import { PartnerTransactionsDrawer } from "./components/PartnerTransactionsDrawer";
import { useCashflowDashboardLogic } from "./hooks/useCashflowDashboardLogic";

export interface CashflowDashboardProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}

export function CashflowDashboard({
  tabs,
  activeTab,
  onTabChange,
}: CashflowDashboardProps = {}) {
  const {
    t,
    canAccess,
    filterConfig,
    filter,
    branches,
    bankAccounts,
    cashBooks,
    data,
    isLoading,
    isFetching,
    handleRefresh,
    cashTrendLabels,
    cashTrendIn,
    cashTrendOut,
    sourceLabels,
    partnerDrawerOpen,
    setPartnerDrawerOpen,
    selectedPartner,
    handlePartnerClick,
  } = useCashflowDashboardLogic();

  if (!canAccess) {
    return <ComingSoon />;
  }

  const selectedBranchId = filter.state.custom.branchId as string | undefined;
  const currentBranchName = selectedBranchId
    ? branches.find((b: any) => b.id === selectedBranchId)?.name || ""
    : t("bankStatement.filters.allBranches", "Tất cả chi nhánh");

  return (
    <DashboardTemplate
      title={t("dashboard.title", "Tổng hợp dòng tiền")}
      desc={t(
        "dashboard.desc",
        "Tổng quan chỉ số thu chi, quỹ tiền mặt và tài khoản ngân hàng",
      )}
      icon={<LayoutDashboard className="h-4 w-4" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      filterConfig={filterConfig}
      filter={filter}
      loading={isFetching}
      onRefresh={handleRefresh}
    >
      {/* 1. Account Balances Cards */}
      <AccountBalanceCards
        bankAccounts={bankAccounts}
        cashBooks={cashBooks}
        loading={isFetching}
      />

      {/* 2. Cash Trend Panel */}
      <CashTrendPanel
        labels={cashTrendLabels}
        cashIn={cashTrendIn}
        cashOut={cashTrendOut}
        isLoading={isLoading}
      />

      {/* 3. Source Breakdown Panels */}
      <SourceBreakdownPanels
        data={data}
        sourceLabels={sourceLabels}
        isLoading={isLoading}
      />

      {/* 4. Branch Partner Cashflow Distribution Table */}
      <div className="flex flex-col gap-6 mt-8 mb-4 items-start w-full">
        <BranchPartnerStatsTable
          branchId={selectedBranchId}
          branchName={currentBranchName}
          filterState={filter.state}
          onPartnerClick={handlePartnerClick}
        />
      </div>

      {/* 5. Partner Transactions Drawer */}
      <PartnerTransactionsDrawer
        open={partnerDrawerOpen}
        onClose={() => setPartnerDrawerOpen(false)}
        correspondentAccount={selectedPartner?.account}
        correspondentName={selectedPartner?.name}
        globalStartDate={filter.state.dateFrom || undefined}
        globalEndDate={filter.state.dateTo || undefined}
        globalBranchId={selectedBranchId}
      />
    </DashboardTemplate>
  );
}
