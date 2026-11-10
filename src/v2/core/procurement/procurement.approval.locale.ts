import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị của khóa duyệt và chọn người duyệt. Khóa: `v2.procurementApproval.*` */
registerV2ModuleLocale("procurementApproval", {
  vi: {
    approver: "Người duyệt",
    selectApprover: "Chọn người duyệt",
    submitTitle: "Gửi duyệt",
  },
  en: {
    approver: "Approver",
    selectApprover: "Select approver",
    submitTitle: "Submit for approval",
  },
});
