import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị riêng của module business-partners-customers; phần dùng chung nằm ở lõi business-partners */
registerV2ModuleLocale("businessPartnersCustomers", {
  vi: {
    title: "Khách hàng",
    description: "Khách hàng",
    create: "Thêm Khách hàng",
    list: "Danh sách",
    empty: "Chưa có dữ liệu",
    deleteTitle: "Xác nhận xóa",
    deleteMessage: "Bạn có chắc muốn xóa?",
    deleteLabel: "Xóa",
  },
  en: {
    title: "Customers",
    description: "Customers",
    create: "Add Customers",
    list: "List",
    empty: "No data yet",
    deleteTitle: "Confirm deletion",
    deleteMessage: "Are you sure you want to delete?",
    deleteLabel: "Delete",
  },
});
