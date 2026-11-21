import {
  DrawerSection,
  V2DrawerRowList,
  type DrawerRowConfig,
} from "@/v2/shared/components";
import type { UserFormValue } from "../../../domain/user";
import { UserStatusBadge } from "../../molecules/user-status-badge";

export interface UserFormViewProps {
  form: UserFormValue;
  /** Nhãn nhân viên đang liên kết (đã tra từ danh sách chọn hoặc nhãn dự phòng) */
  employeeLabel?: string;
  t: (key: string, fallback?: string) => string;
}

/** Chế độ xem tài khoản: hiển thị nhãn - giá trị, không render ô nhập. */
export function UserFormView({ form, employeeLabel, t }: UserFormViewProps) {
  const accountRows: DrawerRowConfig[] = [
    {
      key: "email",
      label: t("v2.users.columns.email", "Email"),
      value: form.email || "—",
      copyable: Boolean(form.email),
    },
  ];
  const linkRows: DrawerRowConfig[] = [
    {
      key: "employee",
      label: t("v2.users.columns.employee", "Nhân viên"),
      value: employeeLabel || "—",
    },
    {
      key: "status",
      label: t("v2.users.columns.status", "Trạng thái"),
      value: <UserStatusBadge status={form.status} />,
    },
  ];

  return (
    <div className="space-y-3">
      <DrawerSection title={t("v2.users.form.account", "Tài khoản")}>
        <V2DrawerRowList rows={accountRows} />
      </DrawerSection>
      <DrawerSection title={t("v2.users.form.link", "Liên kết & trạng thái")}>
        <V2DrawerRowList rows={linkRows} />
      </DrawerSection>
    </div>
  );
}
