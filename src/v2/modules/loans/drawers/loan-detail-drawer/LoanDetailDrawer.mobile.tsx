import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2StandardDrawer,
  type DrawerAction,
  type V2TabItemData,
} from "@/v2/shared/components/organisms/v2-standard-drawer";
import { V2Badge, V2Text } from "@/v2/shared/components";
import {
  LoanKpiSummary,
  AmortizationScheduleTable,
  LoanCashflowChart,
  LoanStatus,
} from "@/v2/core/loans";
import { RecordPaymentModal } from "../record-payment-modal";
import { LoanPaymentsTabTable } from "./LoanPaymentsTabTable";
import type { LoanDetailDrawerProps } from "./LoanDetailDrawer.type";
import { useLoanDetailDrawer } from "./LoanDetailDrawer.hook";

const STATUS_BADGE_MAP: Record<
  LoanStatus,
  { label: string; variant: "default" | "outline" | "destructive" }
> = {
  [LoanStatus.ACTIVE]: { label: "Đang vay", variant: "default" },
  [LoanStatus.DRAFT]: { label: "Dự thảo", variant: "outline" },
  [LoanStatus.COMPLETED]: { label: "Đã tất toán", variant: "outline" },
  [LoanStatus.OVERDUE]: { label: "Quá hạn", variant: "destructive" },
};

export const LoanDetailDrawerMobile: React.FC<LoanDetailDrawerProps> = (
  props,
) => {
  const { t } = useV2Translation();
  const {
    loan,
    isLoading,
    schedule,
    activeTab,
    setActiveTab,
    isPaymentModalOpen,
    handleOpenPaymentModal,
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
      onClick: handleOpenPaymentModal,
    },
    {
      label: t("v2.common.close", "Đóng"),
      variant: "outline",
      onClick: props.onClose,
    },
  ];

  const statusBadge = loan?.status ? STATUS_BADGE_MAP[loan.status] : null;

  const totalInterest = schedule.reduce((sum, p) => sum + p.interestDue, 0);
  const totalObligation = schedule.reduce(
    (sum, p) => sum + p.totalPaymentDue,
    0,
  );
  const firstMonthDue = schedule[0]?.totalPaymentDue || 0;
  const monthlyAverage =
    schedule.length > 0 ? totalObligation / schedule.length : 0;

  return (
    <>
      <V2StandardDrawer
        id={`loan-detail-m-${props.loanId ?? "none"}`}
        open={props.open}
        onClose={props.onClose}
        title={
          <div className="flex items-center gap-2">
            <span className="truncate">
              {loan?.title || t("v2.loans.drawer.detailTitle", "Chi Tiết")}
            </span>
            {statusBadge && (
              <V2Badge variant={statusBadge.variant}>
                {statusBadge.label}
              </V2Badge>
            )}
          </div>
        }
        subtitle={loan ? `${loan.loanCode} • ${loan.lenderName}` : undefined}
        size="full"
        layout="1-column"
        tabs={tabs}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        actions={actions}
        loading={isLoading}
      >
        <div className="p-3 space-y-4">
          {activeTab === "overview" && loan && (
            <>
              <LoanKpiSummary
                firstMonthDue={firstMonthDue}
                monthlyAverage={monthlyAverage}
                totalInterest={totalInterest}
                totalObligation={totalObligation}
              />

              <div className="rounded-xl border border-border p-3 bg-card">
                <V2Text variant="caption" className="font-semibold mb-2 block">
                  {t("v2.loans.charts.cashflowTitle", "Dòng Chảy Tiền Vay")}
                </V2Text>
                <LoanCashflowChart schedule={schedule} height={220} />
              </div>

              <div>
                <V2Text variant="caption" className="font-semibold mb-2 block">
                  {t("v2.loans.table.scheduleTitle", "Lịch Trả Nợ Chi Tiết")}
                </V2Text>
                <AmortizationScheduleTable schedule={schedule} />
              </div>
            </>
          )}

          {activeTab === "payments" && loan && (
            <LoanPaymentsTabTable payments={loan.payments} isMobile />
          )}
        </div>
      </V2StandardDrawer>

      {loan && (
        <RecordPaymentModal
          open={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          loanId={loan.id}
          loanTitle={loan.title}
          suggestedPeriod={(loan.payments?.length ?? 0) + 1}
        />
      )}
    </>
  );
};
