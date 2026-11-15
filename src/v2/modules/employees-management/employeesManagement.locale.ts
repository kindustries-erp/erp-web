import { registerV2ModuleLocale } from "@/v2/shared/locales";

/** Chữ hiển thị riêng của module employees-management; phần dùng chung nằm ở lõi employees */
registerV2ModuleLocale("employeesManagement", {
  vi: {
    title: "Quản lý nhân viên",
    description:
      "Hồ sơ nhân viên, chức danh, phòng ban, chi nhánh và trạng thái",
    create: "Thêm nhân viên",
    list: "Danh sách",
    empty: "Chưa có nhân viên",
  },
  en: {
    title: "Employee management",
    description: "Employee profiles, job title, department, branch and status",
    create: "Add employee",
    list: "List",
    empty: "No employees yet",
  },
});
