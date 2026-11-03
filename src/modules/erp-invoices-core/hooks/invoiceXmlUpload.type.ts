export type Step = "select" | "importing" | "result";
export type Direction = "IN" | "OUT";

export interface FileEntry {
  file: File;
  id: string;
  type: "xml" | "pdf" | "zip";
  pairedPdf?: string; // Tên của file PDF (nếu đã ghép được)
}

export type FilePreviewStatus = "new-invoice" | "attach-pdf" | "extract-zip";
