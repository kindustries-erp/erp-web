import React, { useMemo, useState } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useT } from "@/core/i18n";
import {
  RBAC_COLLECTIONS,
  CRUD_ACTIONS,
  type CrudAction,
  type PermissionMap,
  type PermissionConfig,
  type PermissionFieldDef,
  type Role,
} from "@/modules/system/types/rbac";
import { FieldConfigDrawer } from "@/modules/system/components/FieldConfigDrawer";

// ── Icons ──────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── Props ──────────────────────────────────────────────────────────────────

interface PermissionMatrixDrawerProps {
  open: boolean;
  role: Role | null;
  permMap: PermissionMap;
  loading: boolean;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: () => Promise<void>;
  onToggle: (collection: string, action: CrudAction) => void;
  onToggleRow: (collection: string, value: boolean) => void;
  onToggleColumn: (action: CrudAction, value: boolean) => void;
  onToggleAll?: (value: boolean) => void;
  isRowFull: (collection: string) => boolean;
  isColumnFull: (action: CrudAction) => boolean;
  isAllFull?: () => boolean;
  isAnyChecked?: () => boolean;
  zIndex?: number;
  stackOffset?: number;
  // ── Optional field config ──────────────────────────────────────────────
  getPermissionConfig?: (
    collection: string,
    action: CrudAction,
  ) => PermissionConfig;
  onPermissionConfigChange?: (
    collection: string,
    action: CrudAction,
    patch: Partial<PermissionConfig>,
  ) => void;
  onLoadCollectionFields?: (
    collection: string,
  ) => Promise<PermissionFieldDef[]>;
}

const groups = Array.from(new Set(RBAC_COLLECTIONS.map((c) => c.group)));

export function PermissionMatrixDrawer({
  open,
  role,
  permMap,
  loading,
  saving,
  error,
  onClose,
  onSave,
  onToggle,
  onToggleRow,
  onToggleColumn,
  onToggleAll,
  isRowFull,
  isColumnFull,
  isAllFull,
  isAnyChecked,
  zIndex = 410,
  stackOffset = 0,
  getPermissionConfig,
  onPermissionConfigChange,
  onLoadCollectionFields,
}: PermissionMatrixDrawerProps) {
  const t = useT();
  const hasFieldConfig = !!(
    getPermissionConfig &&
    onPermissionConfigChange &&
    onLoadCollectionFields
  );

  const [fieldConfigOpen, setFieldConfigOpen] = useState(false);
  const [selectedPermissionKey, setSelectedPermissionKey] = useState("");

  const activePermissionOptions = useMemo(() => {
    if (!hasFieldConfig) return [];
    const options: Array<{ value: string; label: string }> = [];
    const ACTION_LABEL_MAP: Record<CrudAction, string> = {
      create: t("permissionMatrix.actions.create"),
      read: t("permissionMatrix.actions.read"),
      update: t("permissionMatrix.actions.update"),
      delete: t("permissionMatrix.actions.delete"),
    };
    for (const col of RBAC_COLLECTIONS) {
      for (const { action } of CRUD_ACTIONS) {
        if (!permMap[col.collection]?.[action]) continue;
        options.push({
          value: buildPermissionKey(col.collection, action),
          label: `${col.label} - ${ACTION_LABEL_MAP[action]}`,
        });
      }
    }
    return options;
  }, [hasFieldConfig, permMap, t]);

  const selectedPermission = useMemo(
    () => parsePermissionKey(selectedPermissionKey),
    [selectedPermissionKey],
  );

  const selectedConfig =
    hasFieldConfig && selectedPermission
      ? getPermissionConfig!(
          selectedPermission.collection,
          selectedPermission.action,
        )
      : null;

  function openFieldConfig(collection: string, action: CrudAction) {
    if (!permMap[collection]?.[action]) {
      onToggle(collection, action);
    }
    setSelectedPermissionKey(buildPermissionKey(collection, action));
    setFieldConfigOpen(true);
  }

  const ACTION_LABEL: Record<CrudAction, string> = {
    create: t("permissionMatrix.actions.create"),
    read: t("permissionMatrix.actions.read"),
    update: t("permissionMatrix.actions.update"),
    delete: t("permissionMatrix.actions.delete"),
  };

  const allChecked = isAllFull?.() ?? false;
  const anyChecked = isAnyChecked?.() ?? false;

  return (
    <>
      <DrawerModal
        open={open}
        onClose={onClose}
        title={t("permissionMatrix.title")}
        subtitle={role?.name ?? ""}
        panelClassName="!w-[620px]"
        zIndex={zIndex}
        stackOffset={fieldConfigOpen ? -2.5 : stackOffset}
        actions={[
          { label: t("permissionMatrix.btnClose"), onClick: onClose },
          {
            label: t("permissionMatrix.btnSave"),
            onClick: onSave,
            primary: true,
            disabled: loading || saving,
            loading: saving,
          },
        ]}
      >
        {error && (
          <div className="text-xs text-red-500 rounded-lg px-3 py-2 border border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 mb-4">
            {error}
          </div>
        )}

        {loading ? (
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
                    {onToggleAll ? (
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
                    ) : (
                      t("permissionMatrix.colAll")
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const cols = RBAC_COLLECTIONS.filter(
                    (c) => c.group === group,
                  );
                  return (
                    <React.Fragment key={`group-${group}`}>
                      <tr>
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
                                  {hasFieldConfig &&
                                    permMap[col.collection]?.[action] && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openFieldConfig(
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
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DrawerModal>

      {hasFieldConfig && (
        <FieldConfigDrawer
          open={fieldConfigOpen}
          onClose={() => setFieldConfigOpen(false)}
          subtitle={role?.name ?? ""}
          zIndex={(zIndex ?? 410) + 10}
          stackOffset={-2.5}
          selectedPermissionKey={selectedPermissionKey}
          activePermissionOptions={activePermissionOptions}
          selectedPermission={selectedPermission}
          selectedConfig={selectedConfig}
          onPermissionConfigChange={onPermissionConfigChange!}
          onLoadCollectionFields={onLoadCollectionFields!}
        />
      )}
    </>
  );
}
