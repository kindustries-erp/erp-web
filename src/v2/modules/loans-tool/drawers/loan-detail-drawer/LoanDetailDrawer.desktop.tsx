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
import { V2Badge, V2Text } from "@/v2/shared/components";
import {
  LoanKpiSummary,
  AmortizationScheduleTable,
  LoanCashflowChart,
  getLoanStatusConfig,
} from "@/v2/core/loans";
import { RecordPaymentModal } from "../record-payment-modal";
import { LoanPaymentsTabTable } from "./LoanPaymentsTabTable";
import type { LoanDetailDrawerProps } from "./LoanDetailDrawer.type";
import { useLoanDetailDrawer } from "./LoanDetailDrawer.hook";

export const LoanDetailDrawerDesktop: React.FC<LoanDetailDrawerProps> = (
  props,
) => {
  const { t } = useV2Translation();
  const {
    loan,
    isLoading,
    schedule,
    kpiSummary,
    paidPeriodNumbers,
    selectedPeriod,
    activeTab,
    setActiveTab,
    isPaymentModalOpen,
    handleOpenPaymentModal,
    handleClosePaymentModal,
  } = useLoanDetailDrawer(props);

  if (!loan && !isLoading) return null;

  const tabs: V2TabItemData[] = [
    {
      key: "overview",
      label: t("v2.loans.drawer.tabOverview", "Tổng Quan & Lịch Trả"),
    },
    {
      key: "payments",
      label: t("v2.loans.drawer.tabPayments", "Lịch Sử Trả Nợ"),
      badgeCount: loan?.payments?.length ?? 0,
    },
  ];

  const actions: DrawerAction[] = [
    {
      label: t("v2.loans.action.recordPayment", "Ghi Nhận Thanh Toán"),
      variant: "primary",
      onClick: () => handleOpenPaymentModal(),
    },
    ...(props.onEdit && loan
      ? [
          {
            label: t("v2.common.edit", "Sửa"),
            variant: "outline" as const,
            onClick: () => {
              props.onClose();
              props.onEdit?.(loan);
            },
          },
        ]
      : []),
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
        id={`loan-detail-${props.loanId ?? "none"}`}
        open={props.open}
        onClose={props.onClose}
        title={
          <div className="flex items-center gap-2">
            <V2Text as="span">
              {loan?.title ||
                t("v2.loans.drawer.detailTitle", "Chi Tiết Khoản Vay")}
            </V2Text>
            {statusBadge && (
              <V2Badge variant={statusBadge.variant}>
                {statusBadge.label}
              </V2Badge>
            )}
          </div>
        }
        subtitle={loan ? `${loan.loanCode} • ${loan.lenderName}` : undefined}
        size={V2DrawerSize.XL}
        mode={V2DrawerMode.VIEW}
        layout={V2DrawerLayout.ONE_COLUMN}
        tabs={tabs}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        actions={actions}
        loading={isLoading}
      >
        <div className="p-4 space-y-6">
          {activeTab === "overview" && loan && (
            <>
              <LoanKpiSummary {...kpiSummary} />

              <div className="rounded-xl border border-border p-4 bg-card">
                <V2Text variant="h3" className="text-base font-semibold mb-3">
                  {t(
                    "v2.loans.charts.cashflowTitle",
                    "Dòng Chảy Tiền Vay & Dư Nợ Theo Kỳ",
                  )}
                </V2Text>
                <LoanCashflowChart schedule={schedule} height={280} />
              </div>

              <div>
                <V2Text variant="h3" className="text-base font-semibold mb-3">
                  {t(
                    "v2.loans.table.scheduleTitle",
                    "Bảng Tính Lịch Trả Nợ Chi Tiết",
                  )}
                </V2Text>
                <AmortizationScheduleTable
                  schedule={schedule}
                  paidPeriodNumbers={paidPeriodNumbers}
                  onRecordPeriod={(period) => handleOpenPaymentModal(period)}
                />
              </div>
            </>
          )}

          {activeTab === "payments" && loan && (
            <LoanPaymentsTabTable payments={loan.payments} />
          )}
        </div>
      </V2StandardDrawer>

      {loan && (
        <RecordPaymentModal
          open={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          loanId={loan.id}
          loanTitle={loan.title}
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
    </>
  );
};
