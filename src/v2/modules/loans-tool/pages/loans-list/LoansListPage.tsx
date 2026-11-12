import * as React from "react";
import { Calculator, Plus } from "lucide-react";
import type { LoanItem } from "@/v2/core/loans";
import {
  V2Button,
  V2ConfirmModal,
  V2ModulePage,
  V2ModulePageVariant,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { LoanDetailDrawer } from "../../drawers/loan-detail-drawer";
import { LoanFormDrawer } from "../../drawers/loan-form-drawer";
import { RecordPaymentModal } from "../../drawers/record-payment-modal";
import { LoansTabKey } from "./loansList.enum";
import { useLoansListPage } from "./LoansListPage.hook";
import { buildLoansTabs } from "./LoansListPage.tabs";
import type { LoansListPageProps } from "./LoansListPage.type";

export const LoansListPage: React.FC<LoansListPageProps> = ({ className }) => {
  const { t } = useV2Translation();
  const state = useLoansListPage();
  const tabs = React.useMemo(() => buildLoansTabs(t, state), [state, t]);

  return (
    <V2ModulePage<LoanItem>
      className={className}
      variant={V2ModulePageVariant.CARD}
      title={t("v2.loans.page.title", "Quản Lý Khoản Vay & Dòng Tiền")}
      description={t(
        "v2.loans.page.subtitle",
        "Theo dõi nghĩa vụ nợ, lập kế hoạch dòng tiền và mô phỏng tài chính.",
      )}
      icon={<Calculator className="h-4 w-4" />}
      tabs={tabs}
      defaultTab={LoansTabKey.SIMULATOR}
      activeTab={state.activeTab}
      onTabChange={state.setActiveTab}
      syncUrl={true}
      actions={
        state.canCreate ? (
          <V2Button
            size="default"
            onClick={state.handleCreate}
            className="min-h-[44px] sm:min-h-0 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            {t("v2.loans.action.create", "Thêm khoản vay mới")}
          </V2Button>
        ) : undefined
      }
      overlays={
        <>
          <LoanDetailDrawer
            open={state.isDetailOpen}
            onClose={state.handleCloseDetail}
            loanId={state.detailLoanId}
            onEdit={state.handleEdit}
          />

          <LoanFormDrawer
            open={state.isFormOpen}
            onClose={state.handleCloseForm}
            record={state.editingLoan}
            onSuccess={state.handleCloseForm}
          />

          {state.paymentModalLoan && (
            <RecordPaymentModal
              open={Boolean(state.paymentModalLoan)}
              onClose={state.handleClosePaymentModal}
              loanId={state.paymentModalLoan.id}
              loanTitle={state.paymentModalLoan.title}
              suggestedPeriod={
                (state.paymentModalLoan.payments?.length ?? 0) + 1
              }
            />
          )}

          <V2ConfirmModal
            open={Boolean(state.deleteTarget)}
            title={t("v2.loans.delete.title", "Xóa khoản vay")}
            message={
              state.deleteTarget
                ? `${t("v2.loans.delete.message", "Khoản vay sẽ bị xóa mềm khỏi danh sách. Bạn có chắc không?")} ${state.deleteTarget.loanCode}`
                : ""
            }
            confirmLabel={t("v2.loans.action.deleteLoan", "Xóa khoản vay")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={state.isDeleting}
            onConfirm={() => void state.confirmDelete()}
            onCancel={state.closeDelete}
            onOpenChange={(open) => !open && state.closeDelete()}
          />

          <V2ConfirmModal
            open={Boolean(state.purgeTarget)}
            title={t("v2.loans.purge.title", "Xóa vĩnh viễn khoản vay")}
            message={
              state.purgeTarget
                ? `${t("v2.loans.purge.message", "Khoản vay sẽ bị xóa khỏi hệ thống và không khôi phục được. Bạn có chắc không?")} ${state.purgeTarget.loanCode}`
                : ""
            }
            confirmLabel={t("v2.loans.action.purgeLoan", "Xóa vĩnh viễn")}
            cancelLabel={t("v2.common.cancel", "Hủy")}
            variant="danger"
            isLoading={state.isPurging}
            onConfirm={() => void state.confirmPurge()}
            onCancel={state.closePurge}
            onOpenChange={(open) => !open && state.closePurge()}
          />
        </>
      }
    />
  );
};
LoansListPage.displayName = "LoansListPage";
