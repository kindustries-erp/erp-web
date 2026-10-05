import type { Meta, StoryObj } from "@storybook/react";
import { V2SidebarToggleBtn } from "./V2SidebarToggleBtn";

const meta: Meta<typeof V2SidebarToggleBtn> = {
  title: "V2/Atoms/V2SidebarToggleBtn",
  component: V2SidebarToggleBtn,
  tags: ["autodocs"],
  argTypes: {
    isCollapsed: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2SidebarToggleBtn>;

export const ExpandedState: Story = {
  args: {
    isCollapsed: false,
  },
};

export const CollapsedState: Story = {
  args: {
    isCollapsed: true,
  },
};
