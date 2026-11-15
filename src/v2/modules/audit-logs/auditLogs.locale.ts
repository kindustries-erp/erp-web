import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị riêng của module audit-logs; phần dùng chung nằm ở lõi audit */
registerV2ModuleLocale("auditLogs", {
  vi: {
    title: "Nhật ký hoạt động",
    description: "Theo dõi thao tác của người dùng trên hệ thống",
    list: "Danh sách",
    empty: "Chưa có nhật ký",
  },
  en: {
    title: "Activity logs",
    description: "Track user actions across the system",
    list: "List",
    empty: "No logs yet",
  },
});
