import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2MultiCombobox } from "./V2MultiCombobox";

const options = [
  { value: "dt", label: "Chi nhánh Đông Thành", description: "Hà Nội" },
  { value: "pq", label: "Chi nhánh Phú Quang", description: "TP.HCM" },
  { value: "cu", label: "Chi nhánh cũ", disabled: true },
];

const meta: Meta<typeof V2MultiCombobox> = {
  title: "Components/Molecules/Forms & Inputs/V2MultiCombobox",
  component: V2MultiCombobox,
  tags: ["autodocs"],
  args: {
    options,
    value: [],
    onValueChange: () => {},
    placeholder: "Chọn chi nhánh",
    clearable: true,
  },
};

export default meta;
type Story = StoryObj<typeof V2MultiCombobox>;

const Controlled = (args: React.ComponentProps<typeof V2MultiCombobox>) => {
  const [value, setValue] = React.useState<string[]>(args.value);
  return <V2MultiCombobox {...args} value={value} onValueChange={setValue} />;
};

export const Empty: Story = { render: (args) => <Controlled {...args} /> };

export const MultipleSelected: Story = {
  args: { value: ["dt", "pq"] },
  render: (args) => <Controlled {...args} />,
};

export const Disabled: Story = {
  args: { value: ["dt"], disabled: true },
};
