import type { Meta, StoryObj } from "@storybook/react";
import { V2CopyButton } from "./V2CopyButton";

const meta: Meta<typeof V2CopyButton> = {
  title: "Components/Atoms/Buttons & Icons/V2CopyButton",
  component: V2CopyButton,
  tags: ["autodocs"],
  args: { value: "C26TGA-1474" },
  decorators: [
    (Story) => (
      <div className="flex items-center gap-2 p-6 text-sm">
        C26TGA-1474 <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2CopyButton>;

export const Default: Story = {};
