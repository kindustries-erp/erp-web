import * as React from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Badge, V2BadgeVariant } from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { RefreshCw, ShieldAlert } from "lucide-react";
import type {
  PermissionMap,
  ResourceItem,
} from "../../../domain/entities/permission";
import { RolePermissionsMatrixTable } from "./RolePermissionsMatrix.table";

interface MatrixProps {
  permMap: PermissionMap;
  setPermMap: React.Dispatch<React.SetStateAction<PermissionMap>>;
  resources: ResourceItem[];
  loading: boolean;
  error: string | null;
  isView: boolean;
  onReload?: () => void;
  t: (key: string, fallback?: string) => string;
}

export function RolePermissionsMatrix({
  permMap,
  setPermMap,
  resources,
  loading,
  error,
  isView,
  onReload,
  t,
}: MatrixProps) {
  const grantedCount = React.useMemo(() => {
    let c = 0;
    for (const res of Object.values(permMap)) {
      if (res?.create) c++;
      if (res?.read) c++;
      if (res?.update) c++;
      if (res?.delete) c++;
    }
    return c;
  }, [permMap]);

  return (
    <DrawerSection
      title={t("v2.rbacRoles.matrix.title", "Ma trận phân quyền & chức năng")}
      titleExtra={
        <V2Badge
          variant={V2BadgeVariant.OUTLINE}
          className="text-xs font-semibold px-2 py-0.5 border-border"
        >
          {grantedCount}{" "}
          {t("v2.rbacRoles.matrix.grantedUnit", "quyền được cấp")}
        </V2Badge>
      }
      bodyClassName="pt-1 px-1 sm:px-1.5"
    >
      {error && (
        <div className="rounded-lg px-3 py-2 border border-destructive/30 bg-destructive/10 mb-3">
          <V2Text variant="body-sm" color="destructive">
            {error}
          </V2Text>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-full bg-muted/60 animate-pulse rounded-md"
            />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-border rounded-xl bg-muted/10">
          <ShieldAlert className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <V2Text
            variant="body"
            weight="medium"
            className="mb-1 text-foreground"
          >
            {t("v2.rbacRoles.matrix.empty", "Chưa có danh sách tài nguyên")}
          </V2Text>
          <V2Text variant="body-sm" color="muted" className="mb-4 max-w-sm">
            {t(
              "v2.rbacRoles.matrix.emptyDesc",
              "Hệ thống chưa tải được danh sách tài nguyên hoặc phân quyền hệ thống.",
            )}
          </V2Text>
          {onReload && (
            <V2Button size="sm" variant="outline" onClick={onReload}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              {t("v2.rbacRoles.matrix.reload", "Tải lại dữ liệu")}
            </V2Button>
          )}
        </div>
      ) : (
        <RolePermissionsMatrixTable
          permMap={permMap}
          setPermMap={setPermMap}
          resources={resources}
          isView={isView}
          t={t}
        />
      )}
    </DrawerSection>
  );
}
