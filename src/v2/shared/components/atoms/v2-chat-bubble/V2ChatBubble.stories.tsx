import type { Meta, StoryObj } from "@storybook/react";
import { V2ChatBubble } from "./V2ChatBubble";

const meta: Meta<typeof V2ChatBubble> = {
  title: "Components/Atoms/V2ChatBubble",
  component: V2ChatBubble,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex w-80 flex-col gap-2 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2ChatBubble>;

export const Assistant: Story = {
  args: { children: "Gửi ảnh hoặc file hóa đơn, tôi sẽ đọc giúp bạn." },
};

export const User: Story = {
  args: { role: "user", children: "hoa-don-0001234.pdf" },
};
