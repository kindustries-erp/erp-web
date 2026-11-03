import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { V2FormField } from "./V2FormField";
import type { V2FieldOption } from "./V2FormField.type";

const statusOptions: V2FieldOption[] = [
  { value: "ACTIVE", label: "Hoạt động" },
  { value: "INACTIVE", label: "Ngưng hoạt động" },
];

const FormDemo = ({ viewing }: { viewing: boolean }) => {
  const [code, setCode] = React.useState("NCC-001");
  const [name, setName] = React.useState("Công ty Cổ phần Liouni");
  const [status, setStatus] = React.useState("ACTIVE");
  const [amount, setAmount] = React.useState<number | null>(15000000);
  const [date, setDate] = React.useState("2026-10-30");
  const [active, setActive] = React.useState(true);
  const [notes, setNotes] = React.useState("Khách hàng ưu tiên");

  return (
    <div className="w-[450px] space-y-3 p-6 bg-surface rounded-xl border border-border">
      <V2FormField
        label="Mã đối tác"
        value={code}
        onChange={setCode}
        viewing={viewing}
        uppercase
        required
      />
      <V2FormField
        label="Tên đối tác"
        value={name}
        onChange={setName}
        viewing={viewing}
        required
      />
      <V2FormField
        label="Trạng thái"
        type="select"
        options={statusOptions}
        value={status}
        onChange={setStatus}
        viewing={viewing}
      />
      <V2FormField
        label="Hạn mức nợ"
        type="number"
        value={amount}
        onChange={setAmount}
        viewing={viewing}
      />
      <V2FormField
        label="Ngày ký hợp đồng"
        type="date"
        value={date}
        onChange={setDate}
        viewing={viewing}
      />
      <V2FormField
        label="Kích hoạt tự động"
        type="switch"
        value={active}
        onChange={setActive}
        viewing={viewing}
      />
      <V2FormField
        label="Ghi chú"
        type="textarea"
        value={notes}
        onChange={setNotes}
        viewing={viewing}
      />
    </div>
  );
};

const meta: Meta<typeof FormDemo> = {
  title: "Components/Molecules/V2FormField",
  component: FormDemo,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormDemo>;

export const Editing: Story = { args: { viewing: false } };
export const Viewing: Story = { args: { viewing: true } };
