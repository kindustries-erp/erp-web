import type { Meta, StoryObj } from "@storybook/react";
import { V2Panel } from "./V2Panel";

const meta: Meta<typeof V2Panel> = {
  title: "Components/Molecules/Data Display/V2Panel",
  component: V2Panel,
  tags: ["autodocs"],
  args: {
    title: "Xu hướng dòng tiền",
    children: (
      <div className="h-32 text-sm text-muted-foreground">
        Biểu đồ đặt ở đây
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2Panel>;

export const Default: Story = {};
export const WithBadgeAndExtra: Story = {
  args: {
    badge: (
      <span className="rounded-full bg-primary px-2 text-[10px] text-primary-fg">
        12
      </span>
    ),
    extra: (
      <button type="button" className="text-xs text-muted-foreground">
        Xem tất cả
      </button>
    ),
  },
};
