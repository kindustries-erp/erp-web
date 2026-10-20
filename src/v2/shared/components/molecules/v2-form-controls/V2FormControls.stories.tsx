import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { V2ReadValue, V2TextField } from "./V2FormControls";

const Demo = ({ viewing }: { viewing: boolean }) => {
  const [value, setValue] = useState("KH-001");
  return (
    <div className="w-80 space-y-3 p-6">
      <V2TextField
        viewing={viewing}
        value={value}
        onChange={setValue}
        className="font-mono"
      />
      <V2ReadValue value={value} copy />
    </div>
  );
};

const meta: Meta<typeof Demo> = {
  title: "Components/Molecules/V2FormControls",
  component: Demo,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Demo>;

export const Editing: Story = { args: { viewing: false } };
export const Viewing: Story = { args: { viewing: true } };
