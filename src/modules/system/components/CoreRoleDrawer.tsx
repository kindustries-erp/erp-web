import { useEffect, useState } from "react";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Skeleton } from "@/shared/components/Skeleton";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { MultiSelect } from "@/shared/components/MultiSelect";
import { useT } from "@/core/i18n";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/modules/system/types/rbac";
import {
  CRUD_ACTIONS,
  type CrudAction,
  type PermissionMap,
} from "@/modules/system/types/rbac";
import type { SelectableUser } from "@/modules/system/hooks/useRoleUsers";

const IconShield = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

interface CoreRoleDrawerProps {
  open: boolean;
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

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setDescription(editing?.description ?? "");
    }
  }, [open, editing]);

  async function handleSubmit() {
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

  const isDirty = isFormDirty || isPermissionsDirty || isUsersDirty;

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

  return (
    <StandardFormDrawer
      open={open}
      mode={editing ? "edit" : "create"}
      onClose={onClose}
      icon={<IconShield />}
      title={
        editing ? t("rbac.drawer.editTitle") : t("rbac.drawer.createTitle")
      }
      subtitle={editing ? editing.name : t("rbac.drawer.createSubtitle")}
      confirmOnClose={isDirty}
      layout="1-column"
      size="md"
      actions={[
        { label: "Hủy", onClick: onClose },
        {
          label: "Lưu",
          onClick: handleSubmit,
          primary: true,
          disabled: !name.trim() || saving,
          loading: saving,
        },
      ]}
      leftPanel={
        <>
          <DrawerSection title={t("rbac.drawer.sectionInfo")}>
            <DrawerField label={t("rbac.headers.name")} required>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Kế toán, Giám đốc..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </DrawerField>
            <DrawerField label="Mô tả">
              <textarea
                className={inputCls + " resize-none"}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("rbac.drawer.descPlaceholder")}
              />
            </DrawerField>
          </DrawerSection>

          {saveError && (
            <div className="text-xs text-red-500 rounded-lg px-3 py-2 border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 mb-4">
              {saveError}
            </div>
          )}

          <DrawerSection title="Người dùng">
            {usersLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <MultiSelect
                options={userOptions}
                value={selectedUserIds}
                onChange={onUsersChange}
                placeholder="Chọn người dùng..."
                searchPlaceholder="Tìm theo email hoặc tên..."
                emptyLabel="Không tìm thấy nhân viên nào"
              />
            )}
          </DrawerSection>

          <DrawerSection title="Phân quyền">
            {permError && (
              <div className="text-xs text-red-500 rounded-lg px-3 py-2 border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 mb-3">
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
              <div className="overflow-x-auto min-w-0">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[color:var(--border)]">
                      <th className="text-left py-2 pr-3 font-semibold text-[color:var(--muted-fg)] w-full">
                        Resource
                      </th>
                      {CRUD_ACTIONS.map(({ action }) => (
                        <th
                          key={action}
                          className="py-2 px-3 text-center font-semibold text-[color:var(--muted-fg)] whitespace-nowrap min-w-[56px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Checkbox
                              checked={isColumnFull(action)}
                              onCheckedChange={(v) =>
                                onToggleColumn(action, v === true)
                              }
                            />
                            <span>{ACTION_LABEL[action]}</span>
                          </div>
                        </th>
                      ))}
                      <th className="py-2 px-2 text-center font-semibold text-[color:var(--muted-fg)] min-w-[48px]">
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={
                              anyChecked && !allChecked
                                ? "indeterminate"
                                : allChecked
                            }
                            onCheckedChange={(v) => onToggleAll(v === true)}
                          />
                          <span>{t("permissionMatrix.colAll")}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((col) => {
                      const full = isRowFull(col.resource);
                      const anyTrue = CRUD_ACTIONS.some(
                        (a) => permMap[col.resource]?.[a.action],
                      );
                      return (
                        <tr
                          key={col.resource}
                          className="border-b border-[color:var(--border-light)] hover:bg-[color:var(--muted)]/40 transition-colors"
                        >
                          <td className="py-[7px] pr-3 text-foreground font-medium">
                            {col.label}
                            <div className="text-[10px] text-[color:var(--muted-fg)]">
                              {col.resource}
                            </div>
                          </td>
                          {CRUD_ACTIONS.map(({ action }) => (
                            <td
                              key={action}
                              className="py-[7px] px-3 text-center"
                            >
                              <div className="flex justify-center items-center gap-1">
                                <Checkbox
                                  checked={!!permMap[col.resource]?.[action]}
                                  onCheckedChange={() =>
                                    onToggle(col.resource, action)
                                  }
                                />
                              </div>
                            </td>
                          ))}
                          <td className="py-[7px] px-2 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={
                                  !full && anyTrue ? "indeterminate" : full
                                }
                                onCheckedChange={(v) =>
                                  onToggleRow(col.resource, v === true)
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {resources.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-4 text-[color:var(--muted-fg)]"
                        >
                          Không có resource nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </DrawerSection>
        </>
      }
    />
  );
}
