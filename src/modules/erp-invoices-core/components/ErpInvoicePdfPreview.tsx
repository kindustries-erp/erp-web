import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileDown, Boxes } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useInvoicePreviewMode } from "../context/InvoicePreviewModeContext";
import { type ErpInvoice, erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import {
  getAttachmentDownloadUrlApi,
  getFileViewUrl,
} from "@/modules/system/api/attachmentsApi";

export interface ErpInvoicePdfPreviewProps {
  detailInvoice: ErpInvoice | null;
  onPdfSelectorRender?: (node: React.ReactNode) => void;
}

export function ErpInvoicePdfPreview({
  detailInvoice,
}: ErpInvoicePdfPreviewProps) {
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

  if (isPdfLoading) {
    return (
      <div className="w-full min-h-[350px] flex items-center justify-center bg-muted/30 rounded-xl border border-border/60 animate-pulse">
        <div className="text-muted-foreground font-medium text-xs">
          {t("loadingPdf", "Đang tải PDF...")}
        </div>
      </div>
    );
  }

  if (pdfUrl) {
    return (
      <div className="flex flex-col gap-2">
        {availablePdfs.length > 1 && (
          <div className="flex items-center justify-end gap-1.5 px-1">
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
        )}
        <div className="rounded-xl overflow-hidden border border-border/60">
          <iframe
            src={pdfUrl}
            className="w-full min-h-[500px] border-0"
            title="PDF Preview"
          />
        </div>
      </div>
    );
  }

  return (
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
          "Hóa đơn này chưa có tệp PDF gốc. Bạn có thể tải lên tệp PDF trong mục Tài liệu đính kèm hoặc xem bảng chi tiết hàng hóa, dịch vụ.",
        )}
      </div>
      {previewContext?.setPreviewMode && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => previewContext.setPreviewMode("template")}
          className="text-xs cursor-pointer"
        >
          <Boxes className="w-3.5 h-3.5 mr-1.5" />
          {t("switchToTemplate", "Xem chi tiết HHDV")}
        </Button>
      )}
    </div>
  );
}
