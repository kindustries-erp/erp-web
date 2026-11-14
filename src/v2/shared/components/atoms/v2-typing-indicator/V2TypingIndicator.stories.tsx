import type { Meta, StoryObj } from "@storybook/react";
import { V2TypingIndicator } from "./V2TypingIndicator";

const meta: Meta<typeof V2TypingIndicator> = {
  title: "Components/Atoms/V2TypingIndicator",
  component: V2TypingIndicator,
  tags: ["autodocs"],
  args: { label: "Đang đọc hóa đơn" },
};

export default meta;
type Story = StoryObj<typeof V2TypingIndicator>;

export const Default: Story = {};
