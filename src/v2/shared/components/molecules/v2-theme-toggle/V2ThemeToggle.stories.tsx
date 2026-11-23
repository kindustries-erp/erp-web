import type { Meta, StoryObj } from "@storybook/react";
import { V2ThemeToggle } from "./V2ThemeToggle";

const meta: Meta<typeof V2ThemeToggle> = {
  title: "Components/Molecules/V2ThemeToggle",
  component: V2ThemeToggle,
  tags: ["autodocs"],
  argTypes: {
    isDark: { control: "boolean" },
    onToggle: { action: "toggled" },
  },
};

export default meta;
type Story = StoryObj<typeof V2ThemeToggle>;

export const LightMode: Story = {
  args: {
    isDark: false,
  },
};

export const DarkMode: Story = {
  args: {
    isDark: true,
  },
};
