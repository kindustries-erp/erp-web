import type { ColumnSizingState } from "@tanstack/react-table";

export function getNestedValue(obj: any, path: string | number | symbol) {
  if (typeof path !== "string") return obj[path];
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

export function sanitizeActionColumnSizing(
  sizing: ColumnSizingState,
): ColumnSizingState {
  if (!("__actions" in sizing) && !("__hover_actions" in sizing)) return sizing;
  const next = { ...sizing };
  delete next.__actions;
  delete next.__hover_actions;
  return next;
}
