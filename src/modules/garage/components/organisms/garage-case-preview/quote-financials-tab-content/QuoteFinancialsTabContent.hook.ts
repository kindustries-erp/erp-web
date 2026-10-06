import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { parseQuoteLines } from "../GarageCasePreview.helper";
import type { QuoteLineItem } from "../GarageCasePreview.type";
import type { QuoteReceivableRow } from "../components/tables/quote-receivables-table";
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

  const { parts, services } = useMemo(() => {
    return parseQuoteLines(props.caseData?.rawData);
  }, [props.caseData?.rawData]);

  const handleReceivablePaymentClick = useCallback(
    (row: QuoteReceivableRow) => {
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
    [],
  );

  const handlePartPaymentClick = useCallback((line: QuoteLineItem) => {
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
  }, []);

  const handleServicePaymentClick = useCallback((line: QuoteLineItem) => {
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
  }, []);

  const closePaymentDrawer = useCallback(() => {
    setIsPaymentDrawerOpen(false);
    setPaymentDrawerTarget(null);
  }, []);

  return {
    t,
    parts,
    services,
    isPaymentDrawerOpen,
    paymentDrawerTarget,
    handleReceivablePaymentClick,
    handlePartPaymentClick,
    handleServicePaymentClick,
    closePaymentDrawer,
  };
}
