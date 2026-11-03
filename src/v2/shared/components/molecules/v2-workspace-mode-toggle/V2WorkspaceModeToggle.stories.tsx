import type { Meta, StoryObj } from "@storybook/react";
import { V2WorkspaceModeToggle } from "./V2WorkspaceModeToggle";

const meta: Meta<typeof V2WorkspaceModeToggle> = {
  title: "Molecules/V2WorkspaceModeToggle",
  component: V2WorkspaceModeToggle,
};

export default meta;

type Story = StoryObj<typeof V2WorkspaceModeToggle>;

export const Default: Story = {
  args: { onModeChange: () => {} },
};
