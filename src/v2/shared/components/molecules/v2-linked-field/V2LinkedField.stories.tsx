import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2LinkedField } from "./V2LinkedField";

const options = [
  { value: "b1", label: "Chi nhánh Hà Nội" },
  { value: "b2", label: "Chi nhánh Đà Nẵng" },
  { value: "b3", label: "Chi nhánh TP.HCM" },
];

const meta: Meta<typeof V2LinkedField> = {
  title: "Components/Molecules/V2LinkedField",
  component: V2LinkedField,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80 p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2LinkedField>;

const Controlled = (args: React.ComponentProps<typeof V2LinkedField>) => {
  const [fk, setFk] = React.useState<string | null>(args.fkValue);
  const [text, setText] = React.useState(args.localValue);
  return (
    <V2LinkedField
      {...args}
      fkValue={fk}
      localValue={text}
      onFkChange={setFk}
      onLocalChange={setText}
    />
  );
};

const base = {
  options,
  fkLabel: "Chi nhánh",
  localLabel: "Tên chi nhánh trên phiếu",
  fkPlaceholder: "Chọn chi nhánh",
  fkValue: null,
  localValue: "",
  onFkChange: () => {},
  onLocalChange: () => {},
};

/** Chưa chọn: chọn chi nhánh sẽ tự điền tên vào ô bên dưới. */
export const Empty: Story = {
  args: base,
  render: (args) => <Controlled {...args} />,
};

/** Đã chỉnh: tên khác nguồn, hiện nhãn, nút khôi phục và cập nhật từ nguồn. */
export const Edited: Story = {
  args: {
    ...base,
    fkValue: "b1",
    localValue: "Kho Hà Nội (tên riêng)",
    sourceValue: "Chi nhánh Hà Nội",
    onRefresh: () => new Promise((resolve) => setTimeout(resolve, 600)),
  },
  render: (args) => <Controlled {...args} />,
};

export const Disabled: Story = {
  args: {
    ...base,
    fkValue: "b2",
    localValue: "Chi nhánh Đà Nẵng",
    sourceValue: "Chi nhánh Đà Nẵng",
    disabled: true,
  },
  render: (args) => <Controlled {...args} />,
};
