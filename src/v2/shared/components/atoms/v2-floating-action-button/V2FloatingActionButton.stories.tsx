import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles } from "lucide-react";
import { V2FloatingActionButton } from "./V2FloatingActionButton";

const meta: Meta<typeof V2FloatingActionButton> = {
  title: "Components/Atoms/V2FloatingActionButton",
  component: V2FloatingActionButton,
  tags: ["autodocs"],
  args: { icon: <Sparkles className="h-5 w-5" />, label: "Trợ lý AI" },
};

export default meta;
type Story = StoryObj<typeof V2FloatingActionButton>;

export const IconOnly: Story = {};
export const Extended: Story = { args: { extended: true } };
