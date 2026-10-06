import type { Meta, StoryObj } from "@storybook/react";
import {
  LayoutDashboard,
  Boxes,
  Wrench,
  FileText,
  Settings,
} from "lucide-react";
import { V2NavIcon } from "./V2NavIcon";

const meta: Meta<typeof V2NavIcon> = {
  title: "V2/Atoms/V2NavIcon",
  component: V2NavIcon,
  tags: ["autodocs"],
  argTypes: {
    isActive: {
      control: "boolean",
    },
    size: {
      control: "number",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2NavIcon>;

export const ActiveDashboard: Story = {
  args: {
    icon: LayoutDashboard,
    isActive: true,
    size: 20,
  },
};

export const InactiveInventory: Story = {
  args: {
    icon: Boxes,
    isActive: false,
    size: 20,
  },
};

export const GarageService: Story = {
  args: {
    icon: Wrench,
    isActive: true,
    size: 20,
  },
};

export const InvoicesDocument: Story = {
  args: {
    icon: FileText,
    isActive: false,
    size: 20,
  },
};

export const SettingsIcon: Story = {
  args: {
    icon: Settings,
    isActive: false,
    size: 22,
  },
};
