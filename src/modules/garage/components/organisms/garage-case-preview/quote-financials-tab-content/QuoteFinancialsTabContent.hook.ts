import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { parseQuoteLines } from "../GarageCasePreview.helper";
import type { QuoteLineItem } from "../GarageCasePreview.type";
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

  const canUpdateInvoices = useHasPermission(
    ErpResource.INVOICES,
    ErpAction.UPDATE,
  );
  const canUpdateBankStatements = useHasPermission(
    ErpResource.BANK_STATEMENTS,
    ErpAction.UPDATE,
  );
  const canUpdateCashStatements = useHasPermission(
    ErpResource.CASH_STATEMENTS,
    ErpAction.UPDATE,
  );
  const canEditFinancial =
    canUpdateInvoices || canUpdateBankStatements || canUpdateCashStatements;

  const { parts, services } = useMemo(() => {
    return parseQuoteLines(props.caseData?.rawData);
  }, [props.caseData?.rawData]);

  const handleReceivablePaymentClick = useCallback(
    (row: QuoteReceivableRow) => {
      if (!canEditFinancial) return;
      setPaymentDrawerTarget({
        lineId: row.id,
        lineName: row.defaultLabel,
        lineAmount: row.amount,
        lineType: "RECEIVABLE",
        payer: row.payer,
        direction: "REVENUE",
      });
      setIsPaymentDrawerOpen(true);
    },
    [canEditFinancial],
  );

  const handlePartPaymentClick = useCallback(
    (line: QuoteLineItem) => {
      if (!canEditFinancial) return;
      setPaymentDrawerTarget({
        lineId: line.id,
        lineCode: line.code,
        lineName: line.name,
        lineAmount: Number(line.totalCost || line.amount || 0),
        lineType: "PT",
        payer: "GARAGE",
        direction: "COST",
      });
      setIsPaymentDrawerOpen(true);
    },
    [canEditFinancial],
  );

  const handleServicePaymentClick = useCallback(
    (line: QuoteLineItem) => {
      if (!canEditFinancial) return;
      setPaymentDrawerTarget({
        lineId: line.id,
        lineCode: line.code,
        lineName: line.name,
        lineAmount: Number(line.totalCost || line.amount || 0),
        lineType: "DV",
        payer: "GARAGE",
        direction: "COST",
      });
      setIsPaymentDrawerOpen(true);
    },
    [canEditFinancial],
  );

  const closePaymentDrawer = useCallback(() => {
    setIsPaymentDrawerOpen(false);
    setPaymentDrawerTarget(null);
  }, []);

  return {
    t,
    parts,
    services,
    canEditFinancial,
    isPaymentDrawerOpen,
    paymentDrawerTarget,
    handleReceivablePaymentClick,
    handlePartPaymentClick,
    handleServicePaymentClick,
    closePaymentDrawer,
  };
}
