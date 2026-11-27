import type { Meta, StoryObj } from "@storybook/react";
import { V2PrintPreparingOverlay } from "./V2PrintPreparingOverlay";

const meta: Meta<typeof V2PrintPreparingOverlay> = {
  title: "Components/Molecules/V2PrintPreparingOverlay",
  component: V2PrintPreparingOverlay,
  tags: ["autodocs"],
  args: { open: true },
};

export default meta;
type Story = StoryObj<typeof V2PrintPreparingOverlay>;

export const Open: Story = {};

export const Closed: Story = {
  args: { open: false },
};
