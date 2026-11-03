import type { Meta, StoryObj } from "@storybook/react";
import { V2FormGrid } from "./V2FormGrid";

type DemoValues = { code: string; name: string; note: string };

const meta: Meta<typeof V2FormGrid<DemoValues>> = {
  title: "Molecules/V2FormGrid",
  component: V2FormGrid,
};

export default meta;

type Story = StoryObj<typeof V2FormGrid<DemoValues>>;

export const Default: Story = {
  args: {
    values: { code: "KH-001", name: "Nguyễn Văn A", note: "" },
    fields: [
      { name: "code", label: "Mã", required: true },
      { name: "name", label: "Tên" },
      { name: "note", label: "Ghi chú", colSpan: 2 },
    ],
  },
};
