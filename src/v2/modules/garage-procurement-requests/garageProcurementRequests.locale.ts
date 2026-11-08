import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ riêng của Đề nghị mua hàng garage. Khóa: `v2.garageProcurementRequests.*` */
registerV2ModuleLocale("garageProcurementRequests", {
  vi: {
    title: "Đề nghị mua hàng Garage",
    tab: "Đề nghị mua hàng",
    create: "Tạo đề nghị",
    description: "Đề nghị mua phụ tùng, duyệt trước khi lập đơn mua",
  },
  en: {
    title: "Garage Purchase Requests",
    tab: "Purchase Requests",
    create: "New Request",
    description: "Spare-part purchase requests, approved before ordering",
  },
});
