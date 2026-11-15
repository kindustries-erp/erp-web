import { V2Text } from "@/v2/shared/components";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { auditLogsConfig } from "../auditLogs.config";
import { AuditLogsPage } from "./AuditLogsPage";

/** Trang Nhật ký hoạt động kèm cổng quyền `admin_users:read`; không đủ quyền thì không gọi API. */
export function AuditLogsGuarded() {
  const allowed = useV2HasPermission({
    collection: auditLogsConfig.permissionCollection,
    action: "read",
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
  return <AuditLogsPage />;
}
