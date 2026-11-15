import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ riêng của Đơn mua hàng garage. Khóa: `v2.garageProcurementOrders.*` */
registerV2ModuleLocale("garageProcurementOrders", {
  vi: {
    title: "Đơn mua hàng Garage",
    tab: "Đơn mua hàng",
    create: "Tạo đơn mua",
    actionCreate: "Tạo đơn mua hàng",
    description:
      "Đơn mua phụ tùng cho garage. Phát hành đơn (gửi nhà cung cấp) trước, rồi bấm Nhập kho để lập phiếu nhập từ đơn.",
  },
  en: {
    title: "Garage Purchase Orders",
    tab: "Purchase Orders",
    create: "New Order",
    actionCreate: "Create Purchase Order",
    description:
      "Garage spare-part orders. Issue the order to the supplier first, then choose Receive goods to create a goods receipt from it.",
  },
});
