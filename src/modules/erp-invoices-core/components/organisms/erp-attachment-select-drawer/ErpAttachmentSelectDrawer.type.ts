import type { ErpAttachment } from "@/modules/system/api/attachmentsApi";

export interface ErpAttachmentSelectDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (attachment: ErpAttachment) => void;
}
