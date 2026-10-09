import type { Meta } from "@storybook/react";
import React from "react";
import { Calendar, Hash, ListFilter } from "lucide-react";
import { V2FilterChip } from "./V2FilterChip";

const meta: Meta<typeof V2FilterChip> = {
  title: "Components/Atoms/Display/V2FilterChip",
  component: V2FilterChip,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => (
  <V2FilterChip label="Bên bán" summary="3 giá trị" onRemove={() => {}} />
);
export const Types = () => (
  <div className="flex flex-wrap gap-2">
    <V2FilterChip
      label="Ngày HĐ"
      summary="01/10 – 07/10"
      icon={<Calendar className="h-3 w-3" />}
      onRemove={() => {}}
    />
    <V2FilterChip
      label="Thành tiền"
      summary="> 1.000.000"
      icon={<Hash className="h-3 w-3" />}
      onRemove={() => {}}
    />
    <V2FilterChip
      label="Trạng thái"
      summary="Mới"
      icon={<ListFilter className="h-3 w-3" />}
      onRemove={() => {}}
    />
  </div>
);
export const LongLabel = () => (
  <div className="w-48">
    <V2FilterChip
      label="Bên bán"
      summary="CÔNG TY CỔ PHẦN VINFAST VIỆT NAM"
      onRemove={() => {}}
    />
  </div>
);
