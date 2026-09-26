import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  normalizeOutInvoiceLineDisplay,
  type OutInvoiceLineDisplayResult,
} from "../../../utils/outInvoiceDisplay";
import type {
  ErpInvoice,
  ErpInvoiceItem,
} from "../../../api/erpInvoicesCoreApi";
import { getInvoiceDetailLinesColumns } from "./columns";
import { getInvoiceDetailLinesSummaryRow } from "./summaryRow";

export interface UseInvoiceDetailLinesColumnsProps {
  invoice: ErpInvoice;
  items?: ErpInvoiceItem[];
}

export function useInvoiceDetailLinesColumns({
  invoice,
  items,
}: UseInvoiceDetailLinesColumnsProps) {
  const { t } = useTranslation("erpInvoices");

  const displayItems = useMemo<OutInvoiceLineDisplayResult[]>(() => {
    const rawList = items ?? invoice?.items ?? [];
    if (!rawList.length) return [];

    const descriptionLineCount = String(invoice?.description || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean).length;
    const invoiceLineCount = Math.max(rawList.length, descriptionLineCount, 1);

    return rawList.map((item, idx) => {
      const normalized = normalizeOutInvoiceLineDisplay(
        item as any,
        invoice?.buyerTaxCode,
        invoice?.direction,
        invoiceLineCount,
      );
      return {
        ...normalized,
        id: normalized.id ?? `item-${idx}`,
      };
    });
  }, [
    items,
    invoice?.items,
    invoice?.description,
    invoice?.buyerTaxCode,
    invoice?.direction,
  ]);

  const columns = useMemo(() => getInvoiceDetailLinesColumns(t), [t]);

  const summaryRow = useMemo(
    () => getInvoiceDetailLinesSummaryRow(displayItems, t),
    [displayItems, t],
  );

  return {
    columns,
    displayItems,
    summaryRow,
  };
}
