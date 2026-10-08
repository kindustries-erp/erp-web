import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import { V2FilterChip } from "@/v2/shared/components/atoms/v2-filter-chip";
import { V2FilterCard } from "@/v2/shared/components/molecules/v2-filter-card";
import { V2FilterPanel } from "./V2FilterPanel";

const meta: Meta<typeof V2FilterPanel> = {
  title: "V2/Molecules/V2FilterPanel",
  component: V2FilterPanel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-[560px]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const COLUMNS: [string, string, ColumnValueType][] = [
  ["date", "Ngày HĐ", ColumnValueType.DATE],
  ["no", "Số HĐ", ColumnValueType.TEXT],
  ["amount", "Thành tiền", ColumnValueType.NUMBER],
];

const Cards = ({ active }: { active?: string[] }) => {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {COLUMNS.map(([key, title, type]) => (
        <V2FilterCard
          key={key}
          columnKey={key}
          title={title}
          valueType={type}
          active={active?.includes(key)}
          open={open === key}
          onOpenChange={(o) => setOpen(o ? key : null)}
        >
          <p className="p-3 text-xs text-muted-fg">Nội dung lọc</p>
        </V2FilterCard>
      ))}
    </>
  );
};

export const Default = () => (
  <V2FilterPanel
    activeCount={0}
    onResetAll={() => {}}
    onClose={() => {}}
    search=""
    onSearchChange={() => {}}
    columnCount={COLUMNS.length}
  >
    <Cards />
  </V2FilterPanel>
);

export const WithActiveFilters = () => (
  <V2FilterPanel
    activeCount={2}
    onResetAll={() => {}}
    onClose={() => {}}
    search=""
    onSearchChange={() => {}}
    columnCount={COLUMNS.length}
    chips={
      <div className="flex flex-wrap gap-1.5">
        <V2FilterChip label="Số HĐ" summary="2 giá trị" onRemove={() => {}} />
        <V2FilterChip label="Thành tiền" summary="> 1tr" onRemove={() => {}} />
      </div>
    }
  >
    <Cards active={["no", "amount"]} />
  </V2FilterPanel>
);

export const EmptySearch = () => (
  <V2FilterPanel
    activeCount={0}
    onResetAll={() => {}}
    onClose={() => {}}
    search="zzz"
    onSearchChange={() => {}}
    columnCount={0}
  >
    <Cards />
  </V2FilterPanel>
);
