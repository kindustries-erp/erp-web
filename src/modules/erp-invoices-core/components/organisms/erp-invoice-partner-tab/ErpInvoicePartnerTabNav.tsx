import React from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Boxes,
  TrendingUp,
  Paperclip,
  RotateCcw,
} from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import { Button } from "@/shared/components/ui/Button";
import type { InvoiceDetailViewMode } from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";

export type PartnerSubTabMode = "details" | "invoices" | "lines" | "analytics";

export interface ErpInvoicePartnerTabNavProps {
  viewMode: PartnerSubTabMode;
  onViewModeChange: (mode: PartnerSubTabMode) => void;
  detailViewMode: InvoiceDetailViewMode;
  onDetailViewModeChange: (mode: InvoiceDetailViewMode) => void;
  debtInvoicesCount?: number;
  itemLinesTotal?: number;
  itemActiveFilterCount?: number;
  onClearItemFilters?: () => void;
  attachmentCount?: number;
  hasPdf?: boolean;
}

export const ErpInvoicePartnerTabNav = React.memo(
  function ErpInvoicePartnerTabNav({
    viewMode,
    onViewModeChange,
    detailViewMode,
    onDetailViewModeChange,
    debtInvoicesCount = 0,
    itemLinesTotal = 0,
    itemActiveFilterCount = 0,
    onClearItemFilters,
    attachmentCount = 0,
    hasPdf = false,
  }: ErpInvoicePartnerTabNavProps) {
    const { t } = useTranslation("erpInvoices");

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5 w-full">
        {/* Bên trái: Sub-Tabs */}
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
          <PillTabs<PartnerSubTabMode>
            size="sm"
            value={viewMode}
            onValueChange={onViewModeChange}
            items={[
              {
                value: "details",
                label: t("tabDetails", "1. Chi tiết"),
                icon: FileText,
              },
              {
                value: "invoices",
                label: t("tabInvoicesList", "2. Chi tiết theo đối tượng"),
                icon: FileText,
                badgeCount:
                  debtInvoicesCount > 0 ? debtInvoicesCount : undefined,
              },
              {
                value: "lines",
                label: t("tabGoodsItems", "3. Chi tiết HHDV"),
                icon: Boxes,
                badgeCount: itemLinesTotal > 0 ? itemLinesTotal : undefined,
              },
              {
                value: "analytics",
                label: t("tabCashflowAnalytics", "4. Biến động & Phân tích"),
                icon: TrendingUp,
              },
            ]}
          />
        </div>

        {/* Bên phải: Quick Actions & View Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {viewMode === "details" && (
            <PillTabs<"template" | "pdf">
              size="sm"
              variant="button-group"
              value={detailViewMode}
              onValueChange={onDetailViewModeChange}
              items={[
                {
                  value: "template",
                  label: t("viewModeTemplate", "Xem trước HĐ thuần"),
                  icon: FileText,
                },
                {
                  value: "pdf",
                  label: t("viewModeAttachmentsAndPdf", "Tài liệu & PDF"),
                  icon: Paperclip,
                  badgeCount: attachmentCount > 0 ? attachmentCount : undefined,
                  dot: hasPdf && attachmentCount === 0,
                  dotColor: "emerald",
                },
              ]}
            />
          )}

          {viewMode === "invoices" && debtInvoicesCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {debtInvoicesCount} {t("invoicesCount", "hóa đơn")}
            </span>
          )}

          {viewMode === "lines" && (
            <>
              {itemActiveFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearItemFilters}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {t("clearFilters", "Đặt lại")} ({itemActiveFilterCount})
                </Button>
              )}
              {itemLinesTotal > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  {itemLinesTotal} {t("itemsCount", "dòng HHDV")}
                </span>
              )}
            </>
          )}

          {viewMode === "analytics" && debtInvoicesCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {debtInvoicesCount} {t("invoicesCount", "hóa đơn")}
            </span>
          )}
        </div>
      </div>
    );
  },
);
