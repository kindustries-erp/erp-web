import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGarageCaseReconciliationLogic } from "../../GarageCaseReconciliationDrawer/useGarageCaseReconciliationLogic";
import type { CaseLinePaymentDrawerProps } from "./CaseLinePaymentDrawer.type";

export function useCaseLinePaymentDrawer(props: CaseLinePaymentDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);

  const direction =
    props.direction || (props.lineType === "PT" ? "COST" : "REVENUE");
  const isCost = direction === "COST";
  const defaultType = isCost ? "PAYMENT" : "RECEIPT";
  const invoiceTabKey = isCost ? "invoices_in" : "invoices_out";

  const [activeTab, setActiveTab] = useState<string>(invoiceTabKey);

  const reconLogic = useGarageCaseReconciliationLogic({
    open: props.open,
    onClose: props.onClose,
    caseId: props.caseId,
    caseCode: props.caseCode,
    caseData: props.caseData,
    initialTab: invoiceTabKey,
    defaultType,
    suggestedAmount: props.lineAmount,
    editMode: true,
    activeSettlements: props.activeSettlements,
    activeLinkedInvoices: props.activeLinkedInvoices,
    onSuccess: props.onSuccess,
    onSubmitSettlements: props.onAddSettlement,
    onRemoveSettlement: props.onRemoveSettlement,
    onSubmitInvoices: props.onAddInvoice,
    onRemoveInvoice: props.onRemoveInvoice,
  });

  useEffect(() => {
    if (props.open) {
      setActiveTab(invoiceTabKey);
      reconLogic.setActiveTab(invoiceTabKey);
    }
  }, [props.open, invoiceTabKey]);

  const targetAmount = Number(props.lineAmount || 0);
  const selectedAmount = useMemo(() => {
    return reconLogic.selectedInvoicesTotal;
  }, [reconLogic.selectedInvoicesTotal]);

  // Số tiền thực tế đã cấn trừ sao kê ngân hàng / tiền mặt
  const realSettledAmount = useMemo(() => {
    const selectedInvoices = Object.values(reconLogic.selectedInvoicesMap);
    const activeSettlements = props.activeSettlements || [];

    // 1. Tính từ các hóa đơn được chọn mà CÓ cấn trừ sao kê
    const settledFromInvoices = selectedInvoices.reduce((sum, inv: any) => {
      const hasBank =
        Boolean(inv.hasBankNetOff) ||
        Number(inv.bankSettledAmount || 0) > 0 ||
        activeSettlements.some(
          (s: any) =>
            s.sourceChannel === "ON_SYSTEM" &&
            (s.invoiceId === inv.id || s.referenceNumber === inv.invoiceNo),
        );

      if (!hasBank) return sum;

      const settledAmt =
        Number(inv.bankSettledAmount || 0) > 0
          ? Math.min(
              Number(inv.totalAmount || 0),
              Number(inv.bankSettledAmount || 0),
            )
          : Number(inv.totalAmount || 0);

      return sum + settledAmt;
    }, 0);

    // 2. Nếu đang ở tab sao kê/sổ quỹ và người dùng chọn trực tiếp các giao dịch
    const directBankSelected =
      activeTab === "bank_statement" || activeTab === "cash_book"
        ? reconLogic.currentSelectedBankTotal
        : 0;

    return Math.min(targetAmount, settledFromInvoices + directBankSelected);
  }, [
    reconLogic.selectedInvoicesMap,
    props.activeSettlements,
    activeTab,
    reconLogic.currentSelectedBankTotal,
    targetAmount,
  ]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, targetAmount - realSettledAmount);
  }, [targetAmount, realSettledAmount]);

  const progressPercent = useMemo(() => {
    if (targetAmount <= 0) return realSettledAmount > 0 ? 100 : 0;
    return Math.min(100, Math.round((realSettledAmount / targetAmount) * 100));
  }, [targetAmount, realSettledAmount]);

  const lineTypeLabel = useMemo(() => {
    if (props.lineType === "DV") {
      return t("cases.quotePreview.typeLabor", "Dịch vụ");
    }
    if (props.lineType === "PT") {
      return t("cases.quotePreview.typePart", "Vật tư phụ tùng");
    }
    return t("cases.quotePreview.fin.itemCol", "Khoản phải thu");
  }, [props.lineType, t]);

  const payerLabel = useMemo(() => {
    if (props.payer === "BH") {
      return t("cases.quotePreview.fin.payerBH", "Bảo hiểm");
    }
    if (props.payer === "GARAGE") {
      return t("cases.quotePreview.fin.payerGarage", "Garage");
    }
    return t("cases.quotePreview.fin.payerKH", "Khách hàng");
  }, [props.payer, t]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    reconLogic.setActiveTab(tabKey as any);
  };

  return {
    t,
    direction,
    isCost,
    invoiceTabKey,
    activeTab,
    setActiveTab,
    handleTabChange,
    reconLogic,
    targetAmount,
    selectedAmount,
    realSettledAmount,
    remainingAmount,
    progressPercent,
    lineTypeLabel,
    payerLabel,
  };
}
