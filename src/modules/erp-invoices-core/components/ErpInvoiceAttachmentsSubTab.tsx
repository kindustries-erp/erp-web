import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  type ErpInvoice,
  type CreateErpInvoicePayload,
} from "../api/erpInvoicesCoreApi";
import {
  ErpInvoicePdfUpload,
  type PendingAttachment,
} from "./ErpInvoicePdfUpload";

export interface ErpInvoiceAttachmentsSubTabProps {
  invoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  onLinkExistingAttachment?: (attachmentId: string) => void;
  onUnlinkAttachment?: (attachmentId: string) => void;
}

export const ErpInvoiceAttachmentsSubTab = React.memo(
  function ErpInvoiceAttachmentsSubTab({
    invoice,
    form,
    editMode = false,
    fieldSet,
    onLinkExistingAttachment,
    onUnlinkAttachment,
  }: ErpInvoiceAttachmentsSubTabProps) {
    const { t } = useTranslation("erpInvoices");

    const attachmentCount = useMemo(() => {
      let count = 0;
      if (invoice?.pdfFileKey) count++;
      if (invoice?.pdfFiles && invoice.pdfFiles.length > 0) {
        count += invoice.pdfFiles.length;
      }
      if (invoice?.attachments && invoice.attachments.length > 0) {
        count += invoice.attachments.length;
      }
      if (
        form?.pendingAddedAttachments &&
        form.pendingAddedAttachments.length > 0
      ) {
        count += form.pendingAddedAttachments.length;
      }
      if (form?.pendingDeletedPdfs && form.pendingDeletedPdfs.length > 0) {
        count -= form.pendingDeletedPdfs.length;
      }
      return Math.max(0, count);
    }, [
      invoice?.pdfFileKey,
      invoice?.pdfFiles,
      invoice?.attachments,
      form?.pendingAddedAttachments,
      form?.pendingDeletedPdfs,
    ]);

    if (!invoice?.id) {
      return (
        <div className="p-8 text-center bg-surface/50 rounded-xl border border-border/70 text-xs text-muted-foreground">
          {t(
            "noInvoiceForAttachments",
            "Chưa có thông tin hóa đơn để quản lý tài liệu đính kèm.",
          )}
        </div>
      );
    }

    const handlePendingDeletePdf = (key: string) => {
      const current = form?.pendingDeletedPdfs || [];
      fieldSet?.("pendingDeletedPdfs", [...current, key]);
    };

    const handlePendingAddedAttachmentsChange = (
      files: PendingAttachment[],
    ) => {
      fieldSet?.("pendingAddedAttachments", files);
    };

    return (
      <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1 w-full">
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Paperclip className="w-4 h-4 text-primary" />
              <span>
                {t("tabAttachmentsTitle", "Tài liệu đính kèm & Tệp PDF")}
              </span>
              {attachmentCount > 0 && (
                <span className="text-xs font-normal text-muted-foreground lowercase">
                  ({attachmentCount} {t("attachmentsUnit", "tệp")})
                </span>
              )}
            </div>
          }
          collapsible={true}
          defaultCollapsed={false}
          className="p-3 border border-slate-200/80 dark:border-slate-800"
        >
          <ErpInvoicePdfUpload
            noCard={true}
            invoiceId={invoice.id}
            attachments={invoice.attachments ?? null}
            pdfFileKey={invoice.pdfFileKey ?? null}
            pdfFiles={invoice.pdfFiles ?? null}
            editMode={editMode}
            pendingDeletedPdfs={form?.pendingDeletedPdfs}
            onPendingDeletePdf={handlePendingDeletePdf}
            pendingAddedAttachments={form?.pendingAddedAttachments}
            onPendingAddedAttachmentsChange={
              handlePendingAddedAttachmentsChange
            }
            onLinkExistingAttachment={onLinkExistingAttachment}
            onUnlinkAttachment={onUnlinkAttachment}
          />
        </DrawerSection>
      </div>
    );
  },
);
