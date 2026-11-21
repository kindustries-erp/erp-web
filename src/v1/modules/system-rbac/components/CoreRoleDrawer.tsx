import { useEffect, useState, useMemo, Fragment } from "react";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Skeleton } from "@/shared/components/Skeleton";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { MultiSelect } from "@/shared/components/MultiSelect";
import { useT } from "@/core/i18n";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/shared/components/ui/table";
import { Shield } from "lucide-react";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/modules/system/types/rbac";
import {
  CRUD_ACTIONS,
  PERMISSION_RESOURCE_GROUPS,
  type CrudAction,
  type PermissionMap,
} from "@/modules/system/types/rbac";
import type { SelectableUser } from "@/modules/system/hooks/useRoleUsers";

interface CoreRoleDrawerProps {
  open: boolean;
  mode?: "view" | "edit" | "create";
  onToggleEdit?: () => void;
  editing: Role | null;
  saving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSave: (dto: CreateRoleDto | UpdateRoleDto) => Promise<void>;
  // permissions
  initialPermMap?: PermissionMap;
  resources: { resource: string; label: string }[];
  permMap: PermissionMap;
  permLoading: boolean;
  permError: string | null;
  onToggle: (resource: string, action: CrudAction) => void;
  onToggleRow: (resource: string, value: boolean) => void;
  onToggleColumn: (action: CrudAction, value: boolean) => void;
  onToggleAll: (value: boolean) => void;
  isRowFull: (resource: string) => boolean;
  isColumnFull: (action: CrudAction) => boolean;
  isAllFull: () => boolean;
  isAnyChecked: () => boolean;
  // users
  initialSelectedUserIds?: string[];
  selectedUserIds: string[];
  onUsersChange: (ids: string[]) => void;
  allUsers: SelectableUser[];
  usersLoading: boolean;
}

