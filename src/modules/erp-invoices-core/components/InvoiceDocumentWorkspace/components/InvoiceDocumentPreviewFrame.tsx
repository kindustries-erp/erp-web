import React from "react";
import { useTranslation } from "react-i18next";
import {
  ExternalLink,
  Download,
  FileText,
  FileDown,
  Image as ImageIcon,
  Boxes,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { NormalizedInvoiceDocument } from "../types";

interface Props {
  activeDoc: NormalizedInvoiceDocument | null;
  previewUrl: string | null;
  isLoading: boolean;
  onDownloadDoc: (doc: NormalizedInvoiceDocument) => void;
  onSwitchToTemplate?: () => void;
}

export const InvoiceDocumentPreviewFrame = React.memo(
  function InvoiceDocumentPreviewFrame({
    activeDoc,
    previewUrl,
    isLoading,
    onDownloadDoc,
    onSwitchToTemplate,
  }: Props) {
    const { t } = useTranslation("erpInvoices");

    if (isLoading) {
      return (
        <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted/20 rounded-xl border border-border/70 animate-pulse">
          <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs font-medium">
            <FileDown className="w-6 h-6 animate-bounce text-primary" />
            <span>{t("loadingPdf", "Đang tải tài liệu...")}</span>
          </div>
        </div>
      );
    }

    if (!activeDoc) {
      return (
        <div className="w-full h-full min-h-[480px] flex flex-col items-center justify-center p-8 bg-surface rounded-xl border border-dashed border-border text-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3 text-muted-foreground">
            <FileDown className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-sm font-semibold text-foreground mb-1">
            {t("noPdfFileTitle", "Chưa có tệp PDF đính kèm")}
          </div>
          <div className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
            {t(
              "noPdfFileDesc",
              "Hóa đơn này chưa có tệp PDF gốc. Bạn có thể tải lên tệp PDF ở khung bên trái hoặc xem mẫu hóa đơn điện tử thuần.",
            )}
          </div>
          {onSwitchToTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToTemplate}
              className="text-xs cursor-pointer"
            >
              <Boxes className="w-3.5 h-3.5 mr-1.5" />
              {t("switchToTemplate", "Xem trước HĐ thuần")}
            </Button>
          )}
        </div>
      );
    }

    const isPdf =
      activeDoc.mimeType === "application/pdf" ||
      activeDoc.name.toLowerCase().endsWith(".pdf");
    const isImage =
      activeDoc.mimeType?.startsWith("image/") ||
      activeDoc.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/);
    const isExcel = activeDoc.name.toLowerCase().match(/\.(xlsx|xls|csv)$/);

    return (
      <div className="flex flex-col h-full min-h-[500px] rounded-xl border border-border/80 overflow-hidden bg-background">
        {/* Frame Top Header */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/40 border-b border-border/70 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="font-semibold text-foreground truncate"
              title={activeDoc.name}
            >
              {activeDoc.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {previewUrl && (
              <Tooltip content={t("openInNewTab", "Mở tab mới")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => window.open(previewUrl, "_blank")}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">
                    {t("openInNewTab", "Mở tab mới")}
                  </span>
                </Button>
              </Tooltip>
            )}
            <Tooltip content={t("downloadFile", "Tải xuống")}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs cursor-pointer"
                onClick={() => onDownloadDoc(activeDoc)}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">
                  {t("downloadFile", "Tải xuống")}
                </span>
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Frame Content Viewer */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center bg-slate-100 dark:bg-zinc-950 overflow-hidden">
          {isPdf && previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full min-h-[500px] border-0"
              title="PDF Preview"
            />
          ) : isImage && previewUrl ? (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img
                src={previewUrl}
                alt={activeDoc.name}
                className="max-w-full max-h-[500px] object-contain rounded shadow-xs"
              />
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                {isExcel ? (
                  <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
                ) : isImage ? (
                  <ImageIcon className="w-7 h-7 text-emerald-600" />
                ) : (
                  <FileText className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-foreground">
                  {activeDoc.name}
                </div>
                <div className="text-xs text-muted-foreground max-w-sm">
                  {t(
                    "noPreviewSupport",
                    "Định dạng này không hỗ trợ xem trực tiếp. Vui lòng tải file về máy để xem nội dung.",
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs mt-2"
                onClick={() => onDownloadDoc(activeDoc)}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {t("downloadFile", "Tải file về máy")}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);
