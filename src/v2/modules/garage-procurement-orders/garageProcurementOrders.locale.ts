import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ riêng của Đơn mua hàng garage. Khóa: `v2.garageProcurementOrders.*` */
registerV2ModuleLocale("garageProcurementOrders", {
  vi: {
    title: "Đơn mua hàng Garage",
    description: "Đơn mua phụ tùng cho garage, nhận hàng qua phiếu nhập kho",
  },
  en: {
    title: "Garage Purchase Orders",
    description: "Garage spare-part orders, received through goods receipts",
  },
});
