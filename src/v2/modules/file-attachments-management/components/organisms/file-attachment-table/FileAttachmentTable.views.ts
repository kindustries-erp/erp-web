/** Chế độ xem hệ thống: cột hiển thị cho từng view */
export const fileAttachmentsViewVisibility = {
  overview: {
    fileName: true,
    ownerType: true,
    category: true,
    origin: false,
    fileSize: true,
    createdAt: true,
    deletedAt: false,
  },
  all: {
    fileName: true,
    ownerType: true,
    category: true,
    origin: true,
    fileSize: true,
    createdAt: true,
    deletedAt: true,
  },
} as const;
