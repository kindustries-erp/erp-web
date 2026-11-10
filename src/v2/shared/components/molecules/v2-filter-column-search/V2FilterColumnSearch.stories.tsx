import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { V2FilterColumnSearch } from "./V2FilterColumnSearch";

const meta: Meta<typeof V2FilterColumnSearch> = {
  title: "Components/Molecules/V2FilterColumnSearch",
  component: V2FilterColumnSearch,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof V2FilterColumnSearch>;

const Controlled = () => {
  const [value, setValue] = useState("");
  return <V2FilterColumnSearch value={value} onChange={setValue} />;
};

export const Empty: Story = {
  render: () => <Controlled />,
};

export const WithText: Story = {
  args: { value: "ngày", onChange: () => {} },
};
