import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { WorkshopCaseStatus } from "../../workshop";
import { GarageWorkshopStatusSelect } from "./GarageWorkshopStatusSelect";

const meta: Meta<typeof GarageWorkshopStatusSelect> = {
  title: "Core/CasesGarage/GarageWorkshopStatusSelect",
  component: GarageWorkshopStatusSelect,
  tags: ["autodocs"],
  args: { status: "QUOTED", origin: "NATIVE", canChangeStatus: true },
};
export default meta;
type Story = StoryObj<typeof GarageWorkshopStatusSelect>;

const Controlled = (
  args: React.ComponentProps<typeof GarageWorkshopStatusSelect>,
) => {
  const [status, setStatus] = React.useState<WorkshopCaseStatus>(args.status);
  return (
    <div className="w-80 p-4">
      <GarageWorkshopStatusSelect
        {...args}
        status={status}
        onChange={setStatus}
      />
    </div>
  );
};

export const XeERP: Story = { render: (args) => <Controlled {...args} /> };
export const XeKGara: Story = {
  args: { origin: "KGARA_SYNC" },
  render: (args) => <Controlled {...args} />,
};
export const KhongQuyen: Story = {
  args: { canChangeStatus: false },
  render: (args) => <Controlled {...args} />,
};
