import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2HasPermission } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { PermissionGuardProps } from "./PermissionGuard.type";

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback,
  children,
}) => {
  const allowed = useV2HasPermission(permission);
  const { t } = useV2Translation();

  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;

  return (
    <div role="alert" className="mx-auto max-w-md space-y-1 py-12 text-center">
      <V2Text as="h2" variant="h3" weight="bold">
        {t("v2.guard.forbidden")}
      </V2Text>
      <V2Text variant="body-sm" color="muted">
        {t("v2.guard.forbiddenHint")}
      </V2Text>
    </div>
  );
};
PermissionGuard.displayName = "PermissionGuard";
