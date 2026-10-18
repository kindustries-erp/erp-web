export interface InvoiceFileUploadSectionProps {
  uploadType: string;
  onUploadTypeChange: (type: string) => void;
  onFilesAdded: (files: File[]) => void;
  isUploading?: boolean;
}
