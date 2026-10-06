import type { ErpAttachment } from "../../types/attachment.types";

export interface AttachmentDetailModalProps {
  item: ErpAttachment | null;
  onClose: () => void;
  onOpenFile?: () => void;
}
