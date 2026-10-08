import React from "react";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import type { DrawerAction } from "@/shared/components/DrawerModal";
import { DollarSign } from "lucide-react";
import type { GarageCashflowFormDrawerProps } from "./GarageCashflowFormDrawer.type";
import { useGarageCashflowFormDrawer } from "./GarageCashflowFormDrawer.hook";
import { GarageCashflowLeftForm } from "./components/GarageCashflowLeftForm";
import { GarageCashflowRightSummary } from "./components/GarageCashflowRightSummary";

export function GarageCashflowFormDrawer(props: GarageCashflowFormDrawerProps) {
  const { open, onClose, mode = "create", fixedCaseCode } = props;
  const t = useT();

  const {
    formData,
    handleChange,
    caseOptions,
    bankTxnOptions,
    selectedCase,
    selectedBankTxn,
    isSubmitting,
    handleSubmit,
    isReadOnly,
  } = useGarageCashflowFormDrawer(props);

  const isReceipt = formData.settlementType === "RECEIPT";

  const title =
    mode === "edit"
      ? t("cases.cashflow.drawerEditTitle", "Chỉnh sửa Giao dịch Thu/Chi")
      : isReceipt
        ? t("cases.cashflow.drawerReceiptTitle", "Ghi nhận Thu tiền Garage")
        : t("cases.cashflow.drawerPaymentTitle", "Ghi nhận Chi tiền Garage");

  const actions: DrawerAction[] = [
    {
      label: t("common.cancel", "Hủy"),
      variant: "outline",
      onClick: onClose,
      disabled: isSubmitting,
    },
    ...(!isReadOnly
      ? [
          {
            label: isSubmitting
              ? t("common.saving", "Đang lưu...")
              : t("common.save", "Lưu giao dịch"),
            primary: true,
            onClick: handleSubmit,
            disabled: isSubmitting || !formData.amount || formData.amount <= 0,
            loading: isSubmitting,
          } as DrawerAction,
        ]
      : []),
  ];

  return (
    <StandardFormDrawer
      open={open}
      mode={mode === "view" ? "view" : mode === "edit" ? "edit" : "create"}
      onClose={onClose}
      layout="2-columns"
      size="xl"
      icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
      title={title}
      subtitle={t(
        "cases.cashflow.drawerSubtitle",
        "Cấn trừ trực tiếp số phiếu & ghi nhận tham chiếu sao kê",
      )}
      actions={actions}
      leftPanel={
        <GarageCashflowLeftForm
          formData={formData}
          onChange={handleChange}
          caseOptions={caseOptions}
          bankTxnOptions={bankTxnOptions}
          fixedCaseCode={fixedCaseCode}
          isReadOnly={isReadOnly}
          t={t}
        />
      }
      rightPanel={
        <GarageCashflowRightSummary
          selectedCase={selectedCase}
          selectedBankTxn={selectedBankTxn}
          currentAmount={formData.amount}
          settlementType={formData.settlementType}
          t={t}
        />
      }
    />
  );
}
