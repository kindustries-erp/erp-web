import type { Meta, StoryObj } from "@storybook/react";
import { V2BottomSheet } from "./V2BottomSheet";

const meta: Meta<typeof V2BottomSheet> = {
  title: "Molecules/V2BottomSheet",
  component: V2BottomSheet,
};

export default meta;

type Story = StoryObj<typeof V2BottomSheet>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Bộ lọc",
    subtitle: "Chọn điều kiện hiển thị",
    children: <p>Nội dung bottom sheet</p>,
  },
};
