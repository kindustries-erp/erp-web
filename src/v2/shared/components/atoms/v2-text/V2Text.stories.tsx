import type { Meta, StoryObj } from "@storybook/react";
import { V2Text } from "./V2Text";

const meta: Meta<typeof V2Text> = {
  title: "V2/Atoms/V2Text",
  component: V2Text,
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
    required: {
      control: "boolean",
    },
    copyable: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof V2Text>;

export const Default: Story = {
  args: {
    children: "Văn bản Atom V2 chuẩn",
    variant: "body",
  },
};

export const RequiredFieldLabel: Story = {
  args: {
    children: "Tên nhà cung cấp",
    variant: "label",
    required: true,
  },
};

export const CopyableContractCode: Story = {
  args: {
    children: "HD-2026-09882",
    variant: "code",
    copyable: true,
  },
};

export const TruncatedOneLine: Story = {
  args: {
    children:
      "Đây là một đoạn mô tả chứng từ kho rất dài dùng để kiểm thử khả năng truncate 1 dòng khi chiều rộng container bị thu hẹp trong giao diện bảng ERP.",
    variant: "body-sm",
    truncate: true,
    className: "max-w-[280px]",
  },
};

export const MultiLineClamp: Story = {
  args: {
    children:
      "Ghi chú hóa đơn: Khách hàng yêu cầu giao xe vào sáng thứ Hai tuần tới tại kho tổng Nam Sài Gòn, vui lòng chuẩn bị sẵn biên bản nghiệm thu kỹ thuật và phiếu giao hàng 3 liên trước 8:00 AM.",
    variant: "body-sm",
    truncate: 2,
    className: "max-w-[300px]",
  },
};

export const FinancialCurrency: Story = {
  args: {
    children: "+450,000,000 ₫",
    variant: "currency",
    color: "success",
  },
};
