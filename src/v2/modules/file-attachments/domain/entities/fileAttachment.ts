export type FileAttachmentOrigin = "V2" | "LEGACY";

/** Bản ghi file ở trang quản lý (khớp `FileAttachmentResponseDto` của API) */
export interface FileAttachment {
  id: string;
  ownerType: string;
  ownerId: string;
  category: string;
  isOriginal: boolean;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  origin: FileAttachmentOrigin;
  createdBy: string | null;
  createdAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface FileAttachmentSettings {
  autoPurgeEnabled: boolean;
  retentionDays: number;
  updatedBy: string | null;
  updatedAt: string;
}

export interface PurgedItem {
  id: string;
  objectDeleted: boolean;
  objectKept: boolean;
  remainingReferences: number;
}

export interface SkippedItem {
  id: string;
  reason: "NOT_FOUND" | "NOT_SOFT_DELETED" | "STORAGE_ERROR";
}

export interface PurgeResult {
  purged: PurgedItem[];
  skipped: SkippedItem[];
}
