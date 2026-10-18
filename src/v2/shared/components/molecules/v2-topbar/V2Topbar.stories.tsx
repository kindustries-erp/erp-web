import type { Meta, StoryObj } from "@storybook/react";
import { V2Topbar } from "./V2Topbar";

const meta: Meta<typeof V2Topbar> = {
  title: "Components/Molecules/Header & Account/V2Topbar",
  component: V2Topbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof V2Topbar>;

export const Default: Story = {
  args: {
    breadcrumbs: [
      { label: "Kế toán" },
      { label: "Báo cáo công nợ" },
      { label: "Tuổi nợ khách hàng" },
    ],
    branchName: "Nam Sài Gòn",
    companyName: "Liouni ERP",
  },
};

export const WithoutBranch: Story = {
  args: {
    breadcrumbs: [{ label: "Hệ thống" }, { label: "Cấu hình ứng dụng" }],
  },
};
