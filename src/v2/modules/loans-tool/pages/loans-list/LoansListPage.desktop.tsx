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
import { RecordPaymentModal } from "../../drawers/record-payment-modal";
import { buildLoanRowActions } from "./LoansListPage.actions";
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
    paymentModalLoan,
    handleCreate,
    handleEdit,
    handleOpenDetail,
    handleCloseDetail,
    handleCloseForm,
    handleOpenPaymentModal,
    handleClosePaymentModal,
    handlePageChange,
  } = useLoansListPage();

  const columns = useMemo(
    () => buildLoanColumns(t, handleOpenDetail),
    [t, handleOpenDetail],
  );

  const rowActions = useMemo(
    () =>
      buildLoanRowActions({
        t,
        onRecordPayment: handleOpenPaymentModal,
        onViewDetail: handleOpenDetail,
        onEdit: handleEdit,
      }),
    [t, handleOpenPaymentModal, handleOpenDetail, handleEdit],
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
        <V2Button
          variant={activeTab === "simulator" ? "default" : "ghost"}
          onClick={() => setActiveTab("simulator")}
        >
          {t("v2.loans.tabs.simulator", "Mô Phỏng & Tính Nhanh")}
        </V2Button>
        <V2Button
          variant={activeTab === "projection" ? "default" : "ghost"}
          onClick={() => setActiveTab("projection")}
        >
          {t("v2.loans.tabs.projection", "Dự Báo Dòng Tiền Tương Lai")}
        </V2Button>
        <V2Button
          variant={activeTab === "list" ? "default" : "ghost"}
          onClick={() => setActiveTab("list")}
        >
          {t("v2.loans.tabs.list", "Danh Sách Hợp Đồng")} ({total})
        </V2Button>
      </div>

      {activeTab === "list" && (
        <V2StandardTable<LoanItem>
          tableId="loans-master-table"
          columns={columns}
          items={loans}
          getRowKey={(row) => row.id}
          loading={isLoading}
          total={total}
          rowActions={rowActions}
          enableColumnVisibility={false}
          emptyLabel={t("v2.loans.emptyList", "Không có khoản vay nào.")}
          onQueryChange={(q) => {
            handlePageChange(q.page, q.pageSize);
          }}
        />
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

      {paymentModalLoan && (
        <RecordPaymentModal
          open={Boolean(paymentModalLoan)}
          onClose={handleClosePaymentModal}
          loanId={paymentModalLoan.id}
          loanTitle={paymentModalLoan.title}
          suggestedPeriod={(paymentModalLoan.payments?.length ?? 0) + 1}
        />
      )}
    </div>
  );
};
