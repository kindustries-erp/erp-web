import type { Meta, StoryObj } from "@storybook/react";
import { V2Progress } from "./V2Progress";

const meta: Meta<typeof V2Progress> = {
  title: "Components/Atoms/Display/V2Progress",
  component: V2Progress,
  tags: ["autodocs"],
  args: { value: 60, label: "Đang xuất Excel", showValue: true },
};

export default meta;
type Story = StoryObj<typeof V2Progress>;

export const Default: Story = {};
export const Done: Story = { args: { value: 100, tone: "emerald" } };
export const Warning: Story = { args: { value: 30, tone: "amber" } };
export const Indeterminate: Story = { args: { value: undefined } };
