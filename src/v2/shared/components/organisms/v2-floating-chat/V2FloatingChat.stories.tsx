import type { Meta, StoryObj } from "@storybook/react";
import { V2ChatBubble, V2TypingIndicator } from "@/v2/shared/components/atoms";
import { V2ChatComposer } from "@/v2/shared/components/molecules/v2-chat-composer";
import { V2FloatingChat } from "./V2FloatingChat";

const meta: Meta<typeof V2FloatingChat> = {
  title: "Components/Organisms/V2FloatingChat",
  component: V2FloatingChat,
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Trợ lý hóa đơn",
    subtitle: "Đọc hóa đơn và lập đề nghị mua",
    launcherLabel: "Mở trợ lý AI",
    footer: (
      <V2ChatComposer attachLabel="Chọn ảnh hoặc file" onAttach={() => {}} />
    ),
    children: (
      <>
        <V2ChatBubble>Gửi ảnh hoặc file hóa đơn để bắt đầu.</V2ChatBubble>
        <V2ChatBubble role="user">hoa-don-0001234.pdf</V2ChatBubble>
        <V2TypingIndicator label="Đang đọc hóa đơn" />
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof V2FloatingChat>;

export const Open: Story = {};
export const Closed: Story = { args: { open: false } };
