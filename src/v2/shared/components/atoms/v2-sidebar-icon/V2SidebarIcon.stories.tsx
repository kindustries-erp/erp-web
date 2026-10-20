import type { Meta, StoryObj } from "@storybook/react";
import { FolderKanban, BarChart3, ShieldCheck, Database } from "lucide-react";
import { V2SidebarIcon } from "./V2SidebarIcon";

const meta: Meta<typeof V2SidebarIcon> = {
  title: "Components/Atoms/Display/V2SidebarIcon",
  component: V2SidebarIcon,
  tags: ["autodocs"],
  argTypes: {
    isActive: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2SidebarIcon>;

export const ActiveItem: Story = {
  args: {
    icon: FolderKanban,
    isActive: true,
  },
};

export const InactiveItem: Story = {
  args: {
    icon: BarChart3,
    isActive: false,
  },
};

export const SecurityRole: Story = {
  args: {
    icon: ShieldCheck,
    isActive: true,
  },
};

export const MasterDatabase: Story = {
  args: {
    icon: Database,
    isActive: false,
  },
};
