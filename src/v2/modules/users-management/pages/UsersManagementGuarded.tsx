import { V2Text } from "@/v2/shared/components";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { usersManagementConfig } from "../usersManagement.config";
import { UsersManagementPage } from "./UsersManagementPage";

/**
 * Trang Quản lý tài khoản kèm cổng quyền `admin_users:manage`, dùng khi mount ngoài router `/v2/*`
 * (shell V1 không có `PermissionGuard`). Không đủ quyền thì không render trang nên không gọi API.
 */
export function UsersManagementGuarded() {
  const allowed = useV2HasPermission({
    collection: usersManagementConfig.permissionCollection,
    action: "manage",
  });
  const { t } = useV2Translation();

  if (!allowed) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-md space-y-1 py-12 text-center"
      >
        <V2Text as="h2" variant="h3" weight="bold">
          {t("v2.guard.forbidden")}
        </V2Text>
        <V2Text variant="body-sm" color="muted">
          {t("v2.guard.forbiddenHint")}
        </V2Text>
      </div>
    );
  }
  return <UsersManagementPage />;
}
