import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Wrench, Package } from "lucide-react";
import { V2TabItem } from "./V2TabItem";

const meta: Meta<typeof V2TabItem> = {
  title: "V2/Molecules/V2TabItem",
  component: V2TabItem,
  tags: ["autodocs"],
  argTypes: {
    isActive: {
      control: "boolean",
    },
    isClosable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2TabItem>;

export const ActiveTab: Story = {
  args: {
    id: "tab-invoices",
    label: "Hóa đơn VAT",
    icon: FileText,
    isActive: true,
    isClosable: true,
  },
};

export const InactiveTab: Story = {
  args: {
    id: "tab-garage",
    label: "Phiếu sửa chữa Garage",
    icon: Wrench,
    isActive: false,
    isClosable: true,
  },
};

export const NonClosablePinnedTab: Story = {
  args: {
    id: "tab-inventory",
    label: "Tồn kho thực tế",
    icon: Package,
    isActive: false,
    isClosable: false,
  },
};
