import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";
import { V2Input } from "./V2Input";

const meta: Meta<typeof V2Input> = {
  title: "V2/Atoms/V2Input",
  component: V2Input,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof V2Input>;

export const Default: Story = {
  args: {
    placeholder: "Nhập văn bản...",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <V2Input sizeVariant="xs" placeholder="Size xs (h-7)" />
      <V2Input sizeVariant="sm" placeholder="Size sm (h-8)" />
      <V2Input sizeVariant="md" placeholder="Size md (h-9)" />
      <V2Input sizeVariant="lg" placeholder="Size lg (h-10)" />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <V2Input
        leftIcon={<Search className="h-4 w-4" />}
        placeholder="Tìm kiếm..."
        sizeVariant="sm"
        clearable
        defaultValue="Giá trị tìm kiếm"
      />
    </div>
  ),
};
