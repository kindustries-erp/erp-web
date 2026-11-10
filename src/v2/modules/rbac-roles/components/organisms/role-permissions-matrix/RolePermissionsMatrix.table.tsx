import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Checkbox,
} from "@/v2/shared/ui";
import { V2GroupHeader } from "@/v2/shared/components/molecules/v2-group-header";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import {
  MATRIX_COLUMNS,
  type PermissionMap,
  type ResourceItem,
} from "../../../domain/entities/permission";
import { useRolePermissionsMatrix } from "./RolePermissionsMatrix.hook";
import { RolePermissionsMatrixFooter } from "./RolePermissionsMatrixFooter";
import { RolePermissionsMatrixRow } from "./RolePermissionsMatrixRow";

interface MatrixTableProps {
  permMap: PermissionMap;
  setPermMap: React.Dispatch<React.SetStateAction<PermissionMap>>;
  resources: ResourceItem[];
  isView: boolean;
  t: (key: string, fallback?: string) => string;
}

export function RolePermissionsMatrixTable(props: MatrixTableProps) {
  const { permMap, setPermMap, resources, isView, t } = props;
  const h = useRolePermissionsMatrix(permMap, setPermMap, resources, isView, t);
  const allFull = h.isAllFull();
  const anyChecked = h.isAnyChecked();

  return (
    <div className="border border-border rounded-lg overflow-hidden flex flex-col min-h-0 bg-background">
      <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0 max-h-[calc(100vh-280px)]">
        <Table className="w-full text-xs border-collapse table-fixed">
          <TableHeader className="sticky top-0 z-20 bg-muted/90 backdrop-blur-md border-b-0 [&_tr]:border-b-0">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead
                className={`py-2.5 px-3 text-left font-semibold text-muted-foreground ${isView ? "w-[34%]" : "w-[28%]"}`}
              >
                <V2Text
                  variant="caption"
                  weight="semibold"
                  className="text-muted-foreground"
                >
                  {t("v2.rbacRoles.matrix.resource", "Tài nguyên")}
                </V2Text>
              </TableHead>
              {MATRIX_COLUMNS.map(({ action, labelKey }) => (
                <TableHead
                  key={action}
                  className={`py-2.5 px-2 text-center font-semibold text-muted-foreground ${isView ? "w-[11%]" : "w-[10%]"}`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    {!isView && (
                      <Checkbox
                        checked={h.isColumnFull(action)}
                        onCheckedChange={(v) =>
                          h.toggleColumn(action, v === true)
                        }
                      />
                    )}
                    <V2Text variant="caption" weight="medium">
                      {t(labelKey, action)}
                    </V2Text>
                  </div>
                </TableHead>
              ))}
              {!isView && (
                <TableHead
                  key="all"
                  className="py-2.5 px-2 text-center font-semibold text-muted-foreground w-[12%]"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Checkbox
                      checked={
                        anyChecked && !allFull ? "indeterminate" : allFull
                      }
                      onCheckedChange={(v) => h.toggleAll(v === true)}
                    />
                    <V2Text variant="caption" weight="medium">
                      {t("v2.rbacRoles.matrix.all", "Tất cả")}
                    </V2Text>
                  </div>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {h.groupedResources.map((grp, grpIdx) => {
              const grpFull = h.isGroupFull(grp.items);
              return (
                <React.Fragment key={grp.groupKey}>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableCell
                      colSpan={isView ? 7 : 8}
                      className={`w-full pb-1.5 px-3 bg-transparent ${grpIdx === 0 ? "pt-2" : "pt-5"}`}
                    >
                      <V2GroupHeader
                        title={grp.label}
                        count={grp.items.length}
                        variant="badge"
                        action={
                          !isView ? (
                            <V2Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => h.toggleGroup(grp.items, !grpFull)}
                              className="h-6 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            >
                              {grpFull
                                ? t(
                                    "v2.rbacRoles.matrix.deselectGroup",
                                    "Bỏ chọn nhóm",
                                  )
                                : t(
                                    "v2.rbacRoles.matrix.selectGroup",
                                    "Chọn nhóm",
                                  )}
                            </V2Button>
                          ) : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                  {grp.items.map((item) => (
                    <RolePermissionsMatrixRow
                      key={item.resource}
                      item={item}
                      actions={h.actionsOf(item.resource)}
                      isView={isView}
                      permMap={permMap}
                      isRowFull={h.isRowFull(item.resource)}
                      anyRowChecked={h
                        .actionsOf(item.resource)
                        .some((a) => Boolean(permMap[item.resource]?.[a]))}
                      onToggle={h.toggle}
                      onToggleRow={h.toggleRow}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
          <RolePermissionsMatrixFooter
            isView={isView}
            totalGrantedPermissions={h.totalGrantedPermissions}
            resourcesCount={resources.length}
            t={t}
          />
        </Table>
      </div>
    </div>
  );
}
