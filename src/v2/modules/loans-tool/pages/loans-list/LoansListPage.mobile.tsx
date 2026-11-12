import React from "react";
import { Plus } from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ConsolidatedCashflowView } from "../../components/organisms/consolidated-cashflow";
import { LoanDetailDrawer } from "../../drawers/loan-detail-drawer";
import { LoanFormDrawer } from "../../drawers/loan-form-drawer";
import { RecordPaymentModal } from "../../drawers/record-payment-modal";
import { LoanSimulatorPage } from "../loan-simulator";
import { useLoansListPage } from "./LoansListPage.hook";
import { LoansListPageMobileCard } from "./LoansListPage.mobile-card";
import type { LoansListPageProps } from "./LoansListPage.type";

export const LoansListPageMobile: React.FC<LoansListPageProps> = (props) => {
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
  } = useLoansListPage();

  return (
    <div className={`p-3 space-y-4 pb-20 ${props.className ?? ""}`}>
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
        <div>
          <V2Text variant="h2" className="text-lg font-bold">
            {t("v2.loans.page.title", "Quản Lý Khoản Vay")}
          </V2Text>
          <V2Text
            variant="caption"
            className="text-muted-foreground mt-0.5 block"
          >
            {total} {t("v2.loans.recordsCount", "khoản vay")}
          </V2Text>
        </div>
        <V2Button
          size="sm"
          onClick={handleCreate}
          className="h-10 px-3 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {t("v2.common.add", "Thêm")}
        </V2Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <V2Button
          size="sm"
          variant={activeTab === "simulator" ? "default" : "secondary"}
          onClick={() => setActiveTab("simulator")}
          className="whitespace-nowrap text-xs"
        >
          {t("v2.loans.tabs.simulator", "Mô phỏng")}
        </V2Button>
        <V2Button
          size="sm"
          variant={activeTab === "projection" ? "default" : "secondary"}
          onClick={() => setActiveTab("projection")}
          className="whitespace-nowrap text-xs"
        >
          {t("v2.loans.tabs.projection", "Dòng tiền tương lai")}
        </V2Button>
        <V2Button
          size="sm"
          variant={activeTab === "list" ? "default" : "secondary"}
          onClick={() => setActiveTab("list")}
          className="whitespace-nowrap text-xs"
        >
          {t("v2.loans.tabs.list", "Danh sách")} ({total})
        </V2Button>
      </div>

      {activeTab === "list" && (
        <div className="space-y-3">
          {isLoading && (
            <div className="p-8 text-center animate-pulse">
              <V2Text variant="body-sm" color="muted">
                {t("v2.common.loading", "Đang tải danh sách khoản vay...")}
              </V2Text>
            </div>
          )}

          {!isLoading && loans.length === 0 && (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border">
              <V2Text variant="body">
                {t("v2.loans.emptyList", "Chưa có khoản vay nào.")}
              </V2Text>
            </div>
          )}

          {loans.map((loan) => (
            <LoansListPageMobileCard
              key={loan.id}
              loan={loan}
              onOpenDetail={handleOpenDetail}
              onRecordPayment={handleOpenPaymentModal}
            />
          ))}
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
