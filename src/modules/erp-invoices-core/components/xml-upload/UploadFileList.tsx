import { FileText, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type FileEntry } from "../../hooks/useInvoiceXmlUpload";

interface Props {
  files: FileEntry[];
  onRemove: (id: string) => void;
}

export function UploadFileList({ files, onRemove }: Props) {
  const { t } = useTranslation("erpInvoices");

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
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{entry.file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {(entry.file.size / 1024).toFixed(0)} KB
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(entry.id);
              }}
              className="ml-2 p-0.5 hover:text-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
