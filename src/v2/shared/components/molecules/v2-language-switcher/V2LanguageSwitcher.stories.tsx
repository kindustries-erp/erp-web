import type { Meta, StoryObj } from "@storybook/react";
import { V2LanguageSwitcher } from "./V2LanguageSwitcher";

const meta: Meta<typeof V2LanguageSwitcher> = {
  title: "V2/Molecules/V2LanguageSwitcher",
  component: V2LanguageSwitcher,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2LanguageSwitcher>;

export const Default: Story = {
  args: {
    size: "default",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};
