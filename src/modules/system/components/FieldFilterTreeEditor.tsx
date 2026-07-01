import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/shared/components/Skeleton";
import type { CrudAction, PermissionConfig } from "@/modules/system/types/rbac";
import {
  addToGroup,
  deleteFromTree,
  FILTER_OPERATORS,
  NO_VALUE_OPERATORS,
  parseValidationToTree,
  treeToValidation,
  updateInTree,
  type CondNode,
  type GroupNode,
} from "@/modules/system/utils/filterTree";

interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

export function FieldFilterTreeEditor({
  open,
  t,
  selectedPermissionKey,
  selectedPermission,
  selectedConfig,
  fieldOptions,
  fieldsLoading,
  onPermissionConfigChange,
}: {
  open: boolean;

  t: any;
  selectedPermissionKey: string;
  selectedPermission: { collection: string; action: CrudAction } | null;
  selectedConfig: PermissionConfig | null;
  fieldOptions: FieldOption[];
  fieldsLoading: boolean;
  onPermissionConfigChange: (
    collection: string,
    action: CrudAction,
    patch: Partial<PermissionConfig>,
  ) => void;
}) {
  const [filterRoot, setFilterRoot] = useState<GroupNode>({
    kind: "group",
    uid: "root",
    logic: "_and",
    children: [],
  });
  const [addMenuGroupUid, setAddMenuGroupUid] = useState<string | null>(null);
  const [addMenuSearch, setAddMenuSearch] = useState("");
  useEffect(() => {
    if (!open) return;
    setFilterRoot(parseValidationToTree(selectedConfig?.validation ?? null));
    setAddMenuGroupUid(null);
    setAddMenuSearch("");
  }, [selectedPermissionKey, open]);
  useEffect(() => {
    if (!open) return;
    if (selectedConfig?.validation == null) {
      setFilterRoot(parseValidationToTree(null));
      setAddMenuGroupUid(null);
      setAddMenuSearch("");
    }
  }, [selectedConfig?.validation, open]);
  const validationFieldOptions =
    !selectedConfig || selectedConfig.isAllFields
      ? fieldOptions
      : fieldOptions.filter((f) => selectedConfig.fields.includes(f.value));
  const fieldLabelMap = useMemo(
    () => new Map(fieldOptions.map((f) => [f.value, f.label])),
    [fieldOptions],
  );
  function saveTree(root: GroupNode) {
    if (selectedPermission && selectedConfig)
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
    mutateTree(
      addToGroup(filterRoot, parentUid, {
        kind: "cond",
        uid: `c${Date.now()}`,
        field,
        op: "_nnull",
        value: null,
      }),
    );
    setAddMenuGroupUid(null);
    setAddMenuSearch("");
  }
  function handleAddGroup(parentUid: string, logic: "_and" | "_or") {
    mutateTree(
      addToGroup(filterRoot, parentUid, {
        kind: "group",
        uid: `g${Date.now()}`,
        logic,
        children: [],
      }),
    );
    setAddMenuGroupUid(null);
    setAddMenuSearch("");
  }
  function handleChangeGroupLogic(uid: string, logic: "_and" | "_or") {
    const next = updateInTree(filterRoot, uid, (node) =>
      node.kind === "group" ? { ...node, logic } : node,
    );
    if (next && next.kind === "group") mutateTree(next as GroupNode);
  }

  if (validationFieldOptions.length === 0)
    return fieldsLoading ? (
      <Skeleton className="h-8 w-full" />
    ) : (
      <p className="text-[11px] text-[color:var(--muted-fg)]">
        {t("permissionMatrix.fieldConfig.validationEmpty")}
      </p>
    );
  return <>{renderGroup(filterRoot, 0)}</>;

  function renderGroup(group: GroupNode, depth: number): React.ReactNode {
    const isRoot = depth === 0;
    const isAddingHere = addMenuGroupUid === group.uid;
    const q = addMenuSearch.trim().toLowerCase();
    const opts = q
      ? validationFieldOptions.filter(
          (opt) =>
            opt.label.toLowerCase().includes(q) ||
            opt.value.toLowerCase().includes(q),
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
        <div className="flex items-center gap-1">
          {(["_and", "_or"] as const).map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => handleChangeGroupLogic(group.uid, op)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${group.logic === op ? "bg-primary text-primary-fg" : "border border-[color:var(--border)] text-[color:var(--muted-fg)] hover:border-primary hover:text-primary bg-transparent"}`}
            >
              {op === "_and" ? "AND" : "OR"}
            </button>
          ))}
          <span className="text-[10px] text-[color:var(--muted-fg)] ml-0.5">
            — {group.logic === "_and" ? "Tất cả điều kiện" : "Bất kỳ điều kiện"}
          </span>
          {!isRoot && (
            <IconButton
              onClick={() => handleDeleteNode(group.uid)}
              className="ml-auto"
            />
          )}
        </div>
        {group.children.length === 0 && !isAddingHere && (
          <p className="text-[11px] text-[color:var(--muted-fg)] py-1 pl-1">
            {t("permissionMatrix.fieldConfig.noConfiguredRules")}
          </p>
        )}
        {group.children.map((child) =>
          child.kind === "group" ? (
            <div key={child.uid}>{renderGroup(child, depth + 1)}</div>
          ) : (
            <ConditionRow
              key={child.uid}
              child={child}
              fieldLabel={fieldLabelMap.get(child.field) || child.field}
              onUpdate={handleUpdateCond}
              onDelete={handleDeleteNode}
            />
          ),
        )}
        {isAddingHere ? (
          <AddMenu
            opts={opts}
            group={group}
            search={addMenuSearch}
            setSearch={setAddMenuSearch}
            onClose={() => {
              setAddMenuGroupUid(null);
              setAddMenuSearch("");
            }}
            onAddGroup={handleAddGroup}
            onAddCondition={handleAddCondition}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setAddMenuGroupUid(group.uid);
              setAddMenuSearch("");
            }}
            className="w-full flex items-center justify-center gap-1.5 py-[7px] text-[11px] rounded-lg border border-dashed border-[color:var(--border)] text-[color:var(--muted-fg)] hover:border-primary hover:text-primary transition-colors"
          >
            <PlusIcon />
            {t("permissionMatrix.fieldConfig.addRule")}
          </button>
        )}
      </div>
    );
  }
}

function ConditionRow({
  child,
  fieldLabel,
  onUpdate,
  onDelete,
}: {
  child: CondNode;
  fieldLabel: string;
  onUpdate: (uid: string, patch: { op?: string; value?: string }) => void;
  onDelete: (uid: string) => void;
}) {
  const needsValue = !NO_VALUE_OPERATORS.has(child.op);
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1.5">
      <span className="text-xs font-medium text-foreground w-20 flex-shrink-0 truncate">
        {fieldLabel}
      </span>
      <select
        value={child.op}
        onChange={(e) => onUpdate(child.uid, { op: e.target.value })}
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
          onChange={(e) => onUpdate(child.uid, { value: e.target.value })}
          placeholder="--"
        />
      ) : (
        <span className="w-20 flex-shrink-0" />
      )}
      <IconButton onClick={() => onDelete(child.uid)} />
    </div>
  );
}

function AddMenu({
  opts,
  group,
  search,
  setSearch,
  onClose,
  onAddGroup,
  onAddCondition,
}: any) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] overflow-hidden">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-[color:var(--border)] bg-[color:var(--muted)]">
        <SearchIcon />
        <input
          type="text"
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm field..."
          className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder-[color:var(--muted-fg)]"
        />
        <IconButton onClick={onClose} />
      </div>
      <div className="border-b border-[color:var(--border)]">
        {(["_and", "_or"] as const).map((logic) => (
          <button
            key={logic}
            type="button"
            onClick={() => onAddGroup(group.uid, logic)}
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
      <div className="max-h-36 overflow-y-auto">
        {opts.length === 0 ? (
          <p className="px-3 py-2 text-[11px] text-[color:var(--muted-fg)]">
            Không tìm thấy field
          </p>
        ) : (
          opts.map((opt: any) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onAddCondition(group.uid, opt.value)}
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
  );
}
function IconButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-[color:var(--muted-fg)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors`}
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
  );
}
function SearchIcon() {
  return (
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
  );
}
function PlusIcon() {
  return (
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
  );
}
