import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị của module; khóa dùng dạng `v2.fileAttachments.<nhóm>.<khóa>` */
registerV2ModuleLocale("fileAttachments", {
  vi: {
    title: "Quản lý tài liệu",
    description:
      "Tệp đính kèm của mọi chứng từ; xóa vĩnh viễn các tệp đã xóa mềm",
    list: "Danh sách",
    empty: "Không có tài liệu",
    listLoadError: "Không thể tải danh sách",
    views: { overview: "Tổng quan", all: "Tất cả cột" },
    filters: { title: "Bộ lọc có sẵn", all: "Tất cả", deleted: "Đã xóa" },
    owners: { INVOICE: "Hóa đơn" },
    origins: { V2: "Hệ thống mới", LEGACY: "Dữ liệu cũ" },
    columns: {
      fileName: "Tên tệp",
      ownerType: "Đối tượng",
      category: "Loại",
      origin: "Nguồn",
      fileSize: "Dung lượng",
      createdAt: "Ngày tải lên",
      deletedAt: "Ngày xóa",
    },
    actions: {
      view: "Xem chi tiết",
      purge: "Xóa vĩnh viễn",
      purgeSelected: "Xóa vĩnh viễn ({{count}})",
      settings: "Cài đặt lưu giữ",
    },
    detail: {
      title: "Chi tiết tài liệu",
      owner: "Chứng từ sở hữu",
      createdBy: "Người tải lên",
      deletedBy: "Người xóa",
      deletedAt: "Ngày xóa",
      mimeType: "Định dạng",
      deletedHint:
        "Tệp đã xóa mềm. Xem trước vẫn dùng được cho đến khi xóa vĩnh viễn.",
    },
    purge: {
      title: "Xóa vĩnh viễn tài liệu",
      message:
        "Xóa vĩnh viễn {{count}} tệp đã chọn? Không thể hoàn tác. Tệp gốc trên kho chỉ bị xóa khi không còn nơi nào khác dùng chung.",
      done: "Đã xóa vĩnh viễn {{purged}} tệp",
      kept: "{{kept}} tệp được giữ lại trên kho vì còn nơi khác tham chiếu",
      skipped: "Bỏ qua {{skipped}} tệp",
      error: "Không thể xóa vĩnh viễn",
      reasons: {
        NOT_FOUND: "Không tìm thấy",
        NOT_SOFT_DELETED: "Chưa xóa mềm",
        STORAGE_ERROR: "Lỗi kho lưu trữ",
      },
    },
    settings: {
      title: "Cài đặt lưu giữ",
      autoPurge: "Tự động xóa vĩnh viễn tệp đã xóa mềm",
      autoPurgeHint:
        "Mặc định tắt. Chỉ ảnh hưởng tệp đã xóa mềm; xóa vĩnh viễn thủ công không bị ảnh hưởng.",
      retentionDays: "Số ngày giữ trước khi xóa",
      retentionInvalid: "Nhập số nguyên từ 1 đến 3650",
      saved: "Đã lưu cài đặt",
      saveError: "Không thể lưu cài đặt",
      loadError: "Không thể tải cài đặt",
    },
  },
  en: {
    title: "File management",
    description:
      "Attachments of all documents; permanently delete soft-deleted files",
    list: "List",
    empty: "No documents",
    listLoadError: "Unable to load the list",
    views: { overview: "Overview", all: "All columns" },
    filters: { title: "Quick filters", all: "All", deleted: "Deleted" },
    owners: { INVOICE: "Invoice" },
    origins: { V2: "New system", LEGACY: "Legacy data" },
    columns: {
      fileName: "File name",
      ownerType: "Owner",
      category: "Type",
      origin: "Source",
      fileSize: "Size",
      createdAt: "Uploaded",
      deletedAt: "Deleted",
    },
    actions: {
      view: "View details",
      purge: "Delete permanently",
      purgeSelected: "Delete permanently ({{count}})",
      settings: "Retention settings",
    },
    detail: {
      title: "Document details",
      owner: "Owning document",
      createdBy: "Uploaded by",
      deletedBy: "Deleted by",
      deletedAt: "Deleted at",
      mimeType: "Format",
      deletedHint:
        "Soft-deleted file. Preview works until it is permanently deleted.",
    },
    purge: {
      title: "Delete documents permanently",
      message:
        "Permanently delete {{count}} selected file(s)? This cannot be undone. The stored object is only removed when nothing else references it.",
      done: "{{purged}} file(s) permanently deleted",
      kept: "{{kept}} file(s) kept in storage because other records still reference them",
      skipped: "{{skipped}} file(s) skipped",
      error: "Unable to delete permanently",
      reasons: {
        NOT_FOUND: "Not found",
        NOT_SOFT_DELETED: "Not soft-deleted",
        STORAGE_ERROR: "Storage error",
      },
    },
    settings: {
      title: "Retention settings",
      autoPurge: "Automatically purge soft-deleted files",
      autoPurgeHint:
        "Off by default. Only affects soft-deleted files; manual permanent deletion is unaffected.",
      retentionDays: "Days to keep before purging",
      retentionInvalid: "Enter an integer from 1 to 3650",
      saved: "Settings saved",
      saveError: "Unable to save settings",
      loadError: "Unable to load settings",
    },
  },
});
