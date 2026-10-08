import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { QuoteReceivableRow } from "../components/tables/quote-receivables-table";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type {
  QuoteFinancialsTabContentProps,
  PaymentDrawerTarget,
} from "./QuoteFinancialsTabContent.type";

export function useQuoteFinancialsTabContent(
  props: QuoteFinancialsTabContentProps,
) {
  const { t } = useTranslation(["garage", "common"]);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [paymentDrawerTarget, setPaymentDrawerTarget] =
    useState<PaymentDrawerTarget | null>(null);

  const canEditGarage = useHasPermission(ErpResource.GARAGE, ErpAction.UPDATE);
  const canEditInvoices = useHasPermission(
    ErpResource.INVOICES,
    ErpAction.UPDATE,
  );
  const canEditBankStatements = useHasPermission(
    ErpResource.BANK_STATEMENTS,
    ErpAction.UPDATE,
  );
  const canEditCashStatements = useHasPermission(
    ErpResource.CASH_STATEMENTS,
    ErpAction.UPDATE,
  );
  const canEditBank = canEditBankStatements || canEditCashStatements;

  const isEditMode = Boolean(props.editMode);
  const hasPermissions = canEditGarage && canEditInvoices && canEditBank;
  const canPerformPayment = isEditMode && hasPermissions;

  const disabledReason = useMemo(() => {
    if (canPerformPayment) return "";
    if (!isEditMode && !hasPermissions) {
      return t(
        "cases.financials.disabledNoEditAndPerm",
        "Cần bật Chế độ chỉnh sửa và có quyền cập nhật Vụ việc Garage, Hóa đơn & Sao kê để thao tác.",
      );
    }
    if (!isEditMode) {
      return t(
        "cases.financials.disabledNoEditMode",
        "Cần bật Chế độ chỉnh sửa (nút Chỉnh sửa ở góc trên bên phải) để thao tác.",
      );
    }
    return t(
      "cases.financials.disabledNoPermissions",
      "Bạn không có đủ quyền chỉnh sửa (cần quyền Vụ việc Garage, Hóa đơn & Sao kê) để thao tác.",
    );
  }, [canPerformPayment, isEditMode, hasPermissions, t]);

  const totalCostAmount = useMemo(() => {
    const rawCost =
      props.caseData?.chiPhi ??
      props.caseData?.chi_phi ??
      props.caseData?.ChiPhi ??
      props.caseData?.rawData?.ChiPhi ??
      props.caseData?.rawData?.chiPhi ??
      props.grossProfit?.chiPhi ??
      props.grossProfit?.ChiPhi ??
      props.caseData?.targetCost;

    if (
      rawCost !== undefined &&
      rawCost !== null &&
      !isNaN(Number(rawCost)) &&
      Number(rawCost) > 0
    ) {
      return Number(rawCost);
    }
    return 0;
  }, [props.caseData, props.grossProfit]);

  const handleReceivablePaymentClick = useCallback(
    (row: QuoteReceivableRow) => {
      if (!canPerformPayment) return;
      const targetAmount =
        row.remainingAmount !== undefined && row.remainingAmount > 0
          ? row.remainingAmount
          : row.amount;

      setPaymentDrawerTarget({
        lineId: row.id,
        lineName: row.defaultLabel,
        lineAmount: targetAmount,
        lineType: "RECEIVABLE",
        payer: row.payer,
        direction: "REVENUE",
      });
      setIsPaymentDrawerOpen(true);
    },
    [canPerformPayment],
  );

  const closePaymentDrawer = useCallback(() => {
    setIsPaymentDrawerOpen(false);
    setPaymentDrawerTarget(null);
  }, []);

  return {
    t,
    totalCostAmount,
    canPerformPayment,
    disabledReason,
    canEditFinancial: canPerformPayment,
    isPaymentDrawerOpen,
    paymentDrawerTarget,
    handleReceivablePaymentClick,
    closePaymentDrawer,
  };
}
