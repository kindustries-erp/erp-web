import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  Checkbox,
} from "@/v2/shared/ui";
import { V2GroupHeader } from "@/v2/shared/components/molecules/v2-group-header";
import {
  CRUD_ACTIONS,
  type CrudAction,
  type PermissionMap,
  type ResourceItem,
} from "../../../domain/entities/permission";
import { useRolePermissionsMatrix } from "./RolePermissionsMatrix.hook";

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
    <div className="border border-border/40 rounded-lg overflow-hidden flex flex-col min-h-0 bg-background">
      <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0 max-h-[calc(100vh-280px)]">
        <Table className="w-full text-xs border-collapse table-fixed">
          <TableHeader className="sticky top-0 z-20 bg-muted/90 backdrop-blur-md border-b-0 [&_tr]:border-b-0">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead
                className={`py-2.5 px-3 text-left font-semibold text-muted-foreground ${isView ? "w-[44%]" : "w-[40%]"}`}
              >
                {t("v2.rbacRoles.matrix.resource", "Tài nguyên")}
              </TableHead>
              {CRUD_ACTIONS.map(({ action, labelKey }) => (
                <TableHead
                  key={action}
                  className={`py-2.5 px-2 text-center font-semibold text-muted-foreground ${isView ? "w-[14%]" : "w-[12%]"}`}
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
                    <span className="font-medium text-[11px]">
                      {t(labelKey, action)}
                    </span>
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
                    <span className="font-medium text-[11px]">
                      {t("v2.rbacRoles.matrix.all", "Tất cả")}
                    </span>
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
                      colSpan={isView ? 5 : 6}
                      className={`w-full pb-1.5 px-3 bg-transparent ${grpIdx === 0 ? "pt-2" : "pt-5"}`}
                    >
                      <V2GroupHeader
                        title={grp.label}
                        count={grp.items.length}
                        variant="badge"
                        action={
                          !isView ? (
                            <button
                              type="button"
                              onClick={() => h.toggleGroup(grp.items, !grpFull)}
                              className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer px-2 py-0.5 rounded hover:bg-muted/60 transition-colors"
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
                            </button>
                          ) : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                  {grp.items.map((item) => {
                    const rowFull = h.isRowFull(item.resource);
                    const anyRowChecked = CRUD_ACTIONS.some(
                      (a) => permMap[item.resource]?.[a.action],
                    );
                    return (
                      <TableRow
                        key={item.resource}
                        className="hover:bg-muted/40 transition-colors border-none"
                      >
                        <TableCell
                          className={`py-2 px-3 text-foreground font-medium ${isView ? "w-[44%]" : "w-[40%]"}`}
                        >
                          <div className="text-xs leading-snug">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {item.resource}
                          </div>
                        </TableCell>
                        {CRUD_ACTIONS.map(({ action }) => (
                          <TableCell
                            key={action}
                            className={`py-2 px-2 text-center ${isView ? "w-[14%]" : "w-[12%]"}`}
                          >
                            <div className="flex justify-center items-center">
                              <Checkbox
                                checked={Boolean(
                                  permMap[item.resource]?.[action],
                                )}
                                disabled={isView}
                                onCheckedChange={() =>
                                  h.toggle(item.resource, action)
                                }
                              />
                            </div>
                          </TableCell>
                        ))}
                        {!isView && (
                          <TableCell className="py-2 px-2 text-center w-[12%]">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={
                                  !rowFull && anyRowChecked
                                    ? "indeterminate"
                                    : rowFull
                                }
                                onCheckedChange={(v) =>
                                  h.toggleRow(item.resource, v === true)
                                }
                              />
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </TableBody>
          <TableFooter className="sticky bottom-0 z-20 bg-muted/90 backdrop-blur-md border-t border-border font-semibold">
            <TableRow className="hover:bg-transparent">
              <TableCell className="py-2 px-3 text-xs text-muted-foreground">
                <span>
                  {t("v2.rbacRoles.matrix.totalGranted", "Tổng quyền cấp")}:
                </span>{" "}
                <span className="font-semibold text-foreground tabular-nums">
                  {h.totalGrantedPermissions}
                </span>
              </TableCell>
              <TableCell
                colSpan={isView ? 4 : 5}
                className="py-2 px-3 text-right text-xs text-muted-foreground"
              >
                <span className="tabular-nums">
                  {resources.length}{" "}
                  {t("v2.rbacRoles.matrix.resourcesCount", "tài nguyên")}
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
