import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Paperclip,
  Upload,
  FileText,
  Trash2,
  FileSpreadsheet,
  FileCode,
  File,
  Eye,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { format } from "date-fns";
import toast from "react-hot-toast";
import type { OperationalDocument } from "@/modules/operational/api/operationalApi";
import type { ErpPurchaseOrder } from "../api/purchaseOrdersCoreApi";

export interface PurchaseOrderAttachmentsTabProps {
  purchaseOrder?: OperationalDocument | ErpPurchaseOrder | null;
  editMode?: boolean;
}

interface LocalAttachmentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  file?: File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
  if (["xlsx", "xls", "csv"].includes(ext || ""))
    return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
  if (["xml", "json"].includes(ext || ""))
    return <FileCode className="w-5 h-5 text-amber-500" />;
  return <File className="w-5 h-5 text-blue-500" />;
}

export const PurchaseOrderAttachmentsTab = React.memo(
  function PurchaseOrderAttachmentsTab({
    editMode = false,
  }: PurchaseOrderAttachmentsTabProps) {
    const { t } = useTranslation("purchaseOrders");
    const [attachments, setAttachments] = useState<LocalAttachmentItem[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const newItems: LocalAttachmentItem[] = files.map((file) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        uploadedAt: new Date().toISOString(),
        file,
      }));

      setAttachments((prev) => [...prev, ...newItems]);
      toast.success(
        t("Đã thêm {{count}} tệp đính kèm.", { count: files.length }),
      );
      e.target.value = "";
    };

    const handleDeleteAttachment = (id: string) => {
      setAttachments((prev) => prev.filter((a) => a.id !== id));
      toast.success(t("Đã xóa tệp đính kèm."));
    };

    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Upload Dropzone */}
        {editMode && (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors text-center">
            <Upload className="w-8 h-8 text-primary mb-2 opacity-80" />
            <span className="font-semibold text-xs text-foreground">
              {t("Nhấn để tải lên hoặc kéo thả tệp tại đây")}
            </span>
            <span className="text-[11px] text-muted-foreground mt-1">
              {t("Hỗ trợ PDF, Excel, Word, Báo giá, Hợp đồng, Biên bản")}
            </span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {/* Danh sách tệp */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                {t("Danh sách Tài liệu đính kèm")}
              </h4>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-mono"
              >
                {attachments.length}
              </Badge>
            </div>
          </div>

          {attachments.length === 0 ? (
            <div className="p-8 text-center bg-surface rounded-xl border border-border/60 text-muted-foreground text-xs">
              <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-foreground">
                {t("Chưa có tệp đính kèm nào")}
              </p>
              <p className="text-[11px] mt-0.5">
                {editMode
                  ? t(
                      "Hãy tải lên các tài liệu như Hợp đồng mua bán, Báo giá NCC...",
                    )
                  : t("Đơn mua hàng này chưa có tài liệu đính kèm.")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border/70 hover:border-border transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-muted/60 shrink-0">
                      {getFileIcon(att.name)}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="font-medium text-foreground truncate max-w-[320px]"
                        title={att.name}
                      >
                        {att.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground font-mono">
                        <span>{formatFileSize(att.size)}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(att.uploadedAt), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {att.file && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          const url = URL.createObjectURL(att.file!);
                          window.open(url, "_blank");
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    {editMode && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
