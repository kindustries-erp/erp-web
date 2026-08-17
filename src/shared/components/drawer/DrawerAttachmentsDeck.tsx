import React, { useRef } from "react";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Download,
  Eye,
  Trash2,
  UploadCloud,
  Paperclip,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export interface DrawerAttachmentItem {
  id: string;
  name: string;
  size?: number | string;
  fileType?: string;
  url?: string;
  uploadedAt?: string | Date;
  uploadedBy?: string;
}

export interface DrawerAttachmentsDeckProps {
  attachments: DrawerAttachmentItem[];
  onPreview?: (item: DrawerAttachmentItem) => void;
  onDownload?: (item: DrawerAttachmentItem) => void;
  onDelete?: (item: DrawerAttachmentItem) => void;
  onUpload?: (files: File[]) => void;
  readOnly?: boolean;
  emptyLabel?: string;
  className?: string;
}

function getFileIcon(name: string, fileType?: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (
    ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext) ||
    fileType?.includes("image")
  ) {
    return {
      icon: <FileImage className="w-5 h-5 text-emerald-500" />,
      bgCls: "bg-emerald-500/10",
    };
  }
  if (
    ["xls", "xlsx", "csv"].includes(ext) ||
    fileType?.includes("spreadsheet") ||
    fileType?.includes("excel")
  ) {
    return {
      icon: <FileSpreadsheet className="w-5 h-5 text-teal-600" />,
      bgCls: "bg-teal-500/10",
    };
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return {
      icon: <FileArchive className="w-5 h-5 text-amber-500" />,
      bgCls: "bg-amber-500/10",
    };
  }
  if (["pdf"].includes(ext) || fileType?.includes("pdf")) {
    return {
      icon: <FileText className="w-5 h-5 text-red-500" />,
      bgCls: "bg-red-500/10",
    };
  }
  return {
    icon: <FileText className="w-5 h-5 text-blue-500" />,
    bgCls: "bg-blue-500/10",
  };
}

function formatFileSize(size?: number | string): string {
  if (size === undefined || size === null) return "";
  if (typeof size === "string") return size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function DrawerAttachmentsDeck({
  attachments,
  onPreview,
  onDownload,
  onDelete,
  onUpload,
  readOnly = false,
  emptyLabel,
  className,
}: DrawerAttachmentsDeckProps) {
  const t = useT();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload?.(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Dropzone Header (if upload supported and not readOnly) */}
      {!readOnly && onUpload && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-3.5 flex items-center justify-center gap-2.5 bg-muted/20 hover:bg-primary/5 cursor-pointer transition-all text-xs text-muted-foreground hover:text-foreground group"
        >
          <UploadCloud className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span>{t("Nhấn để tải lên tệp mới hoặc kéo thả vào đây")}</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Attachments List */}
      {!attachments || attachments.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
          <Paperclip className="w-5 h-5 text-muted-foreground/50 mb-1" />
          <span>{emptyLabel || t("Chưa có tệp đính kèm.")}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {attachments.map((file) => {
            const { icon, bgCls } = getFileIcon(file.name, file.fileType);
            const sizeStr = formatFileSize(file.size);

            return (
              <div
                key={file.id}
                className="group flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-border/80 bg-surface hover:border-border transition-all shadow-2xs"
              >
                {/* File icon + details */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      bgCls,
                    )}
                  >
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-medium text-foreground truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                      {sizeStr && <span>{sizeStr}</span>}
                      {file.uploadedBy && <span>• {file.uploadedBy}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onPreview(file)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title={t("Xem trước")}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {onDownload && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDownload(file)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title={t("Tải xuống")}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {!readOnly && onDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(file)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                      title={t("Xóa tệp")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
