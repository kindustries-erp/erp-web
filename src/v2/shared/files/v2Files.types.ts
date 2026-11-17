/** Hình dạng file đính kèm và policy do API `/api/v2/.../attachments` trả về */

export interface V2FilePolicy {
  maxFileBytes: number;
  maxFilesPerRequest: number;
  /** Đuôi cho phép, chữ thường, không dấu chấm */
  allowedExtensions: string[];
  allowedMimeTypes: string[];
}

export interface V2OwnerFile {
  id: string;
  ownerType: string;
  ownerId: string;
  category: string;
  isOriginal: boolean;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  origin: "V2" | "LEGACY";
  createdBy: string | null;
  createdAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface V2OwnerFilesResult {
  items: V2OwnerFile[];
  policy: V2FilePolicy | null;
  categories: string[];
}

export interface V2FileDownloadUrl {
  url: string;
  expiresIn: number;
}
