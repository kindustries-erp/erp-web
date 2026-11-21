import * as React from "react";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import { usePurgeFileAttachmentsMutation } from "../api/mutations/useFileAttachmentMutations";
import type { PurgeResult } from "../domain/entities/fileAttachment";

type T = (
  key: string,
  options?: string | { defaultValue?: string; [k: string]: unknown },
) => string;

/** Tóm tắt kết quả xóa vĩnh viễn: số đã xóa, số object được giữ lại, số bị bỏ qua kèm lý do */
export function summarizePurge(t: T, result: PurgeResult) {
  const kept = result.purged.filter((p) => p.objectKept).length;
  const title = t("v2.fileAttachments.purge.done", {
    defaultValue: "Đã xóa vĩnh viễn {{purged}} tệp",
    purged: result.purged.length,
  });
  const lines: string[] = [];
  if (kept)
    lines.push(
      t("v2.fileAttachments.purge.kept", {
        defaultValue: "{{kept}} tệp được giữ lại",
        kept,
      }),
    );
  if (result.skipped.length) {
    const reasons = [
      ...new Set(
        result.skipped.map((s) =>
          t(`v2.fileAttachments.purge.reasons.${s.reason}`, s.reason),
        ),
      ),
    ].join(", ");
    const skipped = t("v2.fileAttachments.purge.skipped", {
      defaultValue: "Bỏ qua {{skipped}} tệp",
      skipped: result.skipped.length,
    });
    lines.push(`${skipped} (${reasons})`);
  }
  return {
    title,
    description: lines.join(" · ") || undefined,
    hasSkipped: result.skipped.length > 0,
  };
}

/** Luồng xóa vĩnh viễn: id đang chờ xác nhận, gọi API, báo kết quả */
export function usePurgeFlow(t: T, onDone: () => void) {
  const purge = usePurgeFileAttachmentsMutation();
  const [purgeIds, setPurgeIds] = React.useState<string[] | null>(null);
  const toast = useV2ToastStore.getState().showToast;

  const confirmPurge = () => {
    if (!purgeIds) return;
    purge.mutate(purgeIds, {
      onSuccess: (result) => {
        const sum = summarizePurge(t, result);
        toast({
          variant: sum.hasSkipped ? "warning" : "success",
          title: sum.title,
          description: sum.description,
        });
        setPurgeIds(null);
        onDone();
      },
      onError: (error) => {
        const fallback = t(
          "v2.fileAttachments.purge.error",
          "Không thể xóa vĩnh viễn",
        );
        toast({
          variant: "destructive",
          title: fallback,
          description: extractV2ApiError(error, fallback),
        });
      },
    });
  };

  return { purgeIds, setPurgeIds, confirmPurge, purging: purge.isPending };
}
