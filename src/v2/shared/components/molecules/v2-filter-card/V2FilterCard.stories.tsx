import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import { V2FilterCard } from "./V2FilterCard";

const meta: Meta<typeof V2FilterCard> = {
  title: "Components/Molecules/Filter & Search/V2FilterCard",
  component: V2FilterCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const Body = () => (
  <p className="p-3 text-xs text-muted-fg">Nội dung lọc của cột</p>
);

export const Closed = () => (
  <V2FilterCard
    columnKey="a"
    title="Số HĐ"
    valueType={ColumnValueType.TEXT}
    open={false}
    onOpenChange={() => {}}
  >
    <Body />
  </V2FilterCard>
);
export const OpenAndActive = () => (
  <V2FilterCard
    columnKey="b"
    title="Bên bán"
    valueType={ColumnValueType.TEXT}
    active
    open
    onOpenChange={() => {}}
  >
    <Body />
  </V2FilterCard>
);
export const ByType = () => {
  const [open, setOpen] = useState<string | null>("date");
  const types: [string, string, ColumnValueType][] = [
    ["date", "Ngày HĐ", ColumnValueType.DATE],
    ["num", "Thành tiền", ColumnValueType.NUMBER],
    ["text", "Diễn giải", ColumnValueType.TEXT],
  ];
  return (
    <div className="flex flex-col gap-1.5">
      {types.map(([key, title, type]) => (
        <V2FilterCard
          key={key}
          columnKey={key}
          title={title}
          valueType={type}
          open={open === key}
          onOpenChange={(o) => setOpen(o ? key : null)}
        >
          <Body />
        </V2FilterCard>
      ))}
    </div>
  );
};
