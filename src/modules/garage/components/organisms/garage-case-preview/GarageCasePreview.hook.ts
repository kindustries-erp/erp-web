import { useMemo, useState } from "react";
import { format } from "date-fns";
import type {
  GarageCasePreviewProps,
  QuotePreviewMode,
} from "./GarageCasePreview.type";
import {
  calculateProfitSummary,
  formatNumber,
  parseQuoteLines,
  buildFinancialItems,
} from "./GarageCasePreview.helper";

export function useGarageCasePreview(props: GarageCasePreviewProps) {
  const { caseData, grossProfit, defaultMode = "DOCUMENT" } = props;
  const [viewMode, setViewMode] = useState<QuotePreviewMode>(defaultMode);

  const rawData = caseData?.rawData;

  const { parts, services, allLines } = useMemo(() => {
    return parseQuoteLines(rawData);
  }, [rawData]);

  const financialItems = useMemo(() => {
    return buildFinancialItems(rawData, caseData, grossProfit);
  }, [rawData, caseData, grossProfit]);

  const profitSummary = useMemo(() => {
    return calculateProfitSummary(caseData, rawData, grossProfit);
  }, [caseData, rawData, grossProfit]);

  const dateStr = useMemo(() => {
    if (rawData?.NgayTiepNhan) {
      return format(new Date(rawData.NgayTiepNhan), "dd/MM/yyyy");
    }
    if (caseData?.ngayPhatSinh) {
      return format(new Date(caseData.ngayPhatSinh), "dd/MM/yyyy");
    }
    return "---";
  }, [rawData, caseData]);

  const partsTotalAmount = useMemo(
    () => parts.reduce((sum, p) => sum + (p.amount || 0), 0),
    [parts],
  );

  const partsTotalCost = useMemo(
    () => parts.reduce((sum, p) => sum + (p.totalCost || 0), 0),
    [parts],
  );

  const servicesTotalAmount = useMemo(
    () => services.reduce((sum, s) => sum + (s.amount || 0), 0),
    [services],
  );

  return {
    viewMode,
    setViewMode,
    rawData,
    parts,
    services,
    allLines,
    financialItems,
    profitSummary,
    dateStr,
    partsTotalAmount,
    partsTotalCost,
    servicesTotalAmount,
    formatNumber,
  };
}
