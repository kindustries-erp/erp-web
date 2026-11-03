import type { Meta, StoryObj } from "@storybook/react";
import { V2ImpersonationBanner } from "./V2ImpersonationBanner";

const meta: Meta<typeof V2ImpersonationBanner> = {
  title: "Molecules/V2ImpersonationBanner",
  component: V2ImpersonationBanner,
};

export default meta;

type Story = StoryObj<typeof V2ImpersonationBanner>;

export const Default: Story = {};

export const Compact: Story = {
  args: { compact: true },
};
