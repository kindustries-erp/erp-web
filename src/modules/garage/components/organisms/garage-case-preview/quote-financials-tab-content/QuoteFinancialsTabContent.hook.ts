import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { parseQuoteLines } from "../GarageCasePreview.helper";
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

  const { parts, services } = useMemo(() => {
    return parseQuoteLines(props.caseData?.rawData);
  }, [props.caseData?.rawData]);

  const totalCostAmount = useMemo(() => {
    const directCost =
      props.caseData?.chi_phi ??
      props.caseData?.chiPhi ??
      props.caseData?.totalCost;
    if (
      directCost !== undefined &&
      directCost !== null &&
      !isNaN(Number(directCost)) &&
      Number(directCost) > 0
    ) {
      return Number(directCost);
    }
    const partsCost = parts.reduce(
      (sum, p) => sum + Number(p.totalCost || p.amount || 0),
      0,
    );
    const servicesCost = services.reduce(
      (sum, s) => sum + Number(s.totalCost || s.amount || 0),
      0,
    );
    return partsCost + servicesCost;
  }, [props.caseData, parts, services]);

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
