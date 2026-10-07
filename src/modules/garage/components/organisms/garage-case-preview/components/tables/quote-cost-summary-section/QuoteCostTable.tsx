import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  buildCostTreeItems,
  FinancialTreeParentRow,
  FinancialTreeChildRow,
  type FinancialTreeItem,
} from "../financial-tree-rows";
import type { QuoteCostTableProps } from "./QuoteCostSummarySection.type";

export const QuoteCostTable: React.FC<QuoteCostTableProps> = ({
  totalCostAmount,
  activeLinkedInvoices,
  activeSettlements,
  canPerformPayment,
  disabledReason,
  onPaymentClick,
  onRemoveInvoice,
  onRemoveSettlement,
  className,
}) => {
  const { t } = useTranslation(["garage", "common"]);

  const treeItems = useMemo(() => {
    return buildCostTreeItems(
      totalCostAmount,
      activeSettlements,
      activeLinkedInvoices,
      t,
    );
  }, [totalCostAmount, activeSettlements, activeLinkedInvoices, t]);

  const parentItem = treeItems[0];
  const childItems = treeItems.slice(1);

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
        canPerform={canPerformPayment}
        disabledReason={disabledReason}
        onPay={onPaymentClick}
      />

      {/* ── CÁC DÒNG CON CẤN TRỪ ↳ ── */}
      {childItems.map((child) => (
        <FinancialTreeChildRow
          key={child.id}
          item={child}
          canRemove={canPerformPayment}
          onRemove={handleRemoveItem}
        />
      ))}
    </div>
  );
};
