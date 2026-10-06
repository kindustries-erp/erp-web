import type { FileEntry } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";

export interface XmlUploadFileListProps {
  files: FileEntry[];
  onRemove: (id: string) => void;
}

export type UploadFileListProps = XmlUploadFileListProps;
