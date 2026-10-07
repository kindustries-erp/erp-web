import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  buildReceivablesTreeItems,
  FinancialTreeParentRow,
  FinancialTreeChildRow,
  type FinancialTreeItem,
} from "../financial-tree-rows";
import type { QuoteReceivablesTableProps } from "./QuoteReceivablesTable.type";

export function QuoteReceivablesTable({
  caseData,
  activeSettlements,
  activeLinkedInvoices,
  className,
  canEditFinancial = true,
  canPerformPayment = true,
  disabledReason,
  onPaymentClick,
  onRemoveInvoice,
  onRemoveSettlement,
}: QuoteReceivablesTableProps) {
  const { t } = useTranslation(["garage", "common"]);

  const treeItems = useMemo(() => {
    return buildReceivablesTreeItems(
      caseData,
      activeSettlements,
      activeLinkedInvoices,
      t,
    );
  }, [caseData, activeSettlements, activeLinkedInvoices, t]);

  const parentItem = treeItems[0];
  const childItems = treeItems.slice(1);

  const rawData = caseData?.rawData;
  const khAmount = Number(
    rawData?.TienThanhToanKH ?? caseData?.tienThanhToanKh ?? 0,
  );
  const bhAmount = Number(
    rawData?.TienThanhToanBH ?? caseData?.tienThanhToanBh ?? 0,
  );

  const effectiveCanPerform = Boolean(canPerformPayment && canEditFinancial);

  const handleCollectKH = () => {
    onPaymentClick?.({
      id: "KH",
      stt: 1,
      payer: "KH",
      labelKey: "cases.quotePreview.fin.customerPayment",
      defaultLabel: "Khách hàng thanh toán",
      amount: khAmount > 0 ? khAmount : parentItem?.amount || 0,
    });
  };

  const handleCollectBH = () => {
    onPaymentClick?.({
      id: "BH",
      stt: 2,
      payer: "BH",
      labelKey: "cases.quotePreview.fin.insuranceApproved",
      defaultLabel: "Bảo hiểm thanh toán",
      amount: bhAmount,
    });
  };

  const handleRemoveItem = (item: FinancialTreeItem) => {
    if (!item.sourceId) return;
    if (item.sourceType === "INVOICE") {
      onRemoveInvoice?.(item.sourceId);
    } else if (item.sourceType === "SETTLEMENT") {
      onRemoveSettlement?.(item.sourceId);
    }
  };

  if (!parentItem) return null;

  return (
    <div
      className={`rounded-md border border-border/80 overflow-hidden bg-card ${className || "w-full"}`}
    >
      {/* ── HEADER TABLE THEO HÌNH 2 ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/60 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="flex-1 min-w-0">
          {t("cases.quotePreview.fin.itemCol", "Danh mục / Chứng từ")}
        </div>
        <div className="w-36 text-right px-2">
          {t("cases.quotePreview.fin.amountCol", "Số tiền")}
        </div>
        <div className="w-20 text-right px-2">
          {t("cases.financials.percentTotal", "% Tổng")}
        </div>
        <div className="w-24 text-right pl-1">
          {t("cases.financials.actionCol", "Thao tác")}
        </div>
      </div>

      {/* ── DÒNG CHA MỤC TIÊU ── */}
      <FinancialTreeParentRow
        item={parentItem}
        childCount={childItems.length}
        canPerform={effectiveCanPerform}
        disabledReason={disabledReason}
        hasInsurance={bhAmount > 0}
        onCollect={handleCollectKH}
        onCollectKH={handleCollectKH}
        onCollectBH={handleCollectBH}
      />

      {/* ── CÁC DÒNG CON CẤN TRỪ ↳ ── */}
      {childItems.map((child) => (
        <FinancialTreeChildRow
          key={child.id}
          item={child}
          canRemove={effectiveCanPerform}
          disabledReason={disabledReason}
          onRemove={handleRemoveItem}
        />
      ))}
    </div>
  );
}
