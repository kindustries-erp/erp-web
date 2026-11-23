import type { Meta, StoryObj } from "@storybook/react";
import { V2ChatComposer } from "./V2ChatComposer";

const meta: Meta<typeof V2ChatComposer> = {
  title: "Components/Molecules/V2ChatComposer",
  component: V2ChatComposer,
  tags: ["autodocs"],
  args: { attachLabel: "Chọn ảnh hoặc file hóa đơn", onAttach: () => {} },
  decorators: [
    (Story) => (
      <div className="w-80 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2ChatComposer>;

export const AttachOnly: Story = {};
export const WithText: Story = {
  args: { onSend: () => {}, placeholder: "Nhập tin nhắn", sendLabel: "Gửi" },
};
