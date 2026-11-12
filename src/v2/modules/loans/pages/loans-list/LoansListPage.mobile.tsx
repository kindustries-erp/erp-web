import React, { useMemo } from "react";
import { ClipboardList, Layers, SlidersHorizontal } from "lucide-react";
import {
  V2EmptyState,
  V2Icon,
  V2Skeleton,
  V2Stack,
  V2TabBar,
  type V2TabItemData,
} from "@/v2/shared/components";
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
    handleEdit,
    handleOpenDetail,
    handleCloseDetail,
    handleCloseForm,
    handleOpenPaymentModal,
    handleClosePaymentModal,
  } = useLoansListPage();

  const tabs = useMemo<V2TabItemData[]>(
    () => [
      {
        key: "simulator",
        label: t("v2.loans.tabs.simulator", "Mô Phỏng & Tính Nhanh"),
        icon: <V2Icon icon={SlidersHorizontal} size={15} />,
      },
      {
        key: "projection",
        label: t("v2.loans.tabs.projection", "Dự Báo Dòng Tiền Tương Lai"),
        icon: <V2Icon icon={Layers} size={15} />,
      },
      {
        key: "list",
        label: t("v2.loans.tabs.list", "Danh Sách Hợp Đồng"),
        icon: <V2Icon icon={ClipboardList} size={15} />,
        badgeCount: total,
      },
    ],
    [t, total],
  );

  return (
    <V2Stack gap="sm" className={`p-2 pb-16 ${props.className ?? ""}`}>
      <V2TabBar
        variant="page"
        tabs={tabs}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "list" && (
        <V2Stack gap="sm">
          {isLoading && (
            <V2Stack gap="xs">
              <V2Skeleton className="h-28 w-full rounded-xl" />
              <V2Skeleton className="h-28 w-full rounded-xl" />
            </V2Stack>
          )}

          {!isLoading && loans.length === 0 && (
            <V2EmptyState
              title={t("v2.loans.emptyList", "Chưa có khoản vay nào.")}
              className="bg-card rounded-xl border border-border"
            />
          )}

          {loans.map((loan) => (
            <LoansListPageMobileCard
              key={loan.id}
              loan={loan}
              onOpenDetail={handleOpenDetail}
              onRecordPayment={handleOpenPaymentModal}
            />
          ))}
        </V2Stack>
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
    </V2Stack>
  );
};
