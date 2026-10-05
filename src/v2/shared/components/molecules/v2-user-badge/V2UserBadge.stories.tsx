import type { Meta, StoryObj } from "@storybook/react";
import { V2UserBadge } from "./V2UserBadge";

const meta: Meta<typeof V2UserBadge> = {
  title: "V2/Molecules/V2UserBadge",
  component: V2UserBadge,
  tags: ["autodocs"],
  argTypes: {
    isCompact: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2UserBadge>;

export const DefaultAdmin: Story = {
  args: {
    name: "Nguyễn Văn An",
    role: "Quản trị viên",
    tenantName: "Nam Sài Gòn",
    isCompact: false,
  },
};

export const CompactMode: Story = {
  args: {
    name: "Trần Thị Mai",
    role: "Kế toán trưởng",
    tenantName: "Trụ sở chính",
    isCompact: true,
  },
};

export const WarehouseStaff: Story = {
  args: {
    name: "Lê Hoàng Long",
    role: "Thủ kho",
    tenantName: "Kho Đào Trí",
    isCompact: false,
  },
};
