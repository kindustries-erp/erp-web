import React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Badge, V2Text } from "@/v2/shared/components";
import { Plus } from "lucide-react";
import { LoanStatus } from "@/v2/core/loans";
import { ConsolidatedCashflowView } from "../../components/organisms/consolidated-cashflow";
import { LoanSimulatorPage } from "../loan-simulator";
import { LoanDetailDrawer } from "../../drawers/loan-detail-drawer";
import { LoanFormDrawer } from "../../drawers/loan-form-drawer";
import type { LoansListPageProps } from "./LoansListPage.type";
import { useLoansListPage } from "./LoansListPage.hook";

type StatusBadgeVariant = "default" | "outline" | "destructive";
const STATUS_MAP: Record<
  LoanStatus,
  { label: string; variant: StatusBadgeVariant }
> = {
  [LoanStatus.ACTIVE]: { label: "Đang vay", variant: "default" },
  [LoanStatus.DRAFT]: { label: "Dự thảo", variant: "outline" },
  [LoanStatus.COMPLETED]: { label: "Đã tất toán", variant: "outline" },
  [LoanStatus.OVERDUE]: { label: "Quá hạn", variant: "destructive" },
};

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
    handleCreate,
    handleEdit,
    handleOpenDetail,
    handleCloseDetail,
    handleCloseForm,
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
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === "simulator"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {t("v2.loans.tabs.simulator", "Mô phỏng")}
        </button>
        <button
          onClick={() => setActiveTab("projection")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === "projection"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {t("v2.loans.tabs.projection", "Dòng tiền tương lai")}
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeTab === "list"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {t("v2.loans.tabs.list", "Danh sách")} ({total})
        </button>
      </div>

      {activeTab === "list" && (
        <div className="space-y-3">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground animate-pulse text-sm">
              {t("v2.common.loading", "Đang tải danh sách khoản vay...")}
            </div>
          )}

          {!isLoading && loans.length === 0 && (
            <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border">
              <V2Text variant="body">
                {t("v2.loans.emptyList", "Chưa có khoản vay nào.")}
              </V2Text>
            </div>
          )}

          {loans.map((loan) => {
            const statusCfg = STATUS_MAP[loan.status] || {
              label: loan.status,
              variant: "outline",
            };
            return (
              <div
                key={loan.id}
                onClick={() => handleOpenDetail(loan.id)}
                className="bg-card p-4 rounded-xl border border-border space-y-2 active:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-sm line-clamp-1">
                      {loan.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {loan.loanCode} • {loan.lenderName}
                    </span>
                  </div>
                  <V2Badge variant={statusCfg.variant}>
                    {statusCfg.label}
                  </V2Badge>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Số tiền vay:</span>
                  <span className="font-semibold">
                    {Number(loan.principalAmount).toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Dư nợ còn lại:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {Number(
                      loan.remainingPrincipal ?? loan.principalAmount,
                    ).toLocaleString("vi-VN")}{" "}
                    ₫
                  </span>
                </div>
              </div>
            );
          })}
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
