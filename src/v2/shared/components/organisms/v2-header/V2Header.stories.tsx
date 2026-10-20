import type { Meta, StoryObj } from "@storybook/react";
import { V2Header } from "./V2Header";

const meta: Meta<typeof V2Header> = {
  title: "Components/Organisms/Layout Shell/V2Header",
  component: V2Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof V2Header>;

export const Default: Story = {
  args: {
    title: "Danh sách hóa đơn VAT",
    breadcrumbs: [{ label: "Kế toán" }, { label: "Hóa đơn VAT" }],
    userName: "Nguyễn Văn An",
    userRole: "Kế toán trưởng",
    tenantName: "Chi nhánh Nam Sài Gòn",
  },
};

export const SubPage: Story = {
  args: {
    title: "Chi tiết xe & Bảo hành",
    breadcrumbs: [
      { label: "Kho vận" },
      { label: "Serial xe" },
      { label: "VF9-2026-9921" },
    ],
    userName: "Trần Minh",
    userRole: "Kỹ thuật viên",
    tenantName: "Garage Đào Trí",
  },
};
