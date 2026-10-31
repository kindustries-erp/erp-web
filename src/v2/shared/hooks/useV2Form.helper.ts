/** So sánh deep equality cho form values để xác định trạng thái isDirty */
export function isObjectDifferent(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return false;
  if (typeof a !== "object" || !a || typeof b !== "object" || !b) return true;

  if (Array.isArray(a) !== Array.isArray(b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return true;
    return a.some((val, idx) => isObjectDifferent(val, b[idx]));
  }

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  if (keysA.length !== keysB.length) return true;
  return keysA.some((key) =>
    isObjectDifferent(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
    ),
  );
}
