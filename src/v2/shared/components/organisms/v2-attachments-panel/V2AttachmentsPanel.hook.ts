import * as React from "react";
import {
  useV2DeleteFileMutation,
  useV2OwnerFilesQuery,
  useV2UploadFilesMutation,
  type V2OwnerFile,
} from "@/v2/shared/files";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { V2RejectedFile } from "@/v2/shared/components/molecules/v2-file-upload";
import type { V2FilePreviewFile } from "../v2-file-preview-panel";
import type { V2AttachmentsPanelProps } from "./V2AttachmentsPanel.type";

export function useV2AttachmentsPanel({
  api,
  defaultCategory,
}: V2AttachmentsPanelProps) {
  const { t } = useV2Translation();
  const query = useV2OwnerFilesQuery(api);
  const upload = useV2UploadFilesMutation(api);
  const remove = useV2DeleteFileMutation(api);
  const [category, setCategory] = React.useState(defaultCategory ?? "");
  const [deleteTarget, setDeleteTarget] = React.useState<V2OwnerFile | null>(
    null,
  );
  const [preview, setPreview] = React.useState<{
    file: V2FilePreviewFile | null;
    loading: boolean;
    error: string | null;
    id: string | null;
  } | null>(null);

  const categories = query.data?.categories ?? [];
  const activeCategory = category || categories[0] || undefined;

  const toast = React.useCallback(
    (variant: "success" | "destructive", title: string, description?: string) =>
      useV2ToastStore.getState().showToast({ variant, title, description }),
    [],
  );

  const onFilesSelected = React.useCallback(
    (accepted: File[], rejected: V2RejectedFile[]) => {
      if (rejected.length) {
        toast(
          "destructive",
          t(
            "v2.attachmentsPanel.rejected",
            "Một số tệp bị từ chối (sai loại hoặc quá lớn)",
          ),
          rejected.map((r) => r.file.name).join(", "),
        );
      }
      if (!accepted.length) return;
      upload.mutate(
        { files: accepted, category: activeCategory },
        {
          onSuccess: () =>
            toast("success", t("v2.attachmentsPanel.uploaded", "Đã tải lên")),
          onError: (error) => {
            const fallback = t(
              "v2.attachmentsPanel.uploadError",
              "Không thể tải lên",
            );
            toast("destructive", fallback, extractV2ApiError(error, fallback));
          },
        },
      );
    },
    [activeCategory, t, toast, upload],
  );

  const confirmDelete = React.useCallback(() => {
    if (!deleteTarget) return;
    remove.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast("success", t("v2.attachmentsPanel.deleted", "Đã xóa tài liệu"));
        // File đang xem trước bị xóa thì đóng khung xem trước
        setPreview((current) =>
          current?.id === deleteTarget.id ? null : current,
        );
        setDeleteTarget(null);
      },
      onError: (error) => {
        const fallback = t("v2.attachmentsPanel.deleteError", "Không thể xóa");
        toast("destructive", fallback, extractV2ApiError(error, fallback));
      },
    });
  }, [deleteTarget, remove, t, toast]);

  const openPreview = React.useCallback(
    async (item: V2OwnerFile) => {
      setPreview({ file: null, loading: true, error: null, id: item.id });
      try {
        const { url } = await api.downloadUrl(item.id, true);
        setPreview({
          file: {
            name: item.fileName,
            mimeType: item.mimeType ?? undefined,
            url,
          },
          loading: false,
          error: null,
          id: item.id,
        });
      } catch (error) {
        const fallback = t(
          "v2.attachmentsPanel.previewError",
          "Không mở được tệp",
        );
        setPreview({
          file: null,
          loading: false,
          error: extractV2ApiError(error, fallback),
          id: item.id,
        });
      }
    },
    [api, t],
  );

  const download = React.useCallback(
    async (item: V2OwnerFile) => {
      try {
        const { url } = await api.downloadUrl(item.id);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (error) {
        const fallback = t(
          "v2.attachmentsPanel.downloadError",
          "Không tải được tệp",
        );
        toast("destructive", fallback, extractV2ApiError(error, fallback));
      }
    },
    [api, t, toast],
  );

  return {
    t,
    query,
    items: query.data?.items ?? [],
    policy: query.data?.policy ?? null,
    categories,
    activeCategory,
    setCategory,
    uploading: upload.isPending,
    onFilesSelected,
    deleteTarget,
    setDeleteTarget,
    deleting: remove.isPending,
    confirmDelete,
    preview,
    setPreview,
    openPreview,
    download,
  };
}
