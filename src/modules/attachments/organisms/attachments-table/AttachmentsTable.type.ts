import type { ErpAttachment } from "../../types/attachment.types";

export interface AttachmentsTableProps {
  onSelectAttachment: (attachment: ErpAttachment) => void;
  onOpenInvoiceDetail?: (invoiceId: string) => void;
  className?: string;
}

export type SortOrder = "asc" | "desc" | "none";
