import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { WorkshopCaseStatus } from "../../workshop";
import { GarageWorkshopTrackStatusPicker } from "./GarageWorkshopTrackStatusPicker";

const meta: Meta<typeof GarageWorkshopTrackStatusPicker> = {
  title: "Core/CasesGarage/GarageWorkshopTrackStatusPicker",
  component: GarageWorkshopTrackStatusPicker,
  tags: ["autodocs"],
  args: {
    value: "QUOTED",
    current: "QUOTED",
    allowed: new Set<WorkshopCaseStatus>([
      "INTAKE",
      "QUOTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]),
  },
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopTrackStatusPicker>;

const Controlled = (
  args: React.ComponentProps<typeof GarageWorkshopTrackStatusPicker>,
) => {
  const [value, setValue] = React.useState(args.value);
  return (
    <div className="w-96 p-4">
      <GarageWorkshopTrackStatusPicker
        {...args}
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export const XeKGara: Story = {
  args: { helperText: "Chỉ đổi trên ERP, trạng thái ở KGara giữ nguyên." },
  render: (args) => <Controlled {...args} />,
};
export const KhongQuyenDoi: Story = {
  args: {
    allowed: new Set<WorkshopCaseStatus>(["QUOTED"]),
    helperText: "Cần quyền sửa vụ việc garage để đổi trạng thái.",
  },
  render: (args) => <Controlled {...args} />,
};
