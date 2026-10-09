import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2FileUpload } from "./V2FileUpload";

const meta: Meta<typeof V2FileUpload> = {
  title: "Components/Molecules/Forms & Inputs/V2FileUpload",
  component: V2FileUpload,
  tags: ["autodocs"],
  args: { onFilesSelected: () => {}, hint: "XML, ZIP, tối đa 20 MB" },
  decorators: [
    (Story) => (
      <div className="w-96 p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2FileUpload>;

export const Default: Story = {};

const XmlOnlyDemo = (args: React.ComponentProps<typeof V2FileUpload>) => {
  const [names, setNames] = React.useState<string[]>([]);
  return (
    <div className="flex flex-col gap-2">
      <V2FileUpload
        {...args}
        accept={[".xml", ".zip"]}
        maxSizeBytes={20 * 1024 * 1024}
        onFilesSelected={(accepted) => setNames(accepted.map((f) => f.name))}
      />
      <span className="text-sm text-muted-foreground">
        Đã chọn: {names.join(", ") || "(chưa có)"}
      </span>
    </div>
  );
};

export const XmlOnly: Story = { render: (args) => <XmlOnlyDemo {...args} /> };

export const Disabled: Story = { args: { disabled: true } };
