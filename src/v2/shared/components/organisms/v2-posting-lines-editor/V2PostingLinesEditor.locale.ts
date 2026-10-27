import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Nhãn editor dòng hạch toán, đăng ký dưới namespace `v2.postingLines.*` */
registerV2ModuleLocale("postingLines", {
  vi: {
    addLine: "Thêm dòng",
    removeLine: "Xóa dòng",
    account: "Tài khoản",
    accountPlaceholder: "Chọn tài khoản",
    debit: "Nợ",
    credit: "Có",
    description: "Diễn giải dòng",
    totalDebit: "Tổng Nợ",
    totalCredit: "Tổng Có",
    balanced: "Đã cân bằng",
    unbalanced: "Chưa cân bằng",
    empty: "Chưa có dòng hạch toán",
  },
  en: {
    addLine: "Add line",
    removeLine: "Remove line",
    account: "Account",
    accountPlaceholder: "Select account",
    debit: "Debit",
    credit: "Credit",
    description: "Line description",
    totalDebit: "Total debit",
    totalCredit: "Total credit",
    balanced: "Balanced",
    unbalanced: "Not balanced",
    empty: "No posting lines yet",
  },
});
