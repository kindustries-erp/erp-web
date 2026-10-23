import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Eye,
  FileCode,
  FileText,
  X,
} from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Badge } from "@/v2/shared/ui/badge";
import { XmlFilePreviewModal } from "@/modules/erp-invoices-core/components/molecules/xml-file-preview-modal";
import type { XmlUploadFileListProps } from "./XmlUploadFileList.type";

export function XmlUploadFileList({ files, onRemove }: XmlUploadFileListProps) {
  const { t } = useTranslation("erpInvoices");
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  if (files.length === 0) return null;

  const isPaired = (name: string) =>
    files.some((f) => f.type === "xml" && f.pairedPdf === name);

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
        {t("importSelected", {
          count: files.length,
          defaultValue: "{{count}} file đã chọn",
        })}
      </div>
      <ul className="max-h-48 divide-y divide-border overflow-y-auto">
        {files.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-2 px-4 py-2 text-sm hover:bg-muted/20"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {entry.type === "xml" && (
                <FileCode className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              {entry.type === "pdf" && (
                <FileText className="h-3.5 w-3.5 shrink-0 text-red-500" />
              )}
              {entry.type === "zip" && (
                <Archive className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              )}
              <span className="truncate">{entry.file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {(entry.file.size / 1024).toFixed(0)} KB
              </span>
              {entry.type === "xml" && entry.pairedPdf && (
                <Badge variant="success" className="ml-2 shrink-0 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("importNotePaired", "Đã ghép PDF")}
                </Badge>
              )}
              {entry.type === "pdf" && !isPaired(entry.file.name) && (
                <Badge variant="warning" className="ml-2 shrink-0 gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Orphan
                </Badge>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {entry.type === "pdf" && (
                <V2Button
                  variant="ghost"
                  size="icon-xs"
                  title={t("importPreviewPdf", "Xem PDF")}
                  aria-label={t("importPreviewPdf", "Xem PDF")}
                  onClick={() => setPreviewFile(entry.file)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </V2Button>
              )}
              <V2Button
                variant="ghost"
                size="icon-xs"
                title={t("importRemove", "Xóa")}
                aria-label={t("importRemove", "Xóa")}
                className="hover:text-destructive"
                onClick={() => onRemove(entry.id)}
              >
                <X className="h-3.5 w-3.5" />
              </V2Button>
            </div>
          </li>
        ))}
      </ul>

      <XmlFilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

export const UploadFileList = XmlUploadFileList;
