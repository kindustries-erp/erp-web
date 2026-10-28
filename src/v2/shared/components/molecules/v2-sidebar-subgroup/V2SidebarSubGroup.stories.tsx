import type { Meta, StoryObj } from "@storybook/react";
import {
  Shield,
  Users,
  FileText,
  Settings,
  Building2,
  Landmark,
  Banknote,
} from "lucide-react";
import { V2SidebarSubGroup } from "./V2SidebarSubGroup";

const meta: Meta<typeof V2SidebarSubGroup> = {
  title: "Components/Molecules/Navigation & Sidebar/V2SidebarSubGroup",
  component: V2SidebarSubGroup,
  tags: ["autodocs"],
  argTypes: {
    isCollapsed: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2SidebarSubGroup>;

export const ExpandedAccessControl: Story = {
  args: {
    isCollapsed: false,
    activeId: "erp-users",
    item: {
      id: "sub-access-control",
      label: "Quản lý truy cập",
      icon: Shield,
      href: "/erp-users",
      children: [
        {
          id: "erp-users",
          label: "Quản lý người dùng",
          icon: Users,
          href: "/erp-users",
        },
        {
          id: "erp-permissions-core",
          label: "Phân quyền & Vai trò",
          icon: Shield,
          href: "/erp-permissions-core",
        },
        {
          id: "erp-activity-logs",
          label: "Nhật ký hoạt động",
          icon: FileText,
          href: "/erp-activity-logs",
        },
      ],
    },
  },
};

export const CollapsedSettings: Story = {
  args: {
    isCollapsed: true,
    activeId: "settings-bank",
    item: {
      id: "sub-general-settings",
      label: "Thiết lập chung",
      icon: Settings,
      href: "/settings-branch",
      children: [
        {
          id: "settings-branch",
          label: "Danh mục Chi nhánh",
          icon: Building2,
          href: "/settings-branch",
        },
        {
          id: "settings-bank",
          label: "Danh mục Ngân hàng",
          icon: Landmark,
          href: "/settings-bank",
        },
        {
          id: "settings-cash-fund",
          label: "Danh mục Quỹ",
          icon: Banknote,
          href: "/settings-cash-fund",
        },
      ],
    },
  },
};
