import type { Meta, StoryObj } from "@storybook/react";
import { V2SidebarHeader } from "./V2SidebarHeader";

const meta: Meta<typeof V2SidebarHeader> = {
  title: "V2/Molecules/V2SidebarHeader",
  component: V2SidebarHeader,
  tags: ["autodocs"],
  argTypes: {
    isCollapsed: {
      control: "boolean",
    },
    appName: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2SidebarHeader>;

export const Expanded: Story = {
  args: {
    appName: "Liouni ERP",
    isCollapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    appName: "Liouni ERP",
    isCollapsed: true,
  },
};
