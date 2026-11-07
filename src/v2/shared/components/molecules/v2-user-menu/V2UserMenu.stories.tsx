import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { V2UserMenu } from "./V2UserMenu";

const meta: Meta<typeof V2UserMenu> = {
  title: "Components/Molecules/Navigation & Sidebar/V2UserMenu",
  component: V2UserMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof V2UserMenu>;

export const Default: Story = {
  args: {
    children: (
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer text-sm font-medium"
      >
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
          AD
        </div>
        <span>Admin User</span>
      </button>
    ),
  },
};

export const AvatarOnly: Story = {
  args: {
    children: (
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold cursor-pointer">
        AD
      </div>
    ),
  },
};
