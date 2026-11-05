import * as React from "react";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { Badge } from "@/v2/shared/ui";
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
        <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
          {grantedCount}{" "}
          {t("v2.rbacRoles.matrix.grantedUnit", "quyền được cấp")}
        </Badge>
      }
      bodyClassName="pt-1 px-1 sm:px-1.5"
    >
      {error && (
        <div className="text-xs text-destructive rounded-lg px-3 py-2 border border-destructive/30 bg-destructive/10 mb-3">
          {error}
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
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-border/70 rounded-xl bg-muted/10">
          <ShieldAlert className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium text-foreground mb-1">
            {t("v2.rbacRoles.matrix.empty", "Chưa có danh sách tài nguyên")}
          </p>
          <p className="text-xs text-muted-foreground mb-4 max-w-sm">
            {t(
              "v2.rbacRoles.matrix.emptyDesc",
              "Hệ thống chưa tải được danh sách tài nguyên hoặc phân quyền hệ thống.",
            )}
          </p>
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
