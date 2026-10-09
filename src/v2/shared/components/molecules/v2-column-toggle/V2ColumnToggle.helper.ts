import { arrayMove } from "@dnd-kit/sortable";

export const reorderKeys = (
  keys: string[],
  activeKey: string,
  overKey: string,
): string[] => {
  const from = keys.indexOf(activeKey);
  const to = keys.indexOf(overKey);
  return from < 0 || to < 0 || from === to ? keys : arrayMove(keys, from, to);
};
