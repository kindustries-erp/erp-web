import { registerV2ModuleLocale } from "@/v2/shared/locales";

export const financeInvoiceSyncLocale = {
  vi: {
    title: "Đồng bộ hóa đơn",
    direction: {
      label: "Chiều hóa đơn",
      in: "Hóa đơn mua vào",
      out: "Hóa đơn bán ra",
    },
    method: {
      label: "Nguồn",
      gdt: "Từ hệ thống GDT",
      xml: "Tải file từ máy tính",
    },
    conditions: {
      title: "Điều kiện đồng bộ",
    },
    progress: {
      title: "Tiến độ",
      empty: "Chưa có tiến trình",
      running: "Đang đồng bộ",
      done: "Hoàn tất",
      error: "Có lỗi",
      currentItem: "Đang xử lý",
    },
    result: {
      title: "Kết quả",
    },
    xml: {
      title: "Tải file XML",
    },
    gdt: {
      title: "Từ hệ thống GDT",
      estimate: "Ước tính {{count}} lượt quét ({{days}} ngày/lượt)",
      noCredential: "Vui lòng cấu hình tài khoản Cổng thuế trước",
      login: "Đăng nhập Cổng Thuế",
      bulkXml: "Tải lại XML",
      bulkXmlLoading: "Đang xử lý...",
      sync: "Bắt đầu đồng bộ",
      syncing: "Đang xử lý...",
    },
  },
  en: {
    title: "Sync invoices",
    direction: {
      label: "Invoice direction",
      in: "Purchase invoices",
      out: "Sales invoices",
    },
    method: {
      label: "Source",
      gdt: "From GDT system",
      xml: "Upload files from computer",
    },
    conditions: {
      title: "Sync conditions",
    },
    progress: {
      title: "Progress",
      empty: "No progress yet",
      running: "Syncing",
      done: "Completed",
      error: "Error",
      currentItem: "Processing",
    },
    result: {
      title: "Result",
    },
    xml: {
      title: "Upload XML files",
    },
    gdt: {
      title: "From GDT system",
      estimate: "Estimated {{count}} query runs ({{days}} days per run)",
      noCredential: "Please configure your GDT portal account first",
      login: "Sign in to GDT portal",
      bulkXml: "Re-download XML",
      bulkXmlLoading: "Processing...",
      sync: "Start sync",
      syncing: "Processing...",
    },
  },
};

registerV2ModuleLocale("financeInvoiceSync", financeInvoiceSyncLocale);
