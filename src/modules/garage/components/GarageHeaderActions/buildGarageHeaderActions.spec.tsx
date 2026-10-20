import { describe, expect, it, vi } from "vitest";

import type { ActionGroup } from "@/shared/components/ActionDropdown";

import { buildGarageHeaderActions } from "./buildGarageHeaderActions";

const translate = (_key: string, def?: string) => def ?? _key;

function findExportGroup(groups: ReturnType<typeof buildGarageHeaderActions>) {
  return groups[0] as ActionGroup;
}

describe("buildGarageHeaderActions", () => {
  it("nhóm xuất file có action xem sơ đồ quy trình sau Xuất Excel", () => {
    const actions = buildGarageHeaderActions({}, translate);
    const labels = findExportGroup(actions).items.map((item) => item.label);

    expect(labels).toEqual(["Xuất Excel", "Xem sơ đồ quy trình"]);
  });

  it("bấm action sơ đồ gọi đúng callback onOpenWorkflow", () => {
    const onOpenWorkflow = vi.fn();
    const actions = buildGarageHeaderActions({ onOpenWorkflow }, translate);
    const workflowItem = findExportGroup(actions).items[1];

    workflowItem.onClick();

    expect(onOpenWorkflow).toHaveBeenCalledTimes(1);
  });
});
