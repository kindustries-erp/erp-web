import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2SearchInput } from "./V2SearchInput";
import type { V2SearchInputProps } from "./V2SearchInput.type";

const meta: Meta<typeof V2SearchInput> = {
  title: "Components/Molecules/Forms & Inputs/V2SearchInput",
  component: V2SearchInput,
  tags: ["autodocs"],
  args: { onChange: () => {} },
};

export default meta;
type Story = StoryObj<typeof V2SearchInput>;

const ControlledSearch = (args: V2SearchInputProps) => {
  const [value, setValue] = React.useState("");
  return (
    <div className="flex flex-col gap-2">
      <V2SearchInput {...args} value={value} onChange={setValue} />
      <span className="text-sm text-muted-foreground">
        Đã áp dụng: {value || "(trống)"}
      </span>
    </div>
  );
};

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: { placeholder: "Tìm số hóa đơn, đối tác..." },
};

export const Controlled: Story = {
  render: (args) => <ControlledSearch {...args} />,
};
