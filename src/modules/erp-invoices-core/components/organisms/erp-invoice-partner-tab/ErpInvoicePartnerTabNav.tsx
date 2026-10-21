import React from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Boxes,
  TrendingUp,
  RotateCcw,
  Paperclip,
  BookOpen,
} from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import { Button } from "@/shared/components/ui/Button";
import type { InvoiceDetailViewMode } from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";

export type PartnerSubTabMode = "invoices" | "lines" | "analytics";
export type InvoiceDetailSubTabKey = "details" | "accounting";

export interface ErpInvoiceDetailTabNavProps {
  subTab?: InvoiceDetailSubTabKey;
  onSubTabChange?: (tab: InvoiceDetailSubTabKey) => void;
  detailViewMode: InvoiceDetailViewMode;
  onDetailViewModeChange: (mode: InvoiceDetailViewMode) => void;
  attachmentCount?: number;
  hasPdf?: boolean;
  accountingBadgeCount?: number;
}

export const ErpInvoiceDetailTabNav = React.memo(
  function ErpInvoiceDetailTabNav({
    subTab = "details",
    onSubTabChange,
    detailViewMode,
    onDetailViewModeChange,
    attachmentCount = 0,
    hasPdf = false,
    accountingBadgeCount,
  }: ErpInvoiceDetailTabNavProps) {
    const { t } = useTranslation("erpInvoices");

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
        {/* Bên trái: 2 sub pill tabs (Chi tiết hóa đơn & Hạch toán kế toán) */}
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1">
          <PillTabs<InvoiceDetailSubTabKey>
            size="sm"
            value={subTab}
            onValueChange={(val) => onSubTabChange?.(val)}
            items={[
              {
                value: "details",
                label: t("tabInvoiceDetails", "Chi tiết hóa đơn"),
                icon: FileText,
              },
              {
                value: "accounting",
                label: t("tabAccounting", "Hạch toán kế toán"),
                icon: BookOpen,
                badgeCount: accountingBadgeCount,
              },
            ]}
          />
        </div>

        {/* Bên phải: 2 button xem trước HĐ thuần và Tài liệu & PDF (align right) - chỉ hiển thị khi ở sub-tab details */}
        {subTab === "details" && (
          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
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
          </div>
        )}
      </div>
    );
  },
);

export interface ErpInvoicePartnerSubTabNavProps {
  partnerSubTab: PartnerSubTabMode;
  onPartnerSubTabChange: (mode: PartnerSubTabMode) => void;
  debtInvoicesCount?: number;
  itemLinesTotal?: number;
  itemActiveFilterCount?: number;
  onClearItemFilters?: () => void;
}

export const ErpInvoicePartnerSubTabNav = React.memo(
  function ErpInvoicePartnerSubTabNav({
    partnerSubTab,
    onPartnerSubTabChange,
    debtInvoicesCount = 0,
    itemLinesTotal = 0,
    itemActiveFilterCount = 0,
    onClearItemFilters,
  }: ErpInvoicePartnerSubTabNavProps) {
    const { t } = useTranslation("erpInvoices");

    return (
      <div className="flex flex-col gap-2.5 pt-0.5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1">
            <PillTabs<PartnerSubTabMode>
              size="sm"
              value={partnerSubTab}
              onValueChange={onPartnerSubTabChange}
              items={[
                {
                  value: "invoices",
                  label: t("tabInvoicesList", "Chi tiết theo đối tượng"),
                  icon: FileText,
                  badgeCount:
                    debtInvoicesCount > 0 ? debtInvoicesCount : undefined,
                },
                {
                  value: "lines",
                  label: t("tabGoodsItems", "Bảng kê HHDV"),
                  icon: Boxes,
                  badgeCount: itemLinesTotal > 0 ? itemLinesTotal : undefined,
                },
                {
                  value: "analytics",
                  label: t("tabCashflowAnalytics", "Biến động & Phân tích"),
                  icon: TrendingUp,
                },
              ]}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {partnerSubTab === "invoices" && debtInvoicesCount > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                {debtInvoicesCount} {t("invoicesCount", "hóa đơn")}
              </span>
            )}

            {partnerSubTab === "lines" && (
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

            {partnerSubTab === "analytics" && debtInvoicesCount > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                {debtInvoicesCount} {t("invoicesCount", "hóa đơn")}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);
