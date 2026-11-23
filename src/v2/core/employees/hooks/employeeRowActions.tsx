import { Eye, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import type { EmployeeRecord } from "../domain/employee";
import {
  canDeleteEmployee,
  isEmployeeInactive,
} from "../domain/rules/employeeRules";

export interface EmployeeRowActionContext {
  t: (key: string, fallback?: string) => string;
  canUpdate: boolean;
  canDelete: boolean;
  onOpen: (id: string, mode: "view" | "edit") => void;
  onToggleStatus: (row: EmployeeRecord) => void;
  onDelete: (row: EmployeeRecord) => void;
}

/** Hành động trên mỗi dòng, ẩn theo quyền từng hành động và theo liên kết tài khoản */
export const buildEmployeeRowActions = (
  row: EmployeeRecord,
  {
    t,
    canUpdate,
    canDelete,
    onOpen,
    onToggleStatus,
    onDelete,
  }: EmployeeRowActionContext,
): V2RowActionGroup[] => {
  const items: V2RowActionGroup["items"] = [
    {
      label: t("v2.employees.actions.view", "Xem chi tiết"),
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: () => onOpen(row.id, "view"),
    },
  ];
  if (canUpdate) {
    const inactive = isEmployeeInactive(row.status);
    items.push(
      {
        label: t("v2.employees.actions.edit", "Chỉnh sửa"),
        icon: <Pencil className="h-3.5 w-3.5" />,
        onClick: () => onOpen(row.id, "edit"),
      },
      {
        label: inactive
          ? t("v2.employees.actions.activate", "Chuyển sang đang làm")
          : t("v2.employees.actions.deactivate", "Chuyển sang nghỉ việc"),
        icon: inactive ? (
          <Power className="h-3.5 w-3.5" />
        ) : (
          <PowerOff className="h-3.5 w-3.5" />
        ),
        variant: inactive ? undefined : "danger",
        onClick: () => onToggleStatus(row),
      },
    );
  }
  // Còn liên kết tài khoản thì ẩn nút xóa (backend cũng chặn bằng 409)
  if (canDelete && canDeleteEmployee(row)) {
    items.push({
      label: t("v2.employees.actions.delete", "Xóa"),
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: "danger",
      onClick: () => onDelete(row),
    });
  }
  return [{ items }];
};
