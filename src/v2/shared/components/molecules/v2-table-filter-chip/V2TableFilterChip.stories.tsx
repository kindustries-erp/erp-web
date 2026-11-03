import type { Meta } from "@storybook/react";
import React from "react";
import { V2TableFilterChip } from "./V2TableFilterChip";

const meta: Meta<typeof V2TableFilterChip> = {
  title: "Components/Molecules/Table/V2TableFilterChip",
  component: V2TableFilterChip,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => (
  <V2TableFilterChip count={2} onClear={() => {}} onToggleFilter={() => {}} />
);

export const WithoutToggle = () => (
  <V2TableFilterChip count={1} onClear={() => {}} />
);

export const CompactWithoutLabel = () => (
  <V2TableFilterChip
    count={3}
    showLabel={false}
    onClear={() => {}}
    onToggleFilter={() => {}}
  />
);
