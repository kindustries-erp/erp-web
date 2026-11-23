import type { Meta, StoryObj } from "@storybook/react";
import { V2ActivityTimeline } from "./V2ActivityTimeline";
import {
  V2ActivityVariant,
  type V2ActivityItem,
} from "./V2ActivityTimeline.type";

const sampleItems: V2ActivityItem[] = [
  {
    id: "act-1",
    action: "Duyệt đề nghị mua hàng",
    actor: "Nguyễn Văn A",
    timestamp: "09/11/2026 14:20",
    details: "Đã duyệt đề nghị GDNM-20261109-001",
    variant: V2ActivityVariant.SUCCESS,
  },
  {
    id: "act-2",
    action: "Gửi duyệt",
    actor: "Trần Thị B",
    timestamp: "09/11/2026 09:05",
    details: "Gửi đề nghị chờ người duyệt",
    variant: V2ActivityVariant.DEFAULT,
  },
  {
    id: "act-3",
    action: "Từ chối",
    actor: "Lê Văn C",
    timestamp: "08/11/2026 16:40",
    details: "Thiếu báo giá từ nhà cung cấp",
    variant: V2ActivityVariant.DANGER,
  },
];

const meta: Meta<typeof V2ActivityTimeline> = {
  title: "Components/Molecules/V2ActivityTimeline",
  component: V2ActivityTimeline,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2ActivityTimeline>;

export const WithEvents: Story = {
  args: {
    items: sampleItems,
  },
};

export const EmptyState: Story = {
  args: {
    items: [],
  },
};