export function CoreRoleDrawer({
  open,
  mode = "edit",
  onToggleEdit,
  editing,
  saving,
  saveError,
  onClose,
  onSave,
  initialPermMap,
  resources,
  permMap,
  permLoading,
  permError,
  onToggle,
  onToggleRow,
  onToggleColumn,
  onToggleAll,
  isRowFull,
  isColumnFull,
  isAllFull,
  isAnyChecked,
  initialSelectedUserIds,
  selectedUserIds,
  onUsersChange,
  allUsers,
  usersLoading,
}: CoreRoleDrawerProps) {
  const t = useT();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const isView = mode === "view";

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setDescription(editing?.description ?? "");
    }
  }, [open, editing]);

  async function handleSubmit() {
    if (isView) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSave({
      name: trimmed,
      description: description.trim() || undefined,
    });
  }

  const isFormDirty =
    name.trim() !== (editing?.name ?? "") ||
    description.trim() !== (editing?.description ?? "");

  const isPermissionsDirty = (() => {
    if (!editing) return isAnyChecked();
    if (!initialPermMap) return false;

    const allKeys = new Set([
      ...Object.keys(permMap),
      ...Object.keys(initialPermMap),
    ]);
    for (const key of allKeys) {
      const p1 = permMap[key] || {
        create: false,
        read: false,
        update: false,
        delete: false,
      };
      const p2 = initialPermMap[key] || {
        create: false,
        read: false,
        update: false,
        delete: false,
      };
      if (
        p1.create !== p2.create ||
        p1.read !== p2.read ||
        p1.update !== p2.update ||
        p1.delete !== p2.delete
      ) {
        return true;
      }
    }
    return false;
  })();

  const isUsersDirty = (() => {
    if (!editing) return selectedUserIds.length > 0;
    const initial = initialSelectedUserIds || [];
    if (selectedUserIds.length !== initial.length) return true;
    const set = new Set(initial);
    return selectedUserIds.some((id) => !set.has(id));
  })();

  const isDirty =
    !isView && (isFormDirty || isPermissionsDirty || isUsersDirty);

  const ACTION_LABEL: Record<CrudAction, string> = {
    create: t("permissionMatrix.actions.create"),
    read: t("permissionMatrix.actions.read"),
    update: t("permissionMatrix.actions.update"),
    delete: t("permissionMatrix.actions.delete"),
  };

  const allChecked = isAllFull();
  const anyChecked = isAnyChecked();

  const userOptions = allUsers.map((u) => ({
    value: u.id,
    label: u.display,
    description: u.roleName || undefined,
  }));

  // Nhóm các resources theo PERMISSION_RESOURCE_GROUPS
  const groupedResources = useMemo(() => {
    const resourceMap = new Map<string, { resource: string; label: string }>();
    resources.forEach((r) => resourceMap.set(r.resource, r));

    const matchedKeys = new Set<string>();
    const groups: {
      groupKey: string;
      label: string;
      items: { resource: string; label: string }[];
    }[] = [];

    for (const group of PERMISSION_RESOURCE_GROUPS) {
      const groupItems: { resource: string; label: string }[] = [];
      for (const resKey of group.resources) {
        const found = resourceMap.get(resKey);
        if (found) {
          groupItems.push(found);
          matchedKeys.add(resKey);
        }
      }
      if (groupItems.length > 0) {
        groups.push({
          groupKey: group.groupKey,
          label: t(group.labelKey, group.defaultLabel),
          items: groupItems,
        });
      }
    }

    const remainingItems: { resource: string; label: string }[] = [];
    for (const r of resources) {
      if (!matchedKeys.has(r.resource)) {
        remainingItems.push(r);
      }
    }

    if (remainingItems.length > 0) {
      groups.push({
        groupKey: "other",
        label: t("rbac.groups.other", "Tài nguyên khác"),
        items: remainingItems,
      });
    }

    return groups;
  }, [resources, t]);

  const toggleGroup = (
    items: { resource: string; label: string }[],
    value: boolean,
  ) => {
    if (isView) return;
    items.forEach((col) => {
      onToggleRow(col.resource, value);
    });
  };

  const isGroupFull = (items: { resource: string; label: string }[]) => {
    return items.length > 0 && items.every((col) => isRowFull(col.resource));
  };

  const drawerTitle = isView
    ? t("rbac.drawer.viewTitle")
    : editing
      ? t("rbac.drawer.editTitle")
      : t("rbac.drawer.createTitle");

  const totalGrantedPermissions = useMemo(() => {
    let count = 0;
    for (const res of Object.values(permMap)) {
      if (res.create) count++;
      if (res.read) count++;
      if (res.update) count++;
      if (res.delete) count++;
    }
    return count;
  }, [permMap]);

  return (
    <StandardFormDrawer
      open={open}
      mode={isView ? "view" : editing ? "edit" : "create"}
      onClose={onClose}
      onToggleEdit={isView ? onToggleEdit : undefined}
      icon={<Shield className="w-4 h-4 text-foreground/80" />}
      title={drawerTitle}
      subtitle={editing ? editing.name : t("rbac.drawer.createSubtitle")}
      titleExtra={
        editing ? (
          <Badge
            variant={editing.is_active ? "default" : "secondary"}
            className="font-medium text-xs shadow-none"
          >
            {editing.is_active ? t("Hoạt động") : t("Ngưng")}
          </Badge>
        ) : undefined
      }
      confirmOnClose={isDirty}
      layout="2-columns"
      size="lg"
      actions={
        isView
          ? [{ label: t("rbac.drawer.btnClose", "Đóng"), onClick: onClose }]
          : [
              {
                label: t("rbac.drawer.btnCancel", "Hủy"),
                onClick: onClose,
              },
              {
                label: t("rbac.drawer.btnSave", "Lưu"),
                onClick: handleSubmit,
                primary: true,
                disabled: !name.trim() || saving,
                loading: saving,
              },
            ]
      }
      leftPanel={
        <div className="space-y-4 pb-2">
          <DrawerSection
            title={t("rbac.drawer.sectionPermissions", "Phân quyền")}
            collapsible={false}
            fitViewportHeight
            className="mb-0"
            bodyClassName="flex-1 flex flex-col min-h-0"
          >
            {permError && (
              <div className="text-xs text-red-500 rounded-lg px-3 py-2 border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 mb-3 flex-shrink-0">
                {permError}
              </div>
            )}
            {permLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border/60 rounded-xl overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0 max-h-[calc(100vh-250px)] scrollbar-thin">
                  <Table className="w-full text-xs border-collapse">
                    <TableHeader className="sticky top-0 z-20 table-header-glass border-b border-border shadow-[0_1px_0_0_var(--border-light)]">
                      <TableRow className="hover:bg-transparent border-none bg-transparent">
                        <TableHead className="py-2.5 px-3 text-left font-semibold text-[color:var(--muted-fg)] w-full bg-transparent">
                          {t("permissionMatrix.colResource", "Resource")}
                        </TableHead>
                        {CRUD_ACTIONS.map(({ action }) => (
                          <TableHead
                            key={action}
                            className="py-2.5 px-2 text-center font-semibold text-[color:var(--muted-fg)] whitespace-nowrap min-w-[58px] w-[58px] bg-transparent"
                          >
                            <div className="flex flex-col items-center gap-1.5">
                              {!isView && (
                                <Checkbox
                                  checked={isColumnFull(action)}
                                  onCheckedChange={(v) =>
                                    onToggleColumn(action, v === true)
                                  }
                                />
                              )}
                              <span className="whitespace-nowrap font-medium text-[11px]">
                                {ACTION_LABEL[action]}
                              </span>
                            </div>
                          </TableHead>
                        ))}
                        {!isView && (
                          <TableHead className="py-2.5 px-2 text-center font-semibold text-[color:var(--muted-fg)] whitespace-nowrap min-w-[62px] w-[62px] bg-transparent">
                            <div className="flex flex-col items-center gap-1.5">
                              <Checkbox
                                checked={
                                  anyChecked && !allChecked
                                    ? "indeterminate"
                                    : allChecked
                                }
                                onCheckedChange={(v) => onToggleAll(v === true)}
                              />
                              <span className="whitespace-nowrap font-medium text-[11px]">
                                {t("rbac.drawer.colAll", "Tất cả")}
                              </span>
                            </div>
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedResources.map((group) => {
                        const grpFull = isGroupFull(group.items);

                        return (
                          <Fragment key={group.groupKey}>
                            <TableRow className="hover:bg-transparent border-none">
                              <TableCell
                                colSpan={isView ? 5 : 6}
                                className="pt-3.5 pb-1 px-3 bg-transparent"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-xs select-none">
                                    {group.label}
                                  </span>
                                  <div className="h-px bg-slate-200/80 dark:bg-slate-700/80 flex-1"></div>
                                  {!isView && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleGroup(group.items, !grpFull)
                                      }
                                      className="text-[10px] text-[color:var(--muted-fg)] hover:text-foreground transition-colors cursor-pointer px-1.5 py-0.5 whitespace-nowrap rounded hover:bg-muted/60"
                                    >
                                      {grpFull
                                        ? t(
                                            "rbac.drawer.deselectGroup",
                                            "Bỏ chọn nhóm",
                                          )
                                        : t(
                                            "rbac.drawer.selectGroup",
                                            "Chọn nhóm",
                                          )}
                                    </button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                            {group.items.map((col) => {
                              const full = isRowFull(col.resource);
                              const anyTrue = CRUD_ACTIONS.some(
                                (a) => permMap[col.resource]?.[a.action],
                              );
                              return (
                                <TableRow
                                  key={col.resource}
                                  className="hover:bg-surface-hover transition-colors border-none border-b-0"
                                >
                                  <TableCell className="py-2 px-3 text-foreground font-medium">
                                    <div className="text-xs leading-snug">
                                      {col.label}
                                    </div>
                                    <div className="text-[10px] text-[color:var(--muted-fg)] font-mono">
                                      {col.resource}
                                    </div>
                                  </TableCell>
                                  {CRUD_ACTIONS.map(({ action }) => (
                                    <TableCell
                                      key={action}
                                      className="py-2 px-2 text-center min-w-[58px] w-[58px]"
                                    >
                                      <div className="flex justify-center items-center">
                                        <Checkbox
                                          checked={
                                            !!permMap[col.resource]?.[action]
                                          }
                                          disabled={isView}
                                          onCheckedChange={() =>
                                            !isView &&
                                            onToggle(col.resource, action)
                                          }
                                        />
                                      </div>
                                    </TableCell>
                                  ))}
                                  {!isView && (
                                    <TableCell className="py-2 px-2 text-center min-w-[62px] w-[62px]">
                                      <div className="flex justify-center">
                                        <Checkbox
                                          checked={
                                            !full && anyTrue
                                              ? "indeterminate"
                                              : full
                                          }
                                          onCheckedChange={(v) =>
                                            onToggleRow(
                                              col.resource,
                                              v === true,
                                            )
                                          }
                                        />
                                      </div>
                                    </TableCell>
                                  )}
                                </TableRow>
                              );
                            })}
                          </Fragment>
                        );
                      })}
                      {resources.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={isView ? 5 : 6}
                            className="text-center py-6 text-[color:var(--muted-fg)]"
                          >
                            {t(
                              "rbac.drawer.emptyResources",
                              "Không có resource nào",
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    <TableFooter className="sticky bottom-0 z-20 table-footer-glass border-t border-border font-semibold shadow-[0_-1px_0_0_var(--border-light)]">
                      <TableRow className="hover:bg-transparent bg-transparent">
                        <TableCell className="py-2 px-3 text-xs text-muted-foreground bg-transparent">
                          <span>
                            {t("rbac.drawer.totalSelected", "Tổng quyền cấp")}:
                          </span>{" "}
                          <span className="font-semibold text-foreground tabular-nums">
                            {totalGrantedPermissions}
                          </span>
                        </TableCell>
                        <TableCell
                          colSpan={isView ? 4 : 5}
                          className="py-2 px-3 text-right text-xs text-muted-foreground bg-transparent"
                        >
                          <span className="tabular-nums">
                            {resources.length} {t("tài nguyên")}
                          </span>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>
            )}
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-4 pb-6">
          <DrawerSection
            title={t("rbac.drawer.sectionInfo")}
            collapsible
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <DrawerField label={t("rbac.headers.name")} required>
                <input
                  className={inputCls}
                  value={name}
                  disabled={isView}
                  readOnly={isView}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t(
                    "rbac.drawer.namePlaceholder",
                    "VD: Kế toán, Giám đốc...",
                  )}
                  autoFocus={!isView}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isView) handleSubmit();
                  }}
                />
              </DrawerField>
              <DrawerField label={t("rbac.headers.description")}>
                <textarea
                  className={inputCls + " resize-none"}
                  rows={3}
                  value={description}
                  disabled={isView}
                  readOnly={isView}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("rbac.drawer.descPlaceholder")}
                />
              </DrawerField>
            </div>
          </DrawerSection>

          {saveError && (
            <div className="text-xs text-red-500 rounded-lg px-3 py-2 border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              {saveError}
            </div>
          )}

          <DrawerSection
            title={t("rbac.drawer.sectionUsers", "Người dùng")}
            titleExtra={
              selectedUserIds.length > 0 ? (
                <span className="text-xs font-medium text-[color:var(--muted-fg)]">
                  {selectedUserIds.length}{" "}
                  {t("rbac.headers.users").toLowerCase()}
                </span>
              ) : undefined
            }
            collapsible
            defaultCollapsed={false}
          >
            {usersLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : isView ? (
              <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                {selectedUserIds.length > 0 ? (
                  allUsers
                    .filter((u) => selectedUserIds.includes(u.id))
                    .map((u) => (
                      <Badge
                        key={u.id}
                        variant="secondary"
                        className="px-2.5 py-0.5 text-xs font-normal bg-[color:var(--muted)]/60 text-foreground border-transparent"
                      >
                        {u.display}
                      </Badge>
                    ))
                ) : (
                  <span className="text-xs text-[color:var(--muted-fg)] italic">
                    {t(
                      "rbac.drawer.emptyUsersLabel",
                      "Chưa có người dùng nào được gán",
                    )}
                  </span>
                )}
              </div>
            ) : (
              <MultiSelect
                options={userOptions}
                value={selectedUserIds}
                onChange={onUsersChange}
                placeholder={t(
                  "rbac.drawer.selectUsersPlaceholder",
                  "Chọn người dùng...",
                )}
                searchPlaceholder={t(
                  "rbac.drawer.searchUsersPlaceholder",
                  "Tìm theo email hoặc tên...",
                )}
                emptyLabel={t(
                  "rbac.drawer.emptyUsersLabel",
                  "Không tìm thấy nhân viên nào",
                )}
              />
            )}
          </DrawerSection>
        </div>
      }
    />
  );
}
