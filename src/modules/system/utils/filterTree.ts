// ── Filter tree types ──────────────────────────────────────────────────────

export type CondNode = {
  kind: "cond";
  uid: string;
  field: string;
  op: string;
  value: string | null;
};
export type GroupNode = {
  kind: "group";
  uid: string;
  logic: "_and" | "_or";
  children: FilterNode[];
};
export type FilterNode = CondNode | GroupNode;

// ── Operator definitions ───────────────────────────────────────────────────

export const FILTER_OPERATORS: Array<{
  value: string;
  label: string;
  noValue?: true;
}> = [
  { value: "_null", label: "Rỗng (null)", noValue: true },
  { value: "_nnull", label: "Không rỗng (null)", noValue: true },
  { value: "_empty", label: "Rỗng", noValue: true },
  { value: "_nempty", label: "Không rỗng", noValue: true },
  { value: "_eq", label: "Bằng" },
  { value: "_neq", label: "Khác" },
  { value: "_lt", label: "Nhỏ hơn (<)" },
  { value: "_lte", label: "Nhỏ hơn hoặc bằng (≤)" },
  { value: "_gt", label: "Lớn hơn (>)" },
  { value: "_gte", label: "Lớn hơn hoặc bằng (≥)" },
  { value: "_contains", label: "Chứa" },
  { value: "_ncontains", label: "Không chứa" },
  { value: "_starts_with", label: "Bắt đầu bằng" },
  { value: "_ends_with", label: "Kết thúc bằng" },
  { value: "_regex", label: "Khớp regex" },
];

export const NO_VALUE_OPERATORS = new Set([
  "_null",
  "_nnull",
  "_empty",
  "_nempty",
]);

// ── UID generator ──────────────────────────────────────────────────────────

let _nid = 0;
export function genNid(): string {
  return `n${++_nid}`;
}

// ── Parsers ────────────────────────────────────────────────────────────────

export function parseFilterItems(arr: unknown[]): FilterNode[] {
  const out: FilterNode[] = [];
  for (const item of arr) {
    const node = parseFilterItem(item);
    if (node) out.push(node);
  }
  return out;
}

export function parseFilterItem(item: unknown): FilterNode | null {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const obj = item as Record<string, unknown>;
  if (Array.isArray(obj._and)) {
    return {
      kind: "group",
      uid: genNid(),
      logic: "_and",
      children: parseFilterItems(obj._and as unknown[]),
    };
  }
  if (Array.isArray(obj._or)) {
    return {
      kind: "group",
      uid: genNid(),
      logic: "_or",
      children: parseFilterItems(obj._or as unknown[]),
    };
  }
  const entries = Object.entries(obj);
  if (entries.length !== 1) return null;
  const [field, rawRules] = entries[0];
  if (!rawRules || typeof rawRules !== "object" || Array.isArray(rawRules))
    return null;
  const ruleEntries = Object.entries(rawRules as Record<string, unknown>);
  if (ruleEntries.length === 0) return null;
  if (ruleEntries.length === 1) {
    const [op, val] = ruleEntries[0];
    return {
      kind: "cond",
      uid: genNid(),
      field,
      op,
      value:
        NO_VALUE_OPERATORS.has(op) ||
        val === true ||
        val === null ||
        val === undefined
          ? null
          : String(val),
    };
  }
  // Multiple operators on same field → wrap in _and group
  return {
    kind: "group",
    uid: genNid(),
    logic: "_and",
    children: ruleEntries.map(([op, val]) => ({
      kind: "cond" as const,
      uid: genNid(),
      field,
      op,
      value:
        NO_VALUE_OPERATORS.has(op) ||
        val === true ||
        val === null ||
        val === undefined
          ? null
          : String(val),
    })),
  };
}

export function parseValidationToTree(
  validation: Record<string, unknown> | null,
): GroupNode {
  if (!validation || typeof validation !== "object") {
    return { kind: "group", uid: "root", logic: "_and", children: [] };
  }
  const v = validation as Record<string, unknown>;
  if (Array.isArray(v._and)) {
    return {
      kind: "group",
      uid: "root",
      logic: "_and",
      children: parseFilterItems(v._and as unknown[]),
    };
  }
  if (Array.isArray(v._or)) {
    return {
      kind: "group",
      uid: "root",
      logic: "_or",
      children: parseFilterItems(v._or as unknown[]),
    };
  }
  return { kind: "group", uid: "root", logic: "_and", children: [] };
}

// ── Serializers ────────────────────────────────────────────────────────────

export function nodeToJson(node: FilterNode): Record<string, unknown> {
  if (node.kind === "cond") {
    return {
      [node.field]: {
        [node.op]: NO_VALUE_OPERATORS.has(node.op)
          ? true
          : node.value !== null && node.value !== ""
            ? Number.isFinite(Number(node.value))
              ? Number(node.value)
              : node.value
            : null,
      },
    };
  }
  return { [node.logic]: node.children.map(nodeToJson) };
}

export function treeToValidation(
  root: GroupNode,
): Record<string, unknown> | null {
  if (root.children.length === 0) return null;
  return nodeToJson(root) as Record<string, unknown>;
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function updateInTree(
  node: FilterNode,
  uid: string,
  fn: (n: FilterNode) => FilterNode | null,
): FilterNode | null {
  if (node.uid === uid) return fn(node);
  if (node.kind === "group") {
    const children = node.children
      .map((c) => updateInTree(c, uid, fn))
      .filter(Boolean) as FilterNode[];
    return { ...node, children };
  }
  return node;
}

export function deleteFromTree(root: GroupNode, uid: string): GroupNode {
  function del(node: FilterNode): FilterNode | null {
    if (node.uid === uid) return null;
    if (node.kind === "group") {
      return {
        ...node,
        children: node.children.map(del).filter(Boolean) as FilterNode[],
      };
    }
    return node;
  }
  return {
    ...root,
    children: root.children.map(del).filter(Boolean) as FilterNode[],
  };
}

export function addToGroup(
  root: GroupNode,
  parentUid: string,
  child: FilterNode,
): GroupNode {
  function add(node: FilterNode): FilterNode {
    if (node.kind === "group" && node.uid === parentUid) {
      return { ...node, children: [...node.children, child] };
    }
    if (node.kind === "group") {
      return { ...node, children: node.children.map(add) };
    }
    return node;
  }
  return add(root) as GroupNode;
}
