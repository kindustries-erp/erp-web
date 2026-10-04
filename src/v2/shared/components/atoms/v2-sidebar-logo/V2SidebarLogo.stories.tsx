import type { Meta, StoryObj } from "@storybook/react";
import { V2SidebarLogo } from "./V2SidebarLogo";

const meta: Meta<typeof V2SidebarLogo> = {
  title: "V2/Atoms/V2SidebarLogo",
  component: V2SidebarLogo,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof V2SidebarLogo>;

export const Default: Story = {};

export const CustomSize: Story = {
  args: {
    className: "h-8 w-8 min-w-[32px]",
  },
};
