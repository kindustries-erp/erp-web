import { useState, useMemo, useCallback } from "react";
import type {
  QuoteCostSummarySectionProps,
  QuoteCostSettlementItem,
} from "./QuoteCostSummarySection.type";

export function useQuoteCostSummarySection(
  props: QuoteCostSummarySectionProps,
) {
  const {
    totalCostAmount,
    activeSettlements,
    activeLinkedInvoices,
    onPaymentSaved,
  } = props;
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);

  const costSettlements: QuoteCostSettlementItem[] = useMemo(() => {
    const items: QuoteCostSettlementItem[] = [];

    // 1. Các khoản chi tiền mặt / sao kê ngân hàng / chi ngoài sổ
    if (activeSettlements && Array.isArray(activeSettlements)) {
      activeSettlements
        .filter((s: any) => {
          const type = s.settlementType || s.settlement_type;
          return type === "PAYMENT";
        })
        .forEach((s: any, idx: number) => {
          items.push({
            id: s.id || `cost-settlement-${idx}`,
            transDate: s.transDate || s.trans_date || s.createdAt,
            sourceChannel: s.sourceChannel || s.source_channel,
            category: s.category,
            partnerName:
              s.partnerName || s.partner_name || s.correspondentName || "—",
            amount: Number(s.amount || 0),
            note: s.note || s.description || "—",
            isPending: Boolean(s.isPending),
            type: "SETTLEMENT",
          });
        });
    }

    // 2. Các hóa đơn đầu vào (Mua vào) đã cấn trừ / liên kết
    if (activeLinkedInvoices && Array.isArray(activeLinkedInvoices)) {
      activeLinkedInvoices
        .filter((inv: any) => {
          const linkType = inv.linkType || inv.direction;
          return linkType === "IN";
        })
        .forEach((inv: any, idx: number) => {
          const invAmount = Number(
            inv.totalAmount || inv.invoice?.totalAmount || inv.amount || 0,
          );
          const invNo = inv.invoiceNo || inv.invoice?.invoiceNo || "---";
          items.push({
            id: `inv-in-${inv.id || inv.invoiceId || idx}`,
            transDate:
              inv.invoiceDate ||
              inv.invoice?.invoiceDate ||
              inv.createdAt ||
              inv.created_at,
            sourceChannel: "ON_SYSTEM",
            category: "HOA_DON_DAU_VAO",
            partnerName:
              inv.sellerName ||
              inv.invoice?.sellerName ||
              inv.partnerName ||
              "—",
            amount: invAmount,
            note:
              inv.note ||
              inv.invoice?.note ||
              (invNo !== "---" ? `HĐ số ${invNo}` : "HĐ đầu vào"),
            isPending: Boolean(inv.isPending),
            type: "INVOICE",
            invoiceNo: invNo,
          });
        });
    }

    // Sắp xếp theo ngày mới nhất lên đầu
    return items.sort((a, b) => {
      const timeA = a.transDate ? new Date(a.transDate).getTime() : 0;
      const timeB = b.transDate ? new Date(b.transDate).getTime() : 0;
      return timeB - timeA;
    });
  }, [activeSettlements, activeLinkedInvoices]);

  const totalPaid = useMemo(() => {
    return costSettlements.reduce((sum, item) => sum + item.amount, 0);
  }, [costSettlements]);

  const remainingAmount = useMemo(() => {
    return Math.max(0, totalCostAmount - totalPaid);
  }, [totalCostAmount, totalPaid]);

  const handleOpenPayment = useCallback(() => {
    setIsPaymentDrawerOpen(true);
  }, []);

  const handleClosePayment = useCallback(() => {
    setIsPaymentDrawerOpen(false);
    onPaymentSaved?.();
  }, [onPaymentSaved]);

  return {
    isPaymentDrawerOpen,
    costSettlements,
    totalPaid,
    remainingAmount,
    handleOpenPayment,
    handleClosePayment,
  };
}
