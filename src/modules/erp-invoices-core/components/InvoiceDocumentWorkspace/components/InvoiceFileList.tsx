import React from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Image,
  Paperclip,
  Download,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import type { NormalizedInvoiceDocument } from "../types";

const TYPE_LABELS: Record<string, string> = {
  HOA_DON: "Hóa đơn",
  HOP_DONG: "Hợp đồng",
  BANG_KE: "Bảng kê",
  KHAC: "Khác",
};

interface Props {
  documents: NormalizedInvoiceDocument[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onDownloadDoc: (doc: NormalizedInvoiceDocument) => void;
  onDeleteDoc: (doc: NormalizedInvoiceDocument) => void;
}

function getFileIcon(mimeType?: string, name?: string) {
  const isPdf =
    mimeType === "application/pdf" || name?.toLowerCase().endsWith(".pdf");
  const isImg =
    mimeType?.startsWith("image/") ||
    name?.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/);
  if (isPdf) return <FileText className="w-4 h-4 text-rose-500 shrink-0" />;
  if (isImg) return <Image className="w-4 h-4 text-emerald-500 shrink-0" />;
  return <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />;
}

export const InvoiceFileList = React.memo(function InvoiceFileList({
  documents,
  activeDocId,
  onSelectDoc,
  onDownloadDoc,
  onDeleteDoc,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  if (documents.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-border bg-surface/40 text-center text-xs text-muted-foreground">
        {t("noDocumentsFound", "Chưa có tài liệu hoặc tệp PDF đính kèm.")}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
      {documents.map((doc) => {
        const isActive = activeDocId === doc.id;
        const typeLabel =
          TYPE_LABELS[doc.documentType || ""] ||
          doc.documentType ||
          t("generalDoc", "Tài liệu");
        const sizeText = doc.size
          ? ` • ${(doc.size / 1024).toFixed(0)} KB`
          : "";

        return (
          <div
            key={doc.id}
            onClick={() => onSelectDoc(doc.id)}
            className={cn(
              "group flex items-center justify-between gap-2 p-2 rounded-lg border transition-all cursor-pointer text-xs select-none",
              isActive
                ? "border-primary bg-primary/5 shadow-2xs"
                : "border-border/70 hover:border-border hover:bg-muted/30 bg-surface",
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getFileIcon(doc.mimeType, doc.name)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "font-medium truncate",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-foreground",
                    )}
                    title={doc.name}
                  >
                    {doc.name}
                  </span>
                  {isActive && (
                    <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 h-4 bg-muted/60 font-medium"
                  >
                    {typeLabel}
                  </Badge>
                  {doc.isPending && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                    >
                      {t("pendingSaveBadge", "Chờ lưu")}
                    </Badge>
                  )}
                  {doc.isLegacy && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {t("legacyPdfBadge", "PDF gốc")}
                    </Badge>
                  )}
                  <span>{sizeText}</span>
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip content={t("downloadFile", "Tải xuống")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => onDownloadDoc(doc)}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
              <Tooltip content={t("actionDelete", "Xóa")}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => onDeleteDoc(doc)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </div>
  );
});
