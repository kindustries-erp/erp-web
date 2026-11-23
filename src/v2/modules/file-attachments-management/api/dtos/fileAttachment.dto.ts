import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";
import type {
  FileAttachment,
  FileAttachmentSettings,
  PurgeResult,
} from "../../domain/entities/fileAttachment";

/** Hình dạng response của `/api/v2/file-attachments-management` (khớp backend, không phụ thuộc V1) */
export interface FileAttachmentListResultDto {
  items: FileAttachment[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  summaries?: Record<string, V2SummaryMetric | null>;
}

export interface ColumnOptionsResultDto {
  items: { label: string; value: string }[];
  pagination?: { next: number | null };
}

export interface FileAttachmentEnvelopeDto {
  message: string;
  data: FileAttachment;
}
export interface SettingsEnvelopeDto {
  message?: string;
  data: FileAttachmentSettings;
}
export interface PurgeEnvelopeDto {
  message: string;
  data: PurgeResult;
}
export interface DownloadUrlEnvelopeDto {
  data: { url: string; expiresIn: number };
}
