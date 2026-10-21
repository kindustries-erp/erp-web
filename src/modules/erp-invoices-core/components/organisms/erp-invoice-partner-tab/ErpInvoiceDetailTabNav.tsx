import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, BookOpen, Link2, Paperclip } from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import type { InvoiceDetailViewMode } from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";

export type InvoiceDetailSubTabKey = "details" | "accounting" | "linked_docs";

export interface ErpInvoiceDetailTabNavProps {
  subTab?: InvoiceDetailSubTabKey;
  onSubTabChange?: (tab: InvoiceDetailSubTabKey) => void;
  detailViewMode: InvoiceDetailViewMode;
  onDetailViewModeChange: (mode: InvoiceDetailViewMode) => void;
  attachmentCount?: number;
  hasPdf?: boolean;
  accountingBadgeCount?: number;
  linkedBadgeCount?: number;
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
    linkedBadgeCount,
  }: ErpInvoiceDetailTabNavProps) {
    const { t } = useTranslation("erpInvoices");

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
        {/* Bên trái: 3 sub pill tabs (Chi tiết hóa đơn | Hạch toán kế toán | Chứng từ liên kết) */}
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
              {
                value: "linked_docs",
                label: t("tabLinkedDocs", "Chứng từ liên kết"),
                icon: Link2,
                badgeCount:
                  linkedBadgeCount && linkedBadgeCount > 0
                    ? linkedBadgeCount
                    : undefined,
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
