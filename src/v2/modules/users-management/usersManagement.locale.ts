import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị riêng của module users-management; phần dùng chung nằm ở lõi users */
registerV2ModuleLocale("usersManagement", {
  vi: {
    title: "Quản lý tài khoản",
    description:
      "Quản lý tài khoản đăng nhập, liên kết nhân viên và trạng thái",
    create: "Thêm tài khoản",
    list: "Danh sách",
    empty: "Chưa có tài khoản",
  },
  en: {
    title: "User management",
    description: "Manage sign-in accounts, employee links and status",
    create: "Add account",
    list: "List",
    empty: "No accounts yet",
  },
});
