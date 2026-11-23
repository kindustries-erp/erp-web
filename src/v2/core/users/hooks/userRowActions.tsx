import { Eye, KeyRound, LogIn, Pencil, Power, PowerOff } from "lucide-react";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import type { UserRecord } from "../domain/user";
import { canImpersonateUser, isUserInactive } from "../domain/rules/userRules";

export interface UserRowActionContext {
  t: (key: string, fallback?: string) => string;
  canManage: boolean;
  /** Người dùng hiện tại được phép đăng nhập dưới quyền người khác */
  canImpersonate: boolean;
  onOpen: (id: string, mode: "view" | "edit") => void;
  onToggleStatus: (row: UserRecord) => void;
  onResetPassword: (row: UserRecord) => void;
  onImpersonate: (row: UserRecord) => void;
}

/** Hành động trên mỗi dòng tài khoản; ẩn theo quyền và theo trạng thái tài khoản */
export const buildUserRowActions = (
  row: UserRecord,
  {
    t,
    canManage,
    canImpersonate,
    onOpen,
    onToggleStatus,
    onResetPassword,
    onImpersonate,
  }: UserRowActionContext,
): V2RowActionGroup[] => {
  const items: V2RowActionGroup["items"] = [
    {
      label: t("v2.users.actions.view", "Xem chi tiết"),
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: () => onOpen(row.id, "view"),
    },
  ];
  if (canManage) {
    const inactive = isUserInactive(row.status);
    items.push(
      {
        label: t("v2.users.actions.edit", "Chỉnh sửa"),
        icon: <Pencil className="h-3.5 w-3.5" />,
        onClick: () => onOpen(row.id, "edit"),
      },
      {
        label: t("v2.users.actions.resetPassword", "Đặt lại mật khẩu"),
        icon: <KeyRound className="h-3.5 w-3.5" />,
        onClick: () => onResetPassword(row),
      },
    );
    if (canImpersonateUser(canImpersonate, row)) {
      items.push({
        label: t("v2.users.actions.impersonate", "Đăng nhập dưới quyền"),
        icon: <LogIn className="h-3.5 w-3.5" />,
        onClick: () => onImpersonate(row),
      });
    }
    items.push({
      label: inactive
        ? t("v2.users.actions.activate", "Kích hoạt")
        : t("v2.users.actions.deactivate", "Ngưng hoạt động"),
      icon: inactive ? (
        <Power className="h-3.5 w-3.5" />
      ) : (
        <PowerOff className="h-3.5 w-3.5" />
      ),
      variant: inactive ? undefined : "danger",
      onClick: () => onToggleStatus(row),
    });
  }
  return [{ items }];
};
