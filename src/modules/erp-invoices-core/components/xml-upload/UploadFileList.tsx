import { useState } from "react";
import { FileText, FileCode, Archive, X, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type FileEntry } from "../../hooks/useInvoiceXmlUpload";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";

interface Props {
  files: FileEntry[];
  onRemove: (id: string) => void;
}

export function UploadFileList({ files, onRemove }: Props) {
  const { t } = useTranslation("erpInvoices");
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  if (files.length === 0) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border">
        {t("importSelected", {
          count: files.length,
          defaultValue: "{{count}} file đã chọn",
        })}
      </div>
      <ul className="divide-y divide-border max-h-48 overflow-y-auto">
        {files.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/20"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {entry.type === "xml" && <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
              {entry.type === "pdf" && <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />}
              {entry.type === "zip" && <Archive className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              
              <span className="truncate">{entry.file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {(entry.file.size / 1024).toFixed(0)} KB
              </span>
              
              {entry.type === "xml" && entry.pairedPdf && (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full ml-2 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã ghép PDF
                </span>
              )}
              {entry.type === "pdf" && !files.find(f => f.type === "xml" && f.pairedPdf === entry.file.name) && (
                <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full ml-2 shrink-0">
                  <AlertCircle className="w-3 h-3" />
                  Orphan
                </span>
              )}
            </div>
            <div className="ml-2 flex items-center gap-1 shrink-0">
              {entry.type === "pdf" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(entry.file);
                  }}
                  className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Xem PDF"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(entry.id);
                }}
                className="p-1.5 hover:text-destructive transition-colors rounded hover:bg-destructive/10"
                title="Xóa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      <FilePreviewDrawer
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
        fileName={previewFile?.name}
      />
    </div>
  );
}
