import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
  ChevronDown,
  RefreshCw,
  FileSpreadsheet,
  Trash2,
  Edit,
} from "lucide-react";
import { V2Dropdown } from "./V2Dropdown";
import type { V2DropdownGroup } from "./V2Dropdown.type";

const meta: Meta<typeof V2Dropdown> = {
  title: "Components/Molecules/Overlay & Menu/V2Dropdown",
  component: V2Dropdown,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof V2Dropdown>;

const invoiceActionGroups: V2DropdownGroup[] = [
  {
    groupLabel: "ĐỒNG BỘ",
    items: [
      {
        key: "sync-gdt",
        label: "Đồng bộ từ GDT",
        icon: <RefreshCw className="w-3.5 h-3.5" />,
        onClick: () => alert("Đang đồng bộ hóa đơn từ Tổng cục thuế..."),
      },
    ],
  },
  {
    groupLabel: "XUẤT DỮ LIỆU",
    items: [
      {
        key: "export-excel",
        label: "Xuất Excel hóa đơn",
        icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
        onClick: () => alert("Đang xuất file Excel..."),
      },
    ],
  },
];

export const DrawerActionMenu: Story = {
  render: () => (
    <div className="p-12">
      <V2Dropdown
        groups={invoiceActionGroups}
        trigger={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/70 bg-surface/80 hover:bg-surface-hover text-foreground shadow-xs transition-colors cursor-pointer"
          >
            <span>Thao tác</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-fg" />
          </button>
        }
      />
    </div>
  ),
};

export const TableRowMoreMenu: Story = {
  render: () => (
    <div className="p-12">
      <V2Dropdown
        items={[
          {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <Edit className="w-3.5 h-3.5" />,
            onClick: () => alert("Edit"),
          },
          {
            key: "delete",
            label: "Xóa bản ghi",
            variant: "danger",
            icon: <Trash2 className="w-3.5 h-3.5" />,
            onClick: () => alert("Delete"),
          },
        ]}
      />
    </div>
  ),
};
