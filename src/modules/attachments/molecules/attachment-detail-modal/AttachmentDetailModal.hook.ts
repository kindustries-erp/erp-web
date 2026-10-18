import { useEffect, useState } from "react";
import { getAttachmentDownloadUrlApi } from "@/modules/system/api/attachmentsApi";
import type { ErpAttachment } from "../../types/attachment.types";

export function useAttachmentPreview(item: ErpAttachment | null) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!item) {
      setPreviewUrl("");
      return;
    }
    let isMounted = true;
    setLoading(true);

    getAttachmentDownloadUrlApi(item.id, true)
      .then((res) => {
        if (isMounted) {
          setPreviewUrl(res.url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item]);

  return { previewUrl, loading };
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
