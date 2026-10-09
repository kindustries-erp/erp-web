import type { Meta, StoryObj } from "@storybook/react";
import { V2Sparkline } from "./V2Sparkline";

const meta: Meta<typeof V2Sparkline> = {
  title: "Components/Atoms/Display/V2Sparkline",
  component: V2Sparkline,
  tags: ["autodocs"],
  args: {
    values: [12, 14, 11, 16, 15, 19, 18, 23, 21, 26, 24, 30],
    ariaLabel: "Doanh thu 12 kỳ",
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
type Story = StoryObj<typeof V2Sparkline>;

export const Default: Story = {};
export const Accent: Story = { args: { color: "#1baf7a" } };
export const Flat: Story = { args: { values: [5, 5, 5, 5] } };
