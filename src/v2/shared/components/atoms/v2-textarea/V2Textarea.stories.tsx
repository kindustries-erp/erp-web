import type { Meta, StoryObj } from "@storybook/react";
import { V2Textarea } from "./V2Textarea";

const meta: Meta<typeof V2Textarea> = {
  title: "Components/Atoms/Forms & Inputs/V2Textarea",
  component: V2Textarea,
  tags: ["autodocs"],
  args: { placeholder: "Nhập ghi chú..." },
};

export default meta;
type Story = StoryObj<typeof V2Textarea>;

export const Default: Story = {};
export const WithValue: Story = {
  args: { defaultValue: "Hóa đơn điều chỉnh giá" },
};
export const Disabled: Story = { args: { disabled: true } };
