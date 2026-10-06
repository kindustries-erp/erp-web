import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./text";

const meta: Meta<typeof Text> = {
  title: "V2/UI Primitives/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "body",
        "body-sm",
        "caption",
        "label",
        "helper",
        "code",
        "numeric",
        "currency",
        "link",
      ],
    },
    color: {
      control: "select",
      options: [
        "default",
        "muted",
        "faint",
        "primary",
        "success",
        "warning",
        "destructive",
      ],
    },
    weight: {
      control: "select",
      options: ["normal", "medium", "semibold", "bold"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Heading1: Story = {
  args: {
    children: "Tiêu đề trang lớn H1",
    variant: "h1",
  },
};

export const Heading2: Story = {
  args: {
    children: "Tiêu đề nhóm H2",
    variant: "h2",
  },
};

export const Body: Story = {
  args: {
    children: "Nội dung văn bản hiển thị tiêu chuẩn trong ứng dụng ERP.",
    variant: "body",
  },
};

export const Code: Story = {
  args: {
    children: "const user = authStore.getState();",
    variant: "code",
  },
};

export const NumericCurrency: Story = {
  args: {
    children: "125,500,000 ₫",
    variant: "currency",
    color: "success",
  },
};

export const MutedHelper: Story = {
  args: {
    children: "Nhập mã số thuế doanh nghiệp 10 hoặc 13 chữ số.",
    variant: "helper",
  },
};
