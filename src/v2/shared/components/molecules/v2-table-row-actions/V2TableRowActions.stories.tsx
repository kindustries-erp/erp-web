import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { V2RowActionList } from "./V2RowActionList";
import { V2TableContextMenu } from "./V2TableContextMenu";
import { V2TableRowHoverActions } from "./V2TableRowHoverActions";

const meta: Meta = {
  title: "V2/Molecules/V2TableRowActions",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};
export default meta;

const GROUPS: V2RowActionGroup[] = [
  {
    groupLabel: "Tra cứu",
    items: [
      { label: "Xem chi tiết", onClick: () => {} },
      { label: "Xem theo đối tượng", onClick: () => {} },
    ],
  },
  {
    groupLabel: "Thao tác",
    items: [
      { label: "Chỉnh sửa", onClick: () => {} },
      {
        label: "Tải XML",
        icon: <Download className="h-3.5 w-3.5" />,
        onClick: () => {},
      },
      { label: "Đã khóa", onClick: () => {}, disabled: true },
      {
        label: "Xóa",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "danger",
        onClick: () => {},
      },
    ],
  },
];

export const HoverActions = () => (
  <div className="group relative flex h-10 w-[420px] items-center rounded-md border border-border px-3 text-xs">
    Rê chuột vào dòng để hiện nút nhanh
    <V2TableRowHoverActions groups={GROUPS} />
  </div>
);

export const ActionList = () => (
  <div className="w-56 rounded-lg border border-border bg-surface p-1">
    <V2RowActionList groups={GROUPS} />
  </div>
);

export const ContextMenu = () => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          setPos({ x: e.clientX, y: e.clientY });
        }}
        className="flex h-32 w-[420px] items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-fg"
      >
        Bấm chuột phải vào đây
      </div>
      <V2TableContextMenu
        position={pos}
        groups={GROUPS}
        onClose={() => setPos(null)}
      />
    </>
  );
};

export const SingleGroup = () => (
  <div className="group relative flex h-10 w-[420px] items-center rounded-md border border-border px-3 text-xs">
    Một nhóm: hai mục đầu của nhóm thành nút nhanh
    <V2TableRowHoverActions groups={[GROUPS[1]]} />
  </div>
);
