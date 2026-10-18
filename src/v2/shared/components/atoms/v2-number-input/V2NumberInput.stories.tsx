import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2NumberInput } from "./V2NumberInput";

const meta: Meta<typeof V2NumberInput> = {
  title: "Components/Atoms/Forms & Inputs/V2NumberInput",
  component: V2NumberInput,
  tags: ["autodocs"],
  args: { value: null, onValueChange: () => {} },
};

export default meta;
type Story = StoryObj<typeof V2NumberInput>;

const Controlled = ({
  initial,
  ...props
}: React.ComponentProps<typeof V2NumberInput> & { initial: number | null }) => {
  const [value, setValue] = React.useState<number | null>(initial);
  return (
    <div className="w-56">
      <V2NumberInput {...props} value={value} onValueChange={setValue} />
    </div>
  );
};

export const Amount: Story = {
  render: (args) => <Controlled {...args} initial={1250000} />,
};

export const Decimals: Story = {
  render: (args) => (
    <Controlled {...args} initial={12.5} decimals={2} min={0} max={100} />
  ),
};
