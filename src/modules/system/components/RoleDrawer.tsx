import { useEffect, useMemo, useState } from "react";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
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
  RBAC_COLLECTIONS,
  CRUD_ACTIONS,
  type CrudAction,
  type PermissionConfig,
  type PermissionFieldDef,
  type PermissionMap,
} from "@/modules/system/types/rbac";
import type { SelectableUser } from "@/modules/system/hooks/useRoleUsers";
import { FieldConfigDrawer } from "@/modules/system/components/FieldConfigDrawer";

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

const IconTune = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const groups = Array.from(new Set(RBAC_COLLECTIONS.map((c) => c.group)));

function buildPermissionKey(collection: string, action: CrudAction): string {
  return `${collection}::${action}`;
}

function parsePermissionKey(
  key: string,
): { collection: string; action: CrudAction } | null {
  const [collection, action] = key.split("::");
  if (!collection) return null;
  if (
    action !== "create" &&
    action !== "read" &&
    action !== "update" &&
    action !== "delete"
  ) {
    return null;
  }
  return { collection, action };
}

interface RoleDrawerProps {
  open: boolean;
  editing: Role | null;
  saving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSave: (dto: CreateRoleDto | UpdateRoleDto) => Promise<void>;
  // permissions
  permMap: PermissionMap;
  permLoading: boolean;
  permError: string | null;
  onToggle: (collection: string, action: CrudAction) => void;
  onToggleRow: (collection: string, value: boolean) => void;
  onToggleColumn: (action: CrudAction, value: boolean) => void;
  onToggleAll: (value: boolean) => void;
  isRowFull: (collection: string) => boolean;
  isColumnFull: (action: CrudAction) => boolean;
  isAllFull: () => boolean;
  isAnyChecked: () => boolean;
  getPermissionConfig: (
    collection: string,
    action: CrudAction,
  ) => PermissionConfig;
  onPermissionConfigChange: (
    collection: string,
    action: CrudAction,
    patch: Partial<PermissionConfig>,
  ) => void;
  onLoadCollectionFields: (collection: string) => Promise<PermissionFieldDef[]>;
  // users
  selectedUserIds: string[];
  onUsersChange: (ids: string[]) => void;
  allUsers: SelectableUser[];
  usersLoading: boolean;
}

export function RoleDrawer({
  open,
  editing,
  saving,
  saveError,
  onClose,
  onSave,
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
  selectedUserIds,
  onUsersChange,
  allUsers,
  usersLoading,
  getPermissionConfig,
  onPermissionConfigChange,
  onLoadCollectionFields,
}: RoleDrawerProps) {
  const t = useT();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionKey, setSelectedPermissionKey] = useState("");
  const [fieldConfigOpen, setFieldConfigOpen] = useState(false);

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

  const isDirty =
    name.trim() !== (editing?.name ?? "") ||
    description.trim() !== (editing?.description ?? "");

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

  const activePermissionOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    for (const col of RBAC_COLLECTIONS) {
      for (const { action } of CRUD_ACTIONS) {
        if (!permMap[col.collection]?.[action]) continue;
        options.push({
          value: buildPermissionKey(col.collection, action),
          label: `${col.label} - ${ACTION_LABEL[action]}`,
        });
      }
    }
    return options;
  }, [permMap, ACTION_LABEL]);

  const selectedPermission = useMemo(
    () => parsePermissionKey(selectedPermissionKey),
    [selectedPermissionKey],
  );

  const selectedConfig = selectedPermission
    ? getPermissionConfig(
        selectedPermission.collection,
        selectedPermission.action,
      )
    : null;

  useEffect(() => {
    if (!open || fieldConfigOpen) return;
    if (activePermissionOptions.length === 0) {
      setSelectedPermissionKey("");
      return;
    }
    const exists = activePermissionOptions.some(
      (opt) => opt.value === selectedPermissionKey,
    );
    if (!exists) {
      setSelectedPermissionKey(activePermissionOptions[0].value);
    }
  }, [open, fieldConfigOpen, activePermissionOptions, selectedPermissionKey]);

  function openCustomModal(collection: string, action: CrudAction) {
    if (!permMap[collection]?.[action]) {
      onToggle(collection, action);
    }
    setSelectedPermissionKey(buildPermissionKey(collection, action));
    setFieldConfigOpen(true);
  }

  return (
    <>
      <DrawerModal
        open={open}
        onClose={onClose}
        icon={<IconShield />}
        title={editing ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
        subtitle={editing ? editing.name : "Vai trò mới trong hệ thống"}
        confirmOnClose={isDirty}
        panelClassName="!w-[620px]"
        stackOffset={fieldConfigOpen ? -2.5 : 0}
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
      >
        <DrawerSection title="Thông tin vai trò">
          <DrawerField label="Tên vai trò" required>
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
              placeholder="Mô tả ngắn về vai trò này..."
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
                      {t("permissionMatrix.colResource")}
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
                  {groups.map((group) => {
                    const cols = RBAC_COLLECTIONS.filter(
                      (c) => c.group === group,
                    );
                    return (
                      <>
                        <tr key={`group-${group}`}>
                          <td
                            colSpan={CRUD_ACTIONS.length + 2}
                            className="pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--faint)]"
                          >
                            {group}
                          </td>
                        </tr>
                        {cols.map((col) => {
                          const full = isRowFull(col.collection);
                          const anyTrue = CRUD_ACTIONS.some(
                            (a) => permMap[col.collection]?.[a.action],
                          );
                          return (
                            <tr
                              key={col.collection}
                              className="border-b border-[color:var(--border-light)] hover:bg-[color:var(--muted)]/40 transition-colors"
                            >
                              <td className="py-[7px] pr-3 text-foreground">
                                {col.label}
                              </td>
                              {CRUD_ACTIONS.map(({ action }) => (
                                <td
                                  key={action}
                                  className="py-[7px] px-3 text-center"
                                >
                                  <div className="flex justify-center items-center gap-1">
                                    <Checkbox
                                      checked={
                                        !!permMap[col.collection]?.[action]
                                      }
                                      onCheckedChange={() =>
                                        onToggle(col.collection, action)
                                      }
                                    />
                                    {permMap[col.collection]?.[action] && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openCustomModal(
                                            col.collection,
                                            action,
                                          )
                                        }
                                        className="w-5 h-5 rounded-md border border-[color:var(--border)] text-[color:var(--muted-fg)] hover:text-foreground hover:bg-[color:var(--muted)] inline-flex items-center justify-center transition-colors"
                                        title={t(
                                          "permissionMatrix.fieldConfig.custom",
                                        )}
                                        aria-label={t(
                                          "permissionMatrix.fieldConfig.custom",
                                        )}
                                      >
                                        <IconTune />
                                      </button>
                                    )}
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
                                      onToggleRow(col.collection, v === true)
                                    }
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DrawerSection>
      </DrawerModal>

      <FieldConfigDrawer
        open={fieldConfigOpen}
        onClose={() => setFieldConfigOpen(false)}
        subtitle={editing?.name ?? ""}
        zIndex={410}
        stackOffset={-2.5}
        selectedPermissionKey={selectedPermissionKey}
        activePermissionOptions={activePermissionOptions}
        selectedPermission={selectedPermission}
        selectedConfig={selectedConfig}
        onPermissionConfigChange={onPermissionConfigChange}
        onLoadCollectionFields={onLoadCollectionFields}
      />
    </>
  );
}
