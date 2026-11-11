import React, { useMemo } from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2StandardTable } from "@/v2/shared/components/organisms/v2-standard-table";
import { V2Button, V2Text } from "@/v2/shared/components";
import { Plus } from "lucide-react";
import { LoanItem } from "@/v2/core/loans";
import { buildLoanColumns } from "../../components/organisms/loan-table";
import { ConsolidatedCashflowView } from "../../components/organisms/consolidated-cashflow";
import { LoanSimulatorPage } from "../loan-simulator";
import { LoanDetailDrawer } from "../../drawers/loan-detail-drawer";
import { LoanFormDrawer } from "../../drawers/loan-form-drawer";
import type { LoansListPageProps } from "./LoansListPage.type";
import { useLoansListPage } from "./LoansListPage.hook";

export const LoansListPageDesktop: React.FC<LoansListPageProps> = (props) => {
  const { t } = useV2Translation();
  const {
    activeTab,
    setActiveTab,
    loans,
    total,
    isLoading,
    isFormOpen,
    editingLoan,
    detailLoanId,
    isDetailOpen,
    handleCreate,
    handleEdit,
    handleOpenDetail,
    handleCloseDetail,
    handleCloseForm,
    handlePageChange,
  } = useLoansListPage();

  const columns = useMemo(
    () => buildLoanColumns(t, handleOpenDetail),
    [t, handleOpenDetail],
  );

  return (
    <div className={`p-6 space-y-6 ${props.className ?? ""}`}>
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-xs">
        <div>
          <V2Text variant="h2" className="text-xl font-bold">
            {t("v2.loans.page.title", "Quản Lý Khoản Vay & Dòng Tiền")}
          </V2Text>
          <V2Text variant="body" className="text-muted-foreground text-sm mt-1">
            {t(
              "v2.loans.page.subtitle",
              "Theo dõi nghĩa vụ nợ, lập kế hoạch dòng tiền và mô phỏng tài chính.",
            )}
          </V2Text>
        </div>
        <div className="flex gap-3">
          <V2Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("v2.loans.action.create", "Thêm khoản vay mới")}
          </V2Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "simulator"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {t("v2.loans.tabs.simulator", "Mô Phỏng & Tính Nhanh")}
        </button>
        <button
          onClick={() => setActiveTab("projection")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "projection"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {t("v2.loans.tabs.projection", "Dự Báo Dòng Tiền Tương Lai")}
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "list"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {t("v2.loans.tabs.list", "Danh Sách Hợp Đồng")} ({total})
        </button>
      </div>

      {activeTab === "list" && (
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <V2StandardTable<LoanItem>
            tableId="loans-master-table"
            columns={columns}
            items={loans}
            getRowKey={(row) => row.id}
            loading={isLoading}
            total={total}
            emptyLabel={t("v2.loans.emptyList", "Không có khoản vay nào.")}
            onQueryChange={(q) => {
              handlePageChange(q.page, q.pageSize);
            }}
          />
        </div>
      )}

      {activeTab === "projection" && <ConsolidatedCashflowView />}

      {activeTab === "simulator" && (
        <LoanSimulatorPage onSaved={() => setActiveTab("list")} />
      )}

      <LoanDetailDrawer
        open={isDetailOpen}
        onClose={handleCloseDetail}
        loanId={detailLoanId}
        onEdit={(loan) => handleEdit(loan)}
      />

      <LoanFormDrawer
        open={isFormOpen}
        onClose={handleCloseForm}
        record={editingLoan}
        onSuccess={handleCloseForm}
      />
    </div>
  );
};
