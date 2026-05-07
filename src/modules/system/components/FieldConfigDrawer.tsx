import { useEffect, useMemo, useState } from "react";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { MultiSelect } from "@/shared/components/MultiSelect";
import { useT } from "@/core/i18n";
import type {
  CrudAction,
  PermissionConfig,
  PermissionFieldDef,
} from "@/modules/system/types/rbac";
import {
  type GroupNode,
  type CondNode,
  type FilterNode,
  FILTER_OPERATORS,
  NO_VALUE_OPERATORS,
  parseValidationToTree,
  treeToValidation,
  updateInTree,
  deleteFromTree,
  addToGroup,
} from "@/modules/system/utils/filterTree";

// ── Types ──────────────────────────────────────────────────────────────────

interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface FieldConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  subtitle: string;
  zIndex?: number;
  stackOffset?: number;
  /** Key of the form `${collection}::${action}` */
  selectedPermissionKey: string;
  /** All active (checked) permission options, for the selector label */
  activePermissionOptions: { value: string; label: string }[];
  /** Derived from selectedPermissionKey */
  selectedPermission: { collection: string; action: CrudAction } | null;
  /** Current config for the selected permission */
  selectedConfig: PermissionConfig | null;
  onPermissionConfigChange: (
    collection: string,
    action: CrudAction,
    patch: Partial<PermissionConfig>,
  ) => void;
  /** Load all fields for a given collection */
  onLoadCollectionFields: (collection: string) => Promise<PermissionFieldDef[]>;
}

// ── Component ──────────────────────────────────────────────────────────────

