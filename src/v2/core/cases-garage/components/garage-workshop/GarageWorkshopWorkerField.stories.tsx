import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { workshopWorkersFixture } from "../../workshop/garageWorkshop.fixtures";
import {
  GarageWorkshopWorkerField,
  type WorkshopWorkerValue,
} from "./GarageWorkshopWorkerField";

const meta: Meta<typeof GarageWorkshopWorkerField> = {
  title: "Core/CasesGarage/GarageWorkshopWorkerField",
  component: GarageWorkshopWorkerField,
  tags: ["autodocs"],
  args: {
    workers: workshopWorkersFixture,
    workerId: "e1",
    workerName: "Thợ A",
  },
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopWorkerField>;

const Controlled = (
  args: React.ComponentProps<typeof GarageWorkshopWorkerField>,
) => {
  const [v, setV] = React.useState<WorkshopWorkerValue>({
    workerId: args.workerId,
    workerName: args.workerName,
  });
  return (
    <div className="w-80 p-4">
      <GarageWorkshopWorkerField {...args} {...v} onChange={setV} />
    </div>
  );
};

export const ChonNhanVien: Story = {
  render: (args) => <Controlled {...args} />,
};
export const NguoiNgoaiDanhSach: Story = {
  args: { workerId: null, workerName: "Thợ thuê ngoài" },
  render: (args) => <Controlled {...args} />,
};
