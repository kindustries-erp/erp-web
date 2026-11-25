import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2TimePicker } from "./V2TimePicker";

const meta: Meta<typeof V2TimePicker> = {
  title: "V2/Molecules/V2TimePicker",
  component: V2TimePicker,
};
export default meta;
type Story = StoryObj<typeof V2TimePicker>;

const Controlled = (
  props: Partial<React.ComponentProps<typeof V2TimePicker>>,
) => {
  const [value, setValue] = React.useState(props.value ?? "08:30");
  return (
    <div className="w-40">
      <V2TimePicker {...props} value={value} onValueChange={setValue} />
    </div>
  );
};

export const Default: Story = { render: () => <Controlled /> };
export const Empty: Story = { render: () => <Controlled value="" /> };
export const MaxTime: Story = {
  render: () => <Controlled value="10:00" maxTime="10:30" />,
};
export const Step15: Story = {
  render: () => <Controlled minuteStep={15} />,
};
export const Disabled: Story = { render: () => <Controlled disabled /> };
