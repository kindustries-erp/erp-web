import type { Meta } from "@storybook/react";
import React from "react";
import { V2TableSelectionChip } from "./V2TableSelectionChip";

const meta: Meta<typeof V2TableSelectionChip> = {
  title: "Components/Molecules/Table/V2TableSelectionChip",
  component: V2TableSelectionChip,
  tags: ["autodocs"],
};
export default meta;

export const Default = () => (
  <V2TableSelectionChip count={2} onClear={() => {}} />
);
