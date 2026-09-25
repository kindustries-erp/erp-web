import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText, FileDown } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import {
  useInvoicePreviewMode,
  type InvoiceDetailViewMode,
} from "../context/InvoicePreviewModeContext";
import {
  type CreateErpInvoicePayload,
  ErpInvoice,
  erpInvoicesCoreApi,
} from "../api/erpInvoicesCoreApi";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/ModuleEntityCustomFieldsSection";
import { ErpInvoiceGeneralInfoSection } from "./ErpInvoiceGeneralInfoSection";
import {
  getAttachmentDownloadUrlApi,
  getFileViewUrl,
} from "@/modules/system/api/attachmentsApi";
import { ErpInvoiceDefaultAttributesSection } from "./ErpInvoiceDefaultAttributesSection";

export function ErpInvoiceInternalSidebar({
  form,
  editMode,
  fieldSet,
  invoiceId,
  pendingTagIds = [],
  onPendingTagsChange,
  direction,
  detailInvoice,
  onRefreshDetail,
}: {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  invoiceId?: string | null;
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  direction: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  pdfSlot?: React.ReactNode;
  onRefreshDetail?: () => void;
  hideAccountingSection?: boolean;
}) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="flex flex-col gap-4">
      {/* 1. THÔNG TIN CHUNG (SHARED COMPONENT) */}
      <ErpInvoiceGeneralInfoSection
        invoice={detailInvoice}
        form={form}
        editMode={editMode}
        fieldSet={fieldSet}
        direction={direction}
        invoiceId={invoiceId}
        pendingTagIds={pendingTagIds}
        onPendingTagsChange={onPendingTagsChange}
      />

      {/* 2. THUỘC TÍNH MẶC ĐỊNH (ATOMIC SUB-COMPONENT) */}
      <ErpInvoiceDefaultAttributesSection
        form={form}
        editMode={editMode}
        fieldSet={fieldSet}
        direction={direction}
        detailInvoice={detailInvoice}
        onRefreshDetail={onRefreshDetail}
      />

      {/* 3. THUỘC TÍNH TÙY CHỈNH (Auto-hidden when empty) */}
      <ModuleEntityCustomFieldsSection
        moduleKey={direction === "OUT" ? "INVOICE_OUT" : "INVOICE_IN"}
        entityId={detailInvoice?.id || invoiceId}
        editMode={editMode}
        globalTitle={t("customAttributes", "THUỘC TÍNH TÙY CHỈNH")}
        includeSystemAttributes={false}
        hideCategorySection={true}
        globalAttributes={(form as any).globalAttributes}
        onGlobalAttributesChange={(gAttrs) =>
          fieldSet("globalAttributes", gAttrs)
        }
      />
    </div>
  );
}

