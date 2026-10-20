import type { Meta, StoryObj } from "@storybook/react";
import { V2Skeleton } from "./V2Skeleton";

const meta: Meta<typeof V2Skeleton> = {
  title: "Components/Atoms/Display/V2Skeleton",
  component: V2Skeleton,
  tags: ["autodocs"],
  args: { className: "h-4 w-48" },
};

export default meta;
type Story = StoryObj<typeof V2Skeleton>;

export const Line: Story = {};
export const Block: Story = { args: { className: "h-24 w-full" } };