export function FieldConfigDrawer({
  open,
  onClose,
  subtitle,
  zIndex = 410,
  stackOffset = -56,
  selectedPermissionKey,
  activePermissionOptions,
  selectedPermission,
  selectedConfig,
  onPermissionConfigChange,
  onLoadCollectionFields,
}: FieldConfigDrawerProps) {
  const t = useT();

  // ── Field loading ──────────────────────────────────────────────────────
  const [availableFields, setAvailableFields] = useState<PermissionFieldDef[]>(
    [],
  );
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!selectedPermission) {
      setAvailableFields([]);
      setFieldsError(null);
      return;
    }
    setFieldsLoading(true);
    setFieldsError(null);
    onLoadCollectionFields(selectedPermission.collection)
      .then((rows) => {
        if (!cancelled) setAvailableFields(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setAvailableFields([]);
          setFieldsError(t("permissionMatrix.fieldConfig.loadFieldsError"));
        }
      })
      .finally(() => {
        if (!cancelled) setFieldsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPermission, onLoadCollectionFields, t]);

  // ── Filter tree state ──────────────────────────────────────────────────
  const [filterRoot, setFilterRoot] = useState<GroupNode>({
    kind: "group",
    uid: "root",
    logic: "_and",
    children: [],
  });
  const [addMenuGroupUid, setAddMenuGroupUid] = useState<string | null>(null);
  const [addMenuSearch, setAddMenuSearch] = useState("");

  // Reset filter tree when opening or switching permission
  useEffect(() => {
    if (!open) return;
    setFilterRoot(parseValidationToTree(selectedConfig?.validation ?? null));
    setAddMenuGroupUid(null);
    setAddMenuSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPermissionKey, open]);

  // When validation is cleared externally (e.g. switching all→specific), reset the tree
  useEffect(() => {
    if (!open) return;
    if (selectedConfig?.validation == null) {
      setFilterRoot(parseValidationToTree(null));
      setAddMenuGroupUid(null);
      setAddMenuSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConfig?.validation]);

  // ── Derived ────────────────────────────────────────────────────────────
  const fieldOptions: FieldOption[] = availableFields.map((item) => ({
    value: item.field,
    label: item.name || item.field,
    description: item.type || undefined,
  }));

  // Add-rule dropdown: when specific fields are selected, only offer those fields.
  // (Existing condition rows render from the tree state, so they remain visible regardless.)
  const validationFieldOptions =
    !selectedConfig || selectedConfig.isAllFields
      ? fieldOptions
      : fieldOptions.filter((f) => selectedConfig.fields.includes(f.value));

  const fieldLabelMap = useMemo(
    () => new Map(fieldOptions.map((f) => [f.value, f.label])),
    [fieldOptions],
  );

  const selectedPermissionLabel =
    activePermissionOptions.find((o) => o.value === selectedPermissionKey)
      ?.label ?? "";

  // ── Tree handlers ──────────────────────────────────────────────────────
  function saveTree(root: GroupNode) {
    if (!selectedPermission || !selectedConfig) return;
    onPermissionConfigChange(
      selectedPermission.collection,
      selectedPermission.action,
      { validation: treeToValidation(root) },
    );
  }

  function mutateTree(next: GroupNode) {
    setFilterRoot(next);
    saveTree(next);
  }

  function handleUpdateCond(
    uid: string,
    patch: { op?: string; value?: string },
  ) {
    const next = updateInTree(filterRoot, uid, (node) => {
      if (node.kind !== "cond") return node;
      const updated = { ...node, ...patch } as CondNode;
      if (patch.op && NO_VALUE_OPERATORS.has(patch.op)) updated.value = null;
      return updated;
    });
    if (next && next.kind === "group") mutateTree(next as GroupNode);
  }

  function handleDeleteNode(uid: string) {
    mutateTree(deleteFromTree(filterRoot, uid));
  }

  function handleAddCondition(parentUid: string, field: string) {
    const node: CondNode = {
      kind: "cond",
      uid: `c${Date.now()}`,
      field,
      op: "_nnull",
      value: null,
    };
    mutateTree(addToGroup(filterRoot, parentUid, node));
    setAddMenuGroupUid(null);
    setAddMenuSearch("");
  }

  function handleAddGroup(parentUid: string, logic: "_and" | "_or") {
    const node: GroupNode = {
      kind: "group",
      uid: `g${Date.now()}`,
      logic,
      children: [],
    };
    mutateTree(addToGroup(filterRoot, parentUid, node));
    setAddMenuGroupUid(null);
    setAddMenuSearch("");
  }

  function handleChangeGroupLogic(uid: string, logic: "_and" | "_or") {
    const next = updateInTree(filterRoot, uid, (node) => {
      if (node.kind !== "group") return node;
      return { ...node, logic };
    });
    if (next && next.kind === "group") mutateTree(next as GroupNode);
  }

  // ── Render filter group (recursive) ───────────────────────────────────
  function renderGroup(group: GroupNode, depth: number): React.ReactNode {
    const isRoot = depth === 0;
    const isAddingHere = addMenuGroupUid === group.uid;
    const opts = addMenuSearch.trim()
      ? validationFieldOptions.filter(
          (opt) =>
            opt.label.toLowerCase().includes(addMenuSearch.toLowerCase()) ||
            opt.value.toLowerCase().includes(addMenuSearch.toLowerCase()),
        )
      : validationFieldOptions;

    return (
      <div
        className={
          depth > 0
            ? "ml-3 pl-2 border-l-2 border-[color:var(--border)] space-y-1 pt-1"
            : "space-y-1"
        }
      >
        {/* Group logic header */}
        <div className="flex items-center gap-1">
          {(["_and", "_or"] as const).map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => handleChangeGroupLogic(group.uid, op)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                group.logic === op
                  ? "bg-primary text-primary-fg"
                  : "border border-[color:var(--border)] text-[color:var(--muted-fg)] hover:border-primary hover:text-primary bg-transparent"
              }`}
            >
              {op === "_and" ? "AND" : "OR"}
            </button>
          ))}
          <span className="text-[10px] text-[color:var(--muted-fg)] ml-0.5">
            — {group.logic === "_and" ? "Tất cả điều kiện" : "Bất kỳ điều kiện"}
          </span>
          {!isRoot && (
            <button
              type="button"
              onClick={() => handleDeleteNode(group.uid)}
              className="ml-auto w-5 h-5 flex items-center justify-center rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Empty message */}
        {group.children.length === 0 && !isAddingHere && (
          <p className="text-[11px] text-[color:var(--muted-fg)] py-1 pl-1">
            {t("permissionMatrix.fieldConfig.noConfiguredRules")}
          </p>
        )}

        {/* Children */}
        {group.children.map((child) => {
          if (child.kind === "group") {
            return <div key={child.uid}>{renderGroup(child, depth + 1)}</div>;
          }
          const fieldLabel = fieldLabelMap.get(child.field) || child.field;
          const needsValue = !NO_VALUE_OPERATORS.has(child.op);
          return (
            <div
              key={child.uid}
              className="flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5"
            >
              <span className="text-xs font-medium text-foreground w-20 flex-shrink-0 truncate">
                {fieldLabel}
              </span>
              <select
                value={child.op}
                onChange={(e) =>
                  handleUpdateCond(child.uid, { op: e.target.value })
                }
                className="flex-1 min-w-0 text-[11px] border border-[color:var(--border)] rounded-md px-1.5 py-1 bg-[color:var(--surface)] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {FILTER_OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              {needsValue ? (
                <input
                  type="text"
                  className="w-20 flex-shrink-0 text-[11px] border border-[color:var(--border)] rounded-md px-2 py-1 bg-[color:var(--surface)] text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder-[color:var(--muted-fg)]"
                  value={child.value ?? ""}
                  onChange={(e) =>
                    handleUpdateCond(child.uid, { value: e.target.value })
                  }
                  placeholder="--"
                />
              ) : (
                <span className="w-20 flex-shrink-0" />
              )}
              <button
                type="button"
                onClick={() => handleDeleteNode(child.uid)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add Filter button / picker */}
        {isAddingHere ? (
          <div className="rounded-lg border border-[color:var(--border)] overflow-hidden">
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[color:var(--border)] bg-[color:var(--muted)]">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="flex-shrink-0 text-[color:var(--muted-fg)]"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                autoFocus
                value={addMenuSearch}
                onChange={(e) => setAddMenuSearch(e.target.value)}
                placeholder="Tìm field..."
                className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder-[color:var(--muted-fg)]"
              />
              <button
                type="button"
                onClick={() => {
                  setAddMenuGroupUid(null);
                  setAddMenuSearch("");
                }}
                className="text-[color:var(--muted-fg)] hover:text-foreground"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* AND / OR sub-group options */}
            <div className="border-b border-[color:var(--border)]">
              {(["_and", "_or"] as const).map((logic) => (
                <button
                  key={logic}
                  type="button"
                  onClick={() => handleAddGroup(group.uid, logic)}
                  className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-[color:var(--muted)] transition-colors flex items-center gap-2"
                >
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded border border-[color:var(--border)] text-[color:var(--muted-fg)]">
                    {logic === "_and" ? "AND" : "OR"}
                  </span>
                  <span className="text-[color:var(--muted-fg)]">
                    {logic === "_and" ? "Nhóm AND" : "Nhóm OR"}
                  </span>
                </button>
              ))}
            </div>
            {/* Field list */}
            <div className="max-h-36 overflow-y-auto">
              {opts.length === 0 ? (
                <p className="px-3 py-2 text-[11px] text-[color:var(--muted-fg)]">
                  Không tìm thấy field
                </p>
              ) : (
                opts.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAddCondition(group.uid, opt.value)}
                    className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-[color:var(--muted)] transition-colors"
                  >
                    {opt.label}
                    {opt.description && (
                      <span className="ml-1.5 text-[10px] text-[color:var(--muted-fg)]">
                        {opt.description}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAddMenuGroupUid(group.uid);
              setAddMenuSearch("");
            }}
            className="w-full flex items-center justify-center gap-1.5 py-[7px] text-[11px] rounded-lg border border-dashed border-[color:var(--border)] text-[color:var(--muted-fg)] hover:border-primary hover:text-primary transition-colors"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("permissionMatrix.fieldConfig.addRule")}
          </button>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("permissionMatrix.fieldConfig.title")}
      subtitle={subtitle}
      zIndex={zIndex}
      stackOffset={stackOffset}
      panelClassName="!w-[560px]"
      actions={[
        {
          label: t("permissionMatrix.btnClose"),
          onClick: onClose,
        },
      ]}
    >
      {activePermissionOptions.length === 0 ? (
        <p className="text-xs text-[color:var(--muted-fg)]">
          {t("permissionMatrix.fieldConfig.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          <DrawerField label={t("permissionMatrix.fieldConfig.permission")}>
            <div className="w-full text-xs text-foreground bg-[color:var(--muted)] border border-[color:var(--border)] rounded-lg px-3 py-2">
              {selectedPermissionLabel ||
                t("permissionMatrix.fieldConfig.permissionPlaceholder")}
            </div>
          </DrawerField>

          {selectedPermission && selectedConfig && (
            <>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedConfig.isAllFields}
                  onCheckedChange={(v) => {
                    const next = v === true;
                    // Switching from all → specific: clear validation so user starts fresh
                    const patch: Partial<typeof selectedConfig> = {
                      isAllFields: next,
                    };
                    if (!next) patch.validation = null;
                    onPermissionConfigChange(
                      selectedPermission.collection,
                      selectedPermission.action,
                      patch,
                    );
                  }}
                />
                <span className="text-xs text-foreground">
                  {t("permissionMatrix.fieldConfig.allFields")}
                </span>
              </label>

              {!selectedConfig.isAllFields && (
                <DrawerField label={t("permissionMatrix.fieldConfig.fields")}>
                  {fieldsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : fieldOptions.length === 0 ? (
                    <p className="text-[11px] text-[color:var(--muted-fg)]">
                      {t("permissionMatrix.fieldConfig.fieldsEmpty")}
                    </p>
                  ) : (
                    <MultiSelect
                      options={fieldOptions}
                      value={selectedConfig.fields}
                      onChange={(vals) =>
                        onPermissionConfigChange(
                          selectedPermission.collection,
                          selectedPermission.action,
                          { fields: vals },
                        )
                      }
                      placeholder={t(
                        "permissionMatrix.fieldConfig.fieldsEmpty",
                      )}
                      searchPlaceholder="Tìm field..."
                      emptyLabel={t("permissionMatrix.fieldConfig.fieldsEmpty")}
                    />
                  )}
                  {fieldsError && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {fieldsError}
                    </p>
                  )}
                </DrawerField>
              )}

              <DrawerSection
                title={t("permissionMatrix.fieldConfig.validationTitle")}
              >
                {validationFieldOptions.length === 0 ? (
                  fieldsLoading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <p className="text-[11px] text-[color:var(--muted-fg)]">
                      {t("permissionMatrix.fieldConfig.validationEmpty")}
                    </p>
                  )
                ) : (
                  renderGroup(filterRoot, 0)
                )}
              </DrawerSection>
            </>
          )}
        </div>
      )}
    </DrawerModal>
  );
}
