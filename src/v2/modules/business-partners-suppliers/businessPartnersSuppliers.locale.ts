import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị riêng của module business-partners-suppliers; phần dùng chung nằm ở lõi business-partners */
registerV2ModuleLocale("businessPartnersSuppliers", {
  vi: {
    title: "Nhà cung cấp",
    description: "Quản lý hồ sơ nhà cung cấp và thông tin liên hệ",
    create: "Thêm nhà cung cấp",
    syncButton: "Đồng bộ từ hóa đơn",
    list: "Danh sách",
    empty: "Chưa có dữ liệu nhà cung cấp",
    deleteTitle: "Xác nhận xóa",
    deleteMessage: "Bạn có chắc muốn xóa nhà cung cấp này?",
    deleteLabel: "Xóa",
  },
  en: {
    title: "Suppliers",
    description: "Manage supplier profiles and contact details",
    create: "Add supplier",
    syncButton: "Sync from invoices",
    list: "List",
    empty: "No supplier data yet",
    deleteTitle: "Confirm deletion",
    deleteMessage: "Are you sure you want to delete this supplier?",
    deleteLabel: "Delete",
  },
});
