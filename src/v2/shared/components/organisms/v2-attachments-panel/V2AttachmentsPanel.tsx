import { Download, Eye, Trash2 } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2FileUpload } from "@/v2/shared/components/molecules/v2-file-upload";
import { V2FilePreviewPanel } from "../v2-file-preview-panel";
import {
  formatFileSize,
  policyToUploadProps,
} from "./V2AttachmentsPanel.helper";
import { useV2AttachmentsPanel } from "./V2AttachmentsPanel.hook";
import type { V2AttachmentsPanelProps } from "./V2AttachmentsPanel.type";
import "./v2AttachmentsPanel.locale";

/** Panel tài liệu đính kèm của một owner: tải lên, danh sách, xem trước, tải về, xóa */
export function V2AttachmentsPanel(props: V2AttachmentsPanelProps) {
  const { canEdit = false, className } = props;
  const s = useV2AttachmentsPanel(props);
  const { t } = s;
  const uploadProps = policyToUploadProps(s.policy);

  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      {canEdit && (
        <div className="flex flex-col gap-2">
          {s.categories.length > 1 && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              {t("v2.attachmentsPanel.category", "Loại tài liệu")}
              <select
                className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                value={s.activeCategory}
                onChange={(e) => s.setCategory(e.target.value)}
              >
                {s.categories.map((c) => (
                  <option key={c} value={c}>
                    {t(`v2.attachmentsPanel.categories.${c}`, c)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <V2FileUpload
            multiple
            disabled={s.uploading || !s.policy}
            onFilesSelected={s.onFilesSelected}
            hint={
              s.policy
                ? `${s.policy.allowedExtensions.join(", ").toUpperCase()} · ${t("v2.attachmentsPanel.maxSize", "tối đa")} ${formatFileSize(s.policy.maxFileBytes)}`
                : undefined
            }
            {...uploadProps}
          />
        </div>
      )}

      {s.query.isLoading && (
        <p className="text-sm text-muted-foreground">
          {t("v2.attachmentsPanel.loading", "Đang tải...")}
        </p>
      )}
      {!s.query.isLoading && s.items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("v2.attachmentsPanel.empty", "Chưa có tài liệu")}
        </p>
      )}

      <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
        {s.items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-medium text-foreground"
                title={item.fileName}
              >
                {item.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  `v2.attachmentsPanel.categories.${item.category}`,
                  item.category,
                )}{" "}
                · {formatFileSize(item.fileSize)}
              </p>
            </div>
            <V2Button
              size="sm"
              variant="ghost"
              aria-label={t("v2.attachmentsPanel.preview", "Xem trước")}
              onClick={() => void s.openPreview(item)}
            >
              <Eye className="h-4 w-4" />
            </V2Button>
            <V2Button
              size="sm"
              variant="ghost"
              aria-label={t("v2.attachmentsPanel.download", "Tải xuống")}
              onClick={() => void s.download(item)}
            >
              <Download className="h-4 w-4" />
            </V2Button>
            {canEdit && (
              <V2Button
                size="sm"
                variant="ghost"
                aria-label={t("v2.attachmentsPanel.delete", "Xóa")}
                onClick={() => s.setDeleteTarget(item)}
              >
                <Trash2 className="h-4 w-4" />
              </V2Button>
            )}
          </li>
        ))}
      </ul>

      {s.preview && (
        <div className="rounded-md border border-border">
          <div className="flex justify-end p-1">
            <V2Button
              size="sm"
              variant="ghost"
              onClick={() => s.setPreview(null)}
            >
              {t("v2.attachmentsPanel.closePreview", "Đóng xem trước")}
            </V2Button>
          </div>
          <V2FilePreviewPanel
            file={s.preview.file}
            loading={s.preview.loading}
            error={s.preview.error}
            height={420}
          />
        </div>
      )}

      <V2ConfirmModal
        open={Boolean(s.deleteTarget)}
        title={t("v2.attachmentsPanel.deleteTitle", "Xác nhận xóa")}
        message={`${t("v2.attachmentsPanel.deleteMessage", "Xóa tài liệu này?")} ${s.deleteTarget?.fileName ?? ""}`}
        confirmLabel={t("v2.attachmentsPanel.delete", "Xóa")}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        variant="danger"
        isLoading={s.deleting}
        onConfirm={s.confirmDelete}
        onCancel={() => s.setDeleteTarget(null)}
        onOpenChange={(open) => !open && s.setDeleteTarget(null)}
      />
    </div>
  );
}
