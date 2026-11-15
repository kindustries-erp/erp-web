import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2StandardDrawer,
  V2DrawerSize,
  V2DrawerMode,
  V2DrawerLayout,
  type DrawerAction,
  type V2TabItemData,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { V2Badge, V2ConfirmModal, V2Text } from "@/v2/shared/components";
import { getLoanStatusConfig } from "@/v2/core/loans";
import { RecordPaymentModal } from "../record-payment-modal";
import { LoanPaymentsTabTable } from "./LoanPaymentsTabTable";
import { LoanDetailOverviewTab } from "./LoanDetailOverviewTab";
import type { LoanDetailDrawerProps } from "./LoanDetailDrawer.type";
import { useLoanDetailDrawer } from "./LoanDetailDrawer.hook";

export const LoanDetailDrawerMobile: React.FC<LoanDetailDrawerProps> = (
  props,
) => {
  const { t } = useV2Translation();
  const {
    loan,
    isLoading,
    schedule,
    contractSchedule,
    kpiSummary,
    paidPeriodNumbers,
    selectedPeriod,
    activeTab,
    setActiveTab,
    isPaymentModalOpen,
    paymentModalMode,
    editingPayment,
    deletePaymentTarget,
    isDeletingPayment,
    handleOpenPaymentModal,
    handleEditPayment,
    handleRequestDeletePayment,
    handleConfirmDeletePayment,
    handleCancelDeletePayment,
    handleClosePaymentModal,
  } = useLoanDetailDrawer(props);

  if (!loan && !isLoading) return null;

  const tabs: V2TabItemData[] = [
    { key: "overview", label: t("v2.loans.drawer.tabOverview", "Tổng Quan") },
    {
      key: "payments",
      label: t("v2.loans.drawer.tabPayments", "Trả Nợ"),
      badgeCount: loan?.payments?.length ?? 0,
    },
  ];

  const actions: DrawerAction[] = [
    {
      label: t("v2.loans.action.recordPayment", "Trả Nợ"),
      variant: "primary",
      onClick: () => handleOpenPaymentModal(),
    },
    {
      label: t("v2.common.close", "Đóng"),
      variant: "outline",
      onClick: props.onClose,
    },
  ];

  const statusBadge = loan?.status ? getLoanStatusConfig(loan.status, t) : null;

  return (
    <>
      <V2StandardDrawer
        id={`loan-detail-m-${props.loanId ?? "none"}`}
        open={props.open}
        onClose={props.onClose}
        title={
          <div className="flex items-center gap-2">
            <V2Text as="span" className="truncate">
              {loan?.title || t("v2.loans.drawer.detailTitle", "Chi Tiết")}
            </V2Text>
            {statusBadge && (
              <V2Badge variant={statusBadge.variant}>
                {statusBadge.label}
              </V2Badge>
            )}
          </div>
        }
        subtitle={loan ? `${loan.loanCode} • ${loan.lenderName}` : undefined}
        size={V2DrawerSize.FULL}
        mode={V2DrawerMode.VIEW}
        layout={V2DrawerLayout.ONE_COLUMN}
        tabs={tabs}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        actions={actions}
        loading={isLoading}
      >
        <div className="p-3 space-y-4">
          {activeTab === "overview" && loan && (
            <LoanDetailOverviewTab
              schedule={schedule}
              contractSchedule={contractSchedule}
              kpiSummary={kpiSummary}
              paidPeriodNumbers={paidPeriodNumbers}
              onRecordPeriod={(period) => handleOpenPaymentModal(period)}
              chartHeight={220}
            />
          )}

          {activeTab === "payments" && loan && (
            <LoanPaymentsTabTable
              payments={loan.payments}
              isMobile
              onEdit={handleEditPayment}
              onDelete={handleRequestDeletePayment}
            />
          )}
        </div>
      </V2StandardDrawer>

      {loan && (
        <RecordPaymentModal
          open={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          loanId={loan.id}
          loanTitle={loan.title}
          loanCode={loan.loanCode}
          remainingPrincipal={Number(loan.remainingPrincipal || 0)}
          schedule={schedule}
          payments={loan.payments}
          mode={paymentModalMode}
          editPayment={editingPayment}
          suggestedPeriod={
            selectedPeriod?.periodNumber ?? (loan.payments?.length ?? 0) + 1
          }
          suggestedPrincipal={
            selectedPeriod ? Math.round(selectedPeriod.principalDue) : 0
          }
          suggestedInterest={
            selectedPeriod ? Math.round(selectedPeriod.interestDue) : 0
          }
        />
      )}

      <V2ConfirmModal
        open={Boolean(deletePaymentTarget)}
        title={t("v2.loans.deletePayment.title", "Xóa bản ghi thanh toán")}
        message={t(
          "v2.loans.deletePayment.message",
          "Bạn có chắc chắn muốn xóa bản ghi thanh toán này? Dư nợ khoản vay sẽ được tính toán lại.",
        )}
        confirmLabel={t("v2.common.delete", "Xóa")}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        variant="danger"
        isLoading={isDeletingPayment}
        overlayClassName="z-[699]"
        onConfirm={handleConfirmDeletePayment}
        onCancel={handleCancelDeletePayment}
      />
    </>
  );
};
LoanDetailDrawerMobile.displayName = "LoanDetailDrawerMobile";
