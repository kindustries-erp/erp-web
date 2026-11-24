import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2DateTimePicker } from "./V2DateTimePicker";

const meta: Meta<typeof V2DateTimePicker> = {
  title: "V2/Molecules/V2DateTimePicker",
  component: V2DateTimePicker,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof V2DateTimePicker>;

const Controlled = (args: React.ComponentProps<typeof V2DateTimePicker>) => {
  const [value, setValue] = React.useState(args.value);
  return (
    <div className="w-96 p-4">
      <V2DateTimePicker {...args} value={value} onValueChange={setValue} />
    </div>
  );
};

export const CoChonNhanh: Story = {
  args: {
    value: "",
    quickMinutesAgo: [0, 15, 30, 60],
    noFuture: true,
    "aria-label": "Bắt đầu lúc",
  },
  render: (args) => <Controlled {...args} />,
};
export const CoGiaTri: Story = {
  args: { value: "2026-11-24T08:30", "aria-label": "Kết thúc lúc" },
  render: (args) => <Controlled {...args} />,
};
