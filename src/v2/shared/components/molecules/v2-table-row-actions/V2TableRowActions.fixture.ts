import { vi } from "vitest";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";

export const makeGroups = () => {
  const handlers = {
    view: vi.fn(),
    edit: vi.fn(),
    print: vi.fn(),
    remove: vi.fn(),
  };
  const groups: V2RowActionGroup[] = [
    {
      groupLabel: "TRA CỨU",
      items: [
        { label: "Xem chi tiết", onClick: handlers.view },
        { label: "In", onClick: handlers.print },
      ],
    },
    {
      groupLabel: "THAO TÁC",
      items: [
        { label: "Chỉnh sửa", onClick: handlers.edit, disabled: false },
        { label: "Xóa", onClick: handlers.remove, variant: "danger" },
      ],
    },
  ];
  return { groups, handlers };
};
