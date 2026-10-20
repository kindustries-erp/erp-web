import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2Switch } from "./V2Switch";
import type { V2SwitchProps } from "./V2Switch.type";

const meta: Meta<typeof V2Switch> = {
  title: "Components/Atoms/Forms & Inputs/V2Switch",
  component: V2Switch,
  tags: ["autodocs"],
  args: { label: "Hiển thị hóa đơn nháp" },
};

export default meta;
type Story = StoryObj<typeof V2Switch>;

const ControlledSwitch = (args: V2SwitchProps) => {
  const [on, setOn] = React.useState(false);
  return <V2Switch {...args} checked={on} onCheckedChange={setOn} />;
};

export const Default: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Controlled: Story = {
  render: (args) => <ControlledSwitch {...args} />,
};
