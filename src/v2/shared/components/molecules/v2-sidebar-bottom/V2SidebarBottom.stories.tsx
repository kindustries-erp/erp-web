import type { Meta, StoryObj } from "@storybook/react";
import { V2SidebarBottom } from "./V2SidebarBottom";

const meta: Meta<typeof V2SidebarBottom> = {
  title: "V2/Molecules/V2SidebarBottom",
  component: V2SidebarBottom,
  tags: ["autodocs"],
  argTypes: {
    collapsed: {
      control: "boolean",
    },
    unreadCount: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2SidebarBottom>;

export const DefaultExpanded: Story = {
  args: {
    displayName: "Admin Liouni",
    avatarInitials: "AL",
    unreadCount: 4,
    collapsed: false,
  },
};

export const CollapsedMode: Story = {
  args: {
    displayName: "Admin Liouni",
    avatarInitials: "AL",
    unreadCount: 4,
    collapsed: true,
  },
};

export const NoUnreadNotifications: Story = {
  args: {
    displayName: "Kế toán viên",
    avatarInitials: "KT",
    unreadCount: 0,
    collapsed: false,
  },
};
