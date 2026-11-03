import { registerV2ModuleLocale } from "@/v2/shared/locales";

export const financeInvoiceSyncLocale = {
  vi: {
    title: "Đồng bộ hóa đơn",
    conditions: {
      title: "Điều kiện đồng bộ",
    },
    source: {
      label: "Nguồn",
      gdt: "Từ hệ thống",
      xml: "Tải file lên",
    },
    direction: {
      label: "Chiều hóa đơn",
      in: "Mua vào",
      out: "Bán ra",
    },
    period: {
      label: "Kỳ đồng bộ",
    },
    credential: {
      configured: "Đã cấu hình tài khoản Cổng thuế",
      notConfigured: "Chưa cấu hình tài khoản Cổng thuế",
      login: "Đăng nhập Cổng Thuế",
      changeAccount: "Đổi tài khoản",
    },
    gdt: {
      estimate: "Ước tính {{count}} lượt quét ({{days}} ngày/lượt)",
      sync: "Bắt đầu đồng bộ",
      syncing: "Đang xử lý...",
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
  },
  en: {
    title: "Sync invoices",
    conditions: {
      title: "Sync conditions",
    },
    source: {
      label: "Source",
      gdt: "From system",
      xml: "Upload file",
    },
    direction: {
      label: "Invoice direction",
      in: "Purchase",
      out: "Sales",
    },
    period: {
      label: "Sync period",
    },
    credential: {
      configured: "Tax portal account is configured",
      notConfigured: "Tax portal account is not configured",
      login: "Sign in to tax portal",
      changeAccount: "Change account",
    },
    gdt: {
      estimate: "Estimated {{count}} query runs ({{days}} days per run)",
      sync: "Start sync",
      syncing: "Processing...",
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
  },
};

registerV2ModuleLocale("financeInvoiceSync", financeInvoiceSyncLocale);
