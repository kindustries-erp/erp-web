import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { DrawerRow, DrawerSection } from "@/v2/shared/components";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { V2FilePreviewPanel } from "@/v2/shared/components/organisms/v2-file-preview-panel";
import { formatFileSize } from "@/v2/shared/components/organisms/v2-attachments-panel/V2AttachmentsPanel.helper";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { fileAttachmentsV2Api } from "../api/fileAttachmentsApi";
import { fileAttachmentsKeys } from "../api/queries/fileAttachmentsKeys";

export interface FileAttachmentDrawerProps {
  recordId: string;
  onClose: () => void;
}

/** Chi tiết tài liệu, chỉ đọc: thông tin, chứng từ sở hữu và xem trước */
export function FileAttachmentDrawer({
  recordId,
  onClose,
}: FileAttachmentDrawerProps) {
  const { t } = useV2Translation();
  const detail = useQuery({
    queryKey: fileAttachmentsKeys.detail(recordId),
    queryFn: () => fileAttachmentsV2Api.get(recordId),
  });
  const preview = useQuery({
    queryKey: [...fileAttachmentsKeys.detail(recordId), "preview"],
    queryFn: () => fileAttachmentsV2Api.downloadUrl(recordId, true),
    staleTime: 60_000,
  });
  const row = detail.data;
  const fmt = (v?: string | null) =>
    v ? new Date(v).toLocaleString("vi-VN") : "—";

  return (
    <V2StandardDrawer
      id={`fileAttachment-${recordId}`}
      open
      mode="view"
      onClose={onClose}
      title={t("v2.fileAttachments.detail.title", "Chi tiết tài liệu")}
      subtitle={row?.fileName}
      layout="1-column"
      size="lg"
      loading={detail.isLoading}
      actions={[
        {
          label: t("v2.common.close", "Đóng"),
          onClick: onClose,
          variant: "outline",
        },
      ]}
    >
      {row && (
        <div className="flex flex-col gap-3">
          <DrawerSection
            title={t("v2.fileAttachments.detail.title", "Chi tiết tài liệu")}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <DrawerRow
                label={t("v2.fileAttachments.columns.fileName", "Tên tệp")}
                value={row.fileName}
                copyable
              />
              <DrawerRow
                label={t("v2.fileAttachments.columns.fileSize", "Dung lượng")}
                value={formatFileSize(row.fileSize)}
              />
              <DrawerRow
                label={t("v2.fileAttachments.detail.mimeType", "Định dạng")}
                value={row.mimeType ?? "—"}
              />
              <DrawerRow
                label={t("v2.fileAttachments.columns.category", "Loại")}
                value={t(
                  `v2.attachmentsPanel.categories.${row.category}`,
                  row.category,
                )}
              />
              <DrawerRow
                label={t("v2.fileAttachments.columns.origin", "Nguồn")}
                value={t(
                  `v2.fileAttachments.origins.${row.origin}`,
                  row.origin,
                )}
              />
              <DrawerRow
                label={t(
                  "v2.fileAttachments.columns.createdAt",
                  "Ngày tải lên",
                )}
                value={fmt(row.createdAt)}
              />
              <DrawerRow
                label={t("v2.fileAttachments.detail.owner", "Chứng từ sở hữu")}
                value={`${t(`v2.fileAttachments.owners.${row.ownerType}`, row.ownerType)} · ${row.ownerId}`}
                copyText={row.ownerId}
                copyable
              />
              {row.isDeleted && (
                <DrawerRow
                  label={t("v2.fileAttachments.detail.deletedAt", "Ngày xóa")}
                  value={fmt(row.deletedAt)}
                />
              )}
            </div>
            {row.isDeleted && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("v2.fileAttachments.detail.deletedHint", "Tệp đã xóa mềm.")}
              </p>
            )}
          </DrawerSection>
          <V2FilePreviewPanel
            file={
              preview.data
                ? {
                    name: row.fileName,
                    mimeType: row.mimeType ?? undefined,
                    url: preview.data.url,
                  }
                : null
            }
            loading={preview.isLoading}
            error={
              preview.error
                ? t("v2.attachmentsPanel.previewError", "Không mở được tệp")
                : null
            }
            height={420}
          />
        </div>
      )}
    </V2StandardDrawer>
  );
}
