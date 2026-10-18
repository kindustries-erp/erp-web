import type { Meta, StoryObj } from "@storybook/react";
import { V2BranchBadge } from "./V2BranchBadge";

const meta: Meta<typeof V2BranchBadge> = {
  title: "Components/Molecules/Header & Account/V2BranchBadge",
  component: V2BranchBadge,
  tags: ["autodocs"],
  argTypes: {
    branchName: {
      control: "text",
    },
    companyName: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2BranchBadge>;

export const Default: Story = {
  args: {
    branchName: "Chi nhánh Nam Sài Gòn",
    companyName: "Công ty Cổ phần Công nghiệp Liouni",
  },
};

export const ShortName: Story = {
  args: {
    branchName: "Kho Tổng Đào Trí",
    companyName: "Liouni Logistics",
  },
};
