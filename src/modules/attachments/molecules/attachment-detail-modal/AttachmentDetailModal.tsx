import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { DrawerModal, DrawerRow } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { getAttachmentTypeLabel } from "../../types/attachment.types";
import {
  useAttachmentPreview,
  formatFileSize,
} from "./AttachmentDetailModal.hook";
import type { AttachmentDetailModalProps } from "./AttachmentDetailModal.type";

export function AttachmentDetailModal({
  item,
  onClose,
  onOpenFile,
}: AttachmentDetailModalProps) {
  const t = useT();
  const { previewUrl } = useAttachmentPreview(item);
  const previewType = item?.mimeType ?? "";
  const fileName = item?.fileName ?? "";

  const isDoc =
    previewType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    previewType === "application/msword" ||
    previewType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    previewType === "application/vnd.ms-excel" ||
    fileName.toLowerCase().endsWith(".docx") ||
    fileName.toLowerCase().endsWith(".doc") ||
    fileName.toLowerCase().endsWith(".xlsx") ||
    fileName.toLowerCase().endsWith(".xls");

  return (
    <DrawerModal
      open={!!item}
      onClose={onClose}
      title={t("dinhkem.drawerTitle", "Chi tiết đính kèm")}
      subtitle={fileName}
      icon={<FileText className="w-4 h-4" />}
      panelClassName="w-[520px]"
    >
      {item && (
        <div className="space-y-4">
          <div>
            <DrawerRow
              label={t("dinhkem.docType", "Loại tài liệu")}
              value={getAttachmentTypeLabel(item.documentType)}
            />
            <DrawerRow
              label={t("dinhkem.fileId", "ID file")}
              value={item.id}
              cls="font-mono break-all"
            />
            <DrawerRow
              label={t("dinhkem.fileName", "Tên file")}
              value={item.fileName}
              cls="break-all"
            />
            <DrawerRow
              label={t("dinhkem.fileSize", "Dung lượng")}
              value={formatFileSize(item.fileSize)}
            />
            <DrawerRow
              label={t("dinhkem.mimeType", "Định dạng")}
              value={item.mimeType || "—"}
            />
            <DrawerRow
              label={t("dinhkem.createdAt", "Ngày tải")}
              value={item.createdAt || "—"}
            />
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-medium text-[color:var(--muted-fg)]">
                {t("dinhkem.viewContent", "Xem nội dung")}
              </div>
              {onOpenFile && (
                <Button
                  type="button"
                  onClick={onOpenFile}
                  variant="secondary"
                  size="sm"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  {t("dinhkem.openNewTab", "Mở tab mới")}
                </Button>
              )}
            </div>

            <div className="h-[360px] overflow-hidden rounded-lg border border-border bg-[color:var(--muted)] flex items-center justify-center">
              {previewUrl && previewType.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt={fileName}
                  className="h-full w-full object-contain"
                />
              ) : previewUrl && previewType === "application/pdf" ? (
                <iframe
                  title={fileName}
                  src={previewUrl}
                  className="h-full w-full bg-white"
                />
              ) : previewUrl && isDoc ? (
                <iframe
                  title={fileName}
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
                  className="h-full w-full bg-white"
                />
              ) : (
                <div className="px-6 text-center text-xs text-[color:var(--muted-fg)]">
                  {t(
                    "dinhkem.cannotPreview",
                    "Không thể tải preview cho loại file này. Hãy tải xuống để xem.",
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DrawerModal>
  );
}
