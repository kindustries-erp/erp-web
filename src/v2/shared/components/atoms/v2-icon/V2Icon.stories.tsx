import type { Meta, StoryObj } from "@storybook/react";
import { V2Icon } from "./V2Icon";
import { LayoutDashboard, Car, Wallet, Boxes, Package } from "./icons";

const meta: Meta<typeof V2Icon> = {
  title: "V2/Atoms/V2Icon",
  component: V2Icon,
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "number" } },
    strokeWidth: { control: { type: "number" } },
    color: { control: { type: "color" } },
  },
};

export default meta;
type Story = StoryObj<typeof V2Icon>;

export const Default: Story = {
  args: {
    icon: LayoutDashboard,
    size: 20,
  },
};

export const CarIcon: Story = {
  args: {
    icon: Car,
    size: 24,
  },
};

export const WalletIcon: Story = {
  args: {
    icon: Wallet,
    size: 20,
  },
};

export const BoxesIcon: Story = {
  args: {
    icon: Boxes,
    size: 20,
  },
};

export const PackageIcon: Story = {
  args: {
    icon: Package,
    size: 20,
  },
};
