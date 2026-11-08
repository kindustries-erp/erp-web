import type { Meta, StoryObj } from "@storybook/react";
import { V2MultiSelect } from "./V2MultiSelect";

const meta: Meta<typeof V2MultiSelect> = {
  title: "Components/Molecules/V2MultiSelect",
  component: V2MultiSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof V2MultiSelect>;

const sampleOptions = [
  { value: "u1", label: "admin@liouni.com", description: "Admin" },
  { value: "u2", label: "sales@liouni.com", description: "Bán hàng" },
  { value: "u3", label: "tech@liouni.com", description: "Kỹ thuật" },
  { value: "u4", label: "accountant@liouni.com", description: "Kế toán" },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
    value: [],
    placeholder: "Chọn người dùng...",
  },
};

export const WithPreselected: Story = {
  args: {
    options: sampleOptions,
    value: ["u1", "u2"],
    placeholder: "Chọn người dùng...",
  },
};

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    value: ["u1"],
    disabled: true,
  },
};
