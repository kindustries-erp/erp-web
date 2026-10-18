import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Wrench } from "lucide-react";
import { V2RightPanel } from "./V2RightPanel";

const meta: Meta<typeof V2RightPanel> = {
  title: "Components/Organisms/Layout Shell/V2RightPanel",
  component: V2RightPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof V2RightPanel>;

export const Default: Story = {
  args: {
    breadcrumbs: [{ label: "Kế toán" }, { label: "Hóa đơn VAT" }],
    branchName: "Chi nhánh Nam Sài Gòn",
    companyName: "Liouni ERP",
    tabs: [
      {
        id: "invoices",
        label: "Hóa đơn VAT",
        icon: FileText,
        isClosable: true,
      },
      {
        id: "garage",
        label: "Dịch vụ Garage",
        icon: Wrench,
        isClosable: true,
      },
    ],
    activeTabId: "invoices",
    children: (
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nội dung trang V2 (Main Content Card)
          </h3>
          <p className="text-sm text-muted-fg leading-relaxed">
            Đây là khu vực hiển thị bảng dữ liệu, bộ lọc hoặc nội dung nghiệp vụ
            được bọc trong V2RightPanel card container.
          </p>
        </div>
      </div>
    ),
  },
};
