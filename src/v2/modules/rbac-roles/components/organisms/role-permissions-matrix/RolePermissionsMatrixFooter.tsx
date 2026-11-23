import * as React from "react";
import { TableFooter, TableRow, TableCell } from "@/v2/shared/ui";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";

interface RolePermissionsMatrixFooterProps {
  isView: boolean;
  totalGrantedPermissions: number;
  resourcesCount: number;
  t: (key: string, fallback?: string) => string;
}

export const RolePermissionsMatrixFooter: React.FC<
  RolePermissionsMatrixFooterProps
> = ({ isView, totalGrantedPermissions, resourcesCount, t }) => {
  return (
    <TableFooter className="sticky bottom-0 z-20 bg-muted/90 backdrop-blur-md border-t border-border font-semibold">
      <TableRow className="hover:bg-transparent">
        <TableCell className="py-2 px-3">
          <div className="flex items-center gap-1.5">
            <V2Text variant="body-sm" color="muted">
              {t("v2.rbacRoles.matrix.totalGranted", "Tổng quyền cấp")}:
            </V2Text>
            <V2Text
              variant="numeric"
              weight="semibold"
              className="text-foreground"
            >
              {totalGrantedPermissions}
            </V2Text>
          </div>
        </TableCell>
        <TableCell colSpan={isView ? 4 : 5} className="py-2 px-3 text-right">
          <V2Text variant="body-sm" color="muted">
            <span className="tabular-nums">{resourcesCount}</span>{" "}
            {t("v2.rbacRoles.matrix.resourcesCount", "tài nguyên")}
          </V2Text>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
};
