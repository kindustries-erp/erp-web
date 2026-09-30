import React from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, Boxes } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  useInvoicePreviewMode,
  type InvoiceDetailViewMode,
} from "@/modules/erp-invoices-core/context/InvoicePreviewModeContext";
import type {
  CreateErpInvoicePayload,
  ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { ErpInvoiceDetailLinesTable } from "../erp-invoice-detail-lines-table";
import { ErpInvoicePdfPreview } from "../../molecules/erp-invoice-pdf-preview";

export interface ErpInvoiceInternalMainProps {
  form?: CreateErpInvoicePayload;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  postingState?: any;
  pendingUnpost?: boolean;
  onUnpost?: () => void;
  onRefreshDetail?: () => void;
  invoicePreview?: React.ReactNode;
  hideLinkedDocuments?: boolean;
  previewMode?: InvoiceDetailViewMode;
  onLinkExistingAttachment?: (attachmentId: string) => void;
  onUnlinkAttachment?: (attachmentId: string) => void;
}

export function ErpInvoiceInternalMain({
  detailInvoice,
  invoicePreview,
  previewMode: explicitPreviewMode,
  form,
  editMode,
  fieldSet,
  onLinkExistingAttachment,
  onUnlinkAttachment,
  onRefreshDetail,
}: ErpInvoiceInternalMainProps) {
  const { t } = useTranslation("erpInvoices");
  const previewContext = useInvoicePreviewMode();

  const activeMode: InvoiceDetailViewMode =
    explicitPreviewMode ?? previewContext?.previewMode ?? "template";

  return (
    <div className="flex flex-col gap-4">
      {/* Invoice lines / PDF preview — ALWAYS rendered in both view and edit mode */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wide">
            {activeMode === "pdf" ? (
              <>
                <Paperclip className="w-3.5 h-3.5 text-primary" />
                {t("tabAttachmentsAndPdfTitle", "Tài liệu đính kèm & Tệp PDF")}
              </>
            ) : (
              <>
                <Boxes className="w-3.5 h-3.5 text-primary" />
                <span>
                  {t(
                    "tabGoodsItemsTitle",
                    "Danh sách chi tiết hàng hóa & dịch vụ",
                  )}
                </span>
              </>
            )}
          </span>
        }
        collapsible
        defaultCollapsed={false}
        fitViewportHeight
        peekRelatedDeck
      >
        <div className="w-full">
          {activeMode === "pdf" ? (
            <ErpInvoicePdfPreview
              detailInvoice={detailInvoice}
              form={form}
              editMode={editMode}
              fieldSet={fieldSet}
              onLinkExistingAttachment={onLinkExistingAttachment}
              onUnlinkAttachment={onUnlinkAttachment}
              onRefreshDetail={onRefreshDetail}
            />
          ) : (
            <div className="w-full">
              {invoicePreview ??
                (detailInvoice ? (
                  <ErpInvoiceDetailLinesTable invoice={detailInvoice} />
                ) : (
                  <div className="w-full min-h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                    {t("noPreviewAvailable", "Không có dữ liệu chi tiết")}
                  </div>
                ))}
            </div>
          )}
        </div>
      </DrawerSection>
    </div>
  );
}
