import type { Meta, StoryObj } from "@storybook/react";
import { GarageCashflowPrintLoading } from "./GarageCashflowPrintLoading";

const meta: Meta<typeof GarageCashflowPrintLoading> = {
  title: "Modules/Garage/GarageCashflowPrintLoading",
  component: GarageCashflowPrintLoading,
  tags: ["autodocs"],
  args: { open: true },
};
export default meta;

type Story = StoryObj<typeof GarageCashflowPrintLoading>;

export const Open: Story = {};

export const Closed: Story = {
  args: { open: false },
};
