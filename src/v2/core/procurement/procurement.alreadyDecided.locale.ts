import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị của modal "chứng từ đã được xử lý". Khóa: `v2.procurementAlreadyDecided.*` */
registerV2ModuleLocale("procurementAlreadyDecided", {
  vi: {
    title: "Chứng từ đã được xử lý",
    message:
      "Chứng từ này đã được xử lý trước đó, không thể duyệt lại. Vui lòng kiểm tra lại trạng thái trên danh sách.",
    currentStatus: "Trạng thái hiện tại",
    acknowledge: "Đã hiểu",
  },
  en: {
    title: "Document already processed",
    message:
      "This document was already processed and cannot be approved again. Please check its current status in the list.",
    currentStatus: "Current status",
    acknowledge: "Got it",
  },
});
