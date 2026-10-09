import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2Combobox } from "./V2Combobox";

const options = [
  { value: "overview", label: "Tổng quan" },
  {
    value: "audit",
    label: "Kiểm toán / Đối soát",
    description: "Chế độ xem mặc định",
  },
  { value: "custom", label: "Tùy chỉnh của tôi" },
  { value: "archived", label: "Đã lưu trữ", disabled: true },
];

const meta: Meta<typeof V2Combobox> = {
  title: "Components/Molecules/Forms & Inputs/V2Combobox",
  component: V2Combobox,
  tags: ["autodocs"],
  args: {
    options,
    value: null,
    onValueChange: () => {},
    placeholder: "Chọn chế độ xem",
  },
  decorators: [
    (Story) => (
      <div className="w-64 p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2Combobox>;

const Controlled = (args: React.ComponentProps<typeof V2Combobox>) => {
  const [value, setValue] = React.useState<string | null>(args.value);
  return <V2Combobox {...args} value={value} onValueChange={setValue} />;
};

export const Default: Story = { render: (args) => <Controlled {...args} /> };
export const Clearable: Story = {
  render: (args) => <Controlled {...args} value="audit" clearable />,
};
export const WithoutSearch: Story = {
  render: (args) => <Controlled {...args} searchable={false} />,
};
export const Disabled: Story = { args: { disabled: true } };
