import { useEffect, useState } from "react";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import {
  V2FilePreviewPanel,
  type V2FilePreviewFile,
} from "@/v2/shared/components/organisms/v2-file-preview-panel";

const TEXT_FILE = /\.(xml|txt|json|csv|log)$/i;

export interface XmlFilePreviewModalProps {
  file: File | null;
  onClose: () => void;
}

/** Xem trước một file tải lên (XML/văn bản đọc thành chữ, PDF/ảnh qua object URL), dùng chung cho danh sách file và modal import */
export function XmlFilePreviewModal({
  file,
  onClose,
}: XmlFilePreviewModalProps) {
  const [preview, setPreview] = useState<V2FilePreviewFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      setError(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | undefined;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (TEXT_FILE.test(file.name)) {
          const text = await file.text();
          if (!cancelled) setPreview({ name: file.name, text });
          return;
        }
        if (typeof URL.createObjectURL !== "function") {
          throw new Error("Trình duyệt không hỗ trợ xem trước file này");
        }
        objectUrl = URL.createObjectURL(file);
        if (!cancelled) {
          setPreview({ name: file.name, mimeType: file.type, url: objectUrl });
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <V2Modal
      open={!!file}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      size="xl"
      title={file?.name}
    >
      <V2FilePreviewPanel
        file={preview}
        loading={loading}
        error={error}
        height="70vh"
      />
    </V2Modal>
  );
}
