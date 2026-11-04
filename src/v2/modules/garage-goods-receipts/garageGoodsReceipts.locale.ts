import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị riêng của Nhập kho Garage; phần dùng chung nằm ở `v2.goodsReceipts.*` (core) */
registerV2ModuleLocale("garageGoodsReceipts", {
  vi: {
    title: "Nhập kho Garage",
    description: "Quản lý phiếu nhập kho phụ tùng cho garage",
    create: "Tạo phiếu nhập kho",
  },
  en: {
    title: "Garage Goods Receipts",
    description: "Manage garage spare parts goods receipts",
    create: "Create Goods Receipt",
  },
});
