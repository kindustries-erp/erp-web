import type { Meta, StoryObj } from "@storybook/react";
import { V2Breadcrumb } from "./V2Breadcrumb";

const meta: Meta<typeof V2Breadcrumb> = {
  title: "V2/Molecules/V2Breadcrumb",
  component: V2Breadcrumb,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof V2Breadcrumb>;

export const DefaultTwoLevels: Story = {
  args: {
    items: [{ label: "Kế toán" }, { label: "Hóa đơn VAT" }],
  },
};

export const DeepPath: Story = {
  args: {
    items: [
      { label: "Kho vận" },
      { label: "Chứng từ kho" },
      { label: "Phiếu nhập kho" },
      { label: "NK-20261004-001" },
    ],
  },
};