export function ErpInvoiceInternalMain({
  detailInvoice,
  invoicePreview,
  previewMode: explicitPreviewMode,
}: {
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
}) {
  const { t } = useTranslation("erpInvoices");
  const previewContext = useInvoicePreviewMode();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);

  const availablePdfs = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      isLegacy: boolean;
      key?: string;
    }> = [];

    if (detailInvoice?.pdfFileKey) {
      list.push({
        id: detailInvoice.pdfFileKey,
        name: detailInvoice.pdfFileKey.split("/").pop() || "Hóa đơn PDF",
        isLegacy: true,
        key: detailInvoice.pdfFileKey,
      });
    }

    if (detailInvoice?.pdfFiles && detailInvoice.pdfFiles.length > 0) {
      for (const f of detailInvoice.pdfFiles) {
        if (f.key && !list.some((item) => item.key === f.key)) {
          list.push({
            id: f.key,
            name: f.filename || f.key.split("/").pop() || "Hóa đơn PDF",
            isLegacy: true,
            key: f.key,
          });
        }
      }
    }

    if (detailInvoice?.attachments && detailInvoice.attachments.length > 0) {
      for (const item of detailInvoice.attachments) {
        const att = item.attachment;
        if (
          att &&
          (att.mimeType === "application/pdf" ||
            att.fileName?.toLowerCase().endsWith(".pdf") ||
            att.fileKey?.toLowerCase().endsWith(".pdf"))
        ) {
          if (!list.some((existing) => existing.id === att.id)) {
            list.push({
              id: att.id,
              name: att.fileName || "Hóa đơn PDF",
              isLegacy: false,
              key: att.fileKey,
            });
          }
        }
      }
    }

    return list;
  }, [detailInvoice]);

  const currentPdf = useMemo(() => {
    if (availablePdfs.length === 0) return null;
    if (selectedPdfId) {
      const found = availablePdfs.find((p) => p.id === selectedPdfId);
      if (found) return found;
    }
    return availablePdfs[0];
  }, [availablePdfs, selectedPdfId]);

  const activeMode: InvoiceDetailViewMode =
    explicitPreviewMode ?? previewContext?.previewMode ?? "template";

  useEffect(() => {
    let isMounted = true;
    if (!currentPdf || !detailInvoice?.id) {
      setPdfUrl(null);
      setIsPdfLoading(false);
      return;
    }

    setIsPdfLoading(true);

    if (currentPdf.isLegacy && currentPdf.key) {
      erpInvoicesCoreApi
        .getPdfDownloadUrl(detailInvoice.id, currentPdf.key, true)
        .then((res) => {
          if (isMounted) {
            setPdfUrl(res.url);
            setIsPdfLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setPdfUrl(null);
            setIsPdfLoading(false);
          }
        });
    } else {
      getAttachmentDownloadUrlApi(currentPdf.id, true)
        .then((res) => {
          if (isMounted) {
            setPdfUrl(res.url || getFileViewUrl(currentPdf.id));
            setIsPdfLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setPdfUrl(getFileViewUrl(currentPdf.id));
            setIsPdfLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [currentPdf, detailInvoice?.id]);

  const sectionTitleExtra = useMemo(() => {
    if (activeMode !== "pdf" || availablePdfs.length <= 1) return undefined;
    return (
      <div
        className="flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-muted-foreground font-normal">
          {t("selectedPdfFile", "Tệp:")}
        </span>
        <select
          value={currentPdf?.id || ""}
          onChange={(e) => setSelectedPdfId(e.target.value)}
          className="text-xs font-medium border border-border bg-background rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary max-w-[200px] truncate"
        >
          {availablePdfs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    );
  }, [activeMode, availablePdfs, currentPdf, t]);

  return (
    <div className="flex flex-col gap-4">
      {/* Invoice preview — ALWAYS rendered in both view and edit mode */}
      <DrawerSection
        title={
          <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            {activeMode === "pdf" ? (
              <>
                <FileDown className="w-3.5 h-3.5 text-primary" />
                {t("previewPdfTitle", "Tệp PDF hóa đơn gốc")}
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-primary" />
                {t("previewInvoiceTitle", "Xem trước hóa đơn")}
              </>
            )}
          </span>
        }
        titleExtra={sectionTitleExtra}
        collapsible
        defaultCollapsed={false}
        fitViewportHeight
        peekRelatedDeck
      >
        <div className="w-full">
          {activeMode === "pdf" ? (
            isPdfLoading ? (
              <div className="w-full min-h-[350px] flex items-center justify-center bg-muted/30 rounded-xl border border-border/60 animate-pulse">
                <div className="text-muted-foreground font-medium text-xs">
                  {t("loadingPdf", "Đang tải PDF...")}
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="rounded-xl overflow-hidden border border-border/60">
                <iframe
                  src={pdfUrl}
                  className="w-full min-h-[500px] border-0"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="w-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-muted-foreground">
                  <FileDown className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-sm font-semibold text-foreground mb-1">
                  {t("noPdfFileTitle", "Chưa có tệp PDF đính kèm")}
                </div>
                <div className="text-xs text-muted-foreground max-w-sm mb-4">
                  {t(
                    "noPdfFileDesc",
                    "Hóa đơn này chưa có tệp PDF gốc. Bạn có thể tải lên tệp PDF trong mục Tài liệu đính kèm hoặc xem mẫu hóa đơn điện tử thuần.",
                  )}
                </div>
                {previewContext?.setPreviewMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewContext.setPreviewMode("template")}
                    className="text-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    {t("switchToTemplate", "Xem trước HĐ thuần")}
                  </Button>
                )}
              </div>
            )
          ) : (
            <div className="w-full">
              {invoicePreview ?? (
                <div className="w-full min-h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                  {t("noPreviewAvailable", "Không có bản xem trước hóa đơn")}
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerSection>
    </div>
  );
}
