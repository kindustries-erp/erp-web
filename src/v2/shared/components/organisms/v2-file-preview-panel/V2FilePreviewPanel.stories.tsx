import type { Meta, StoryObj } from "@storybook/react";
import { V2FilePreviewPanel } from "./V2FilePreviewPanel";

const meta: Meta<typeof V2FilePreviewPanel> = {
  title: "Components/Organisms/Drawer/V2FilePreviewPanel",
  component: V2FilePreviewPanel,
  tags: ["autodocs"],
  args: { height: 360 },
  decorators: [
    (Story) => (
      <div className="w-[520px] p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2FilePreviewPanel>;

export const Empty: Story = { args: { file: null } };
export const Loading: Story = { args: { file: null, loading: true } };
export const Error: Story = {
  args: { file: null, error: "Không tải được tệp từ máy chủ" },
};
export const Xml: Story = {
  args: {
    file: {
      name: "HD-0001234.xml",
      text: '<?xml version="1.0" encoding="UTF-8"?>\n<HDon>\n  <SHDon>1234</SHDon>\n  <KHHDon>C26TGA</KHHDon>\n  <TgTCThue>1250000</TgTCThue>\n</HDon>',
    },
    onDownload: () => {},
  },
};
export const Unsupported: Story = {
  args: { file: { name: "bang-ke.zip" }, onDownload: () => {} },
};
