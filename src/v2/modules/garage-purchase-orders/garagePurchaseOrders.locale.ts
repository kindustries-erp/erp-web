import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị riêng của Đơn mua hàng Garage; phần dùng chung nằm ở `v2.purchaseOrders.*` (core) */
registerV2ModuleLocale("garagePurchaseOrders", {
  vi: {
    title: "Đơn mua hàng Garage",
    description: "Quản lý đơn mua phụ tùng cho garage",
    create: "Tạo đơn mua hàng",
  },
  en: {
    title: "Garage Purchase Orders",
    description: "Manage garage spare parts purchase orders",
    create: "Create Purchase Order",
  },
});
