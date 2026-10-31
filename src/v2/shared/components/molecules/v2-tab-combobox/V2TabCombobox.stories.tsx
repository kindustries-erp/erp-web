import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LayoutDashboard, Wrench, FileSpreadsheet } from "lucide-react";
import { V2TabCombobox } from "./V2TabCombobox";
import type { V2TabComboboxItem } from "./V2TabCombobox.type";

const demoItems: V2TabComboboxItem[] = [
  {
    value: "overview",
    label: "Tổng quan",
    icon: <LayoutDashboard className="h-4 w-4" />,
    badgeCount: 5,
  },
  {
    value: "cases",
    label: "Hoạt động garage",
    icon: <Wrench className="h-4 w-4" />,
  },
  {
    value: "services",
    label: "Bảng kê phụ tùng & công",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    disabled: true,
  },
];

const meta: Meta<typeof V2TabCombobox> = {
  title: "Components/Molecules/Navigation/V2TabCombobox",
  component: V2TabCombobox,
  tags: ["autodocs"],
  args: {
    items: demoItems,
    activeKey: "overview",
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2TabCombobox>;

const Controlled = (args: React.ComponentProps<typeof V2TabCombobox>) => {
  const [activeKey, setActiveKey] = React.useState<string | undefined>(
    args.activeKey,
  );
  return (
    <V2TabCombobox
      {...args}
      activeKey={activeKey}
      onSelect={(key) => {
        setActiveKey(key);
        args.onSelect?.(key);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

export const WithCustomPrefix: Story = {
  render: (args) => <Controlled {...args} labelPrefix="Chọn phân hệ báo cáo" />,
};
