import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ riêng của chứng từ kho và tồn kho Garage; phần dùng chung ở `v2.inventoryMovements.*` (core) */
registerV2ModuleLocale("garageStockVouchers", {
  vi: {
    title: "Chứng từ kho Garage",
    description: "Theo dõi phiếu nhập, xuất và điều chỉnh kho của garage",
    create: "Nhập mua hàng",
    types: {
      purchaseReceipt: "Nhập mua hàng",
      otherReceipt: "Nhập khác",
      issue: "Xuất kho",
      adjustment: "Điều chỉnh",
    },
  },
  en: {
    title: "Garage Stock Vouchers",
    description: "Track garage goods receipts, issues and adjustments",
    create: "Purchase receipt",
    types: {
      purchaseReceipt: "Purchase receipt",
      otherReceipt: "Other receipt",
      issue: "Issue",
      adjustment: "Adjustment",
    },
  },
});

registerV2ModuleLocale("garageStockBalances", {
  vi: {
    title: "Tồn kho Garage",
    description: "Số dư tồn theo mã hàng và thẻ kho",
  },
  en: {
    title: "Garage Stock",
    description: "Stock on hand by item and stock card",
  },
});
