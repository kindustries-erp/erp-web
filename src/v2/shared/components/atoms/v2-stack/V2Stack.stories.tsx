import type { Meta } from "@storybook/react";
import React from "react";
import { V2Stack } from "./V2Stack";

const meta: Meta<typeof V2Stack> = {
  title: "Components/Atoms/Display/V2Stack",
  component: V2Stack,
  tags: ["autodocs"],
};
export default meta;

const Box = ({ label }: { label: string }) => (
  <div className="rounded border border-border bg-surface px-3 py-2 text-xs">
    {label}
  </div>
);

export const Gap = () => (
  <V2Stack gap="md" className="w-64">
    <Box label="Mục 1" />
    <Box label="Mục 2" />
    <Box label="Mục 3" />
  </V2Stack>
);

export const FillAndGrow = () => (
  <div className="h-48 w-80 border border-dashed border-border p-2">
    <V2Stack as="section" fill gap="sm">
      <Box label="Đầu trang (không co giãn)" />
      <V2Stack grow gap="sm" className="rounded border border-border/60 p-2">
        <Box label="Vùng nội dung (flex-1)" />
      </V2Stack>
    </V2Stack>
  </div>
);
