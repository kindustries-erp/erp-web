import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { BranchLinkOption } from "../../../api/procurementLookups";
import { ProcurementBranchLinkedField } from "./ProcurementBranchLinkedField";

const BRANCHES: BranchLinkOption[] = [
  { value: "b1", label: "HN — Chi nhánh Hà Nội", name: "Chi nhánh Hà Nội" },
  { value: "b2", label: "DN — Chi nhánh Đà Nẵng", name: "Chi nhánh Đà Nẵng" },
];

/** Nạp sẵn danh sách chi nhánh vào cache để story không gọi API. */
const seeded = () => {
  const client = new QueryClient();
  client.setQueryData(["v2-procurement", "branch-link-options"], BRANCHES);
  return client;
};

const meta: Meta<typeof ProcurementBranchLinkedField> = {
  title: "Core/Procurement/ProcurementBranchLinkedField",
  component: ProcurementBranchLinkedField,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={seeded()}>
        <div className="w-80 p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProcurementBranchLinkedField>;

const Controlled = (
  args: React.ComponentProps<typeof ProcurementBranchLinkedField>,
) => {
  const [id, setId] = React.useState(args.branchId);
  const [name, setName] = React.useState(args.branchName);
  return (
    <ProcurementBranchLinkedField
      {...args}
      branchId={id}
      branchName={name}
      onBranchIdChange={setId}
      onBranchNameChange={setName}
    />
  );
};

/** Chưa chọn chi nhánh. */
export const Empty: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    branchId: "",
    branchName: "",
    link: { sourceValue: undefined, overridden: false },
  },
};

/** Tên trên phiếu đã sửa khác chi nhánh gốc: hiện "Đã chỉnh", "Gốc: …" và nút khôi phục. */
export const Edited: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    branchId: "b1",
    branchName: "Hà Nội (tên riêng)",
    link: { sourceValue: "Chi nhánh Hà Nội", overridden: true },
  },
};

/** Phiếu đã lưu: có nút "Cập nhật từ nguồn". */
export const CanRefresh: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    branchId: "b2",
    branchName: "Chi nhánh Đà Nẵng",
    link: {
      sourceValue: "Chi nhánh Đà Nẵng",
      overridden: false,
      onRefresh: async () => undefined,
    },
  },
};

/** Khóa (không sửa được). */
export const Disabled: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    branchId: "b1",
    branchName: "Chi nhánh Hà Nội",
    disabled: true,
    link: { sourceValue: "Chi nhánh Hà Nội", overridden: false },
  },
};
