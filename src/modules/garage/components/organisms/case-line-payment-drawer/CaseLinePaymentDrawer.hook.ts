import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGarageCaseReconciliationLogic } from "../../GarageCaseReconciliationDrawer/useGarageCaseReconciliationLogic";
import type { CaseLinePaymentDrawerProps } from "./CaseLinePaymentDrawer.type";

export function useCaseLinePaymentDrawer(props: CaseLinePaymentDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);

  const direction =
    props.direction || (props.lineType === "PT" ? "COST" : "REVENUE");
  const defaultType = direction === "COST" ? "PAYMENT" : "RECEIPT";
  const invoiceTabKey = direction === "COST" ? "invoices_in" : "invoices_out";

  const [activeTab, setActiveTab] = useState<string>(invoiceTabKey);

  useEffect(() => {
    if (props.open) {
      setActiveTab(invoiceTabKey);
    }
  }, [props.open, invoiceTabKey]);

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
    onSuccess: props.onSuccess,
  });

  const targetAmount = Number(props.lineAmount || 0);
  const selectedAmount = useMemo(() => {
    return reconLogic.selectedInvoicesTotal;
  }, [reconLogic.selectedInvoicesTotal]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, targetAmount - selectedAmount);
  }, [targetAmount, selectedAmount]);

  const progressPercent = useMemo(() => {
    if (targetAmount <= 0) return 0;
    return Math.min(100, Math.round((selectedAmount / targetAmount) * 100));
  }, [targetAmount, selectedAmount]);

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
    invoiceTabKey,
    activeTab,
    setActiveTab,
    handleTabChange,
    reconLogic,
    targetAmount,
    selectedAmount,
    remainingAmount,
    progressPercent,
    lineTypeLabel,
    payerLabel,
  };
}
