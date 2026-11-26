import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { workshopCandidatesFixture } from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopAddVehicleModal } from "./GarageWorkshopAddVehicleModal";

const meta: Meta<typeof GarageWorkshopAddVehicleModal> = {
  title: "Core/CasesGarage/GarageWorkshopAddVehicleModal",
  component: GarageWorkshopAddVehicleModal,
  tags: ["autodocs"],
  args: {
    open: true,
    candidates: workshopCandidatesFixture,
    canCreate: true,
    canChangeStatus: true,
    onSubmit: async () => undefined,
    onClose: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopAddVehicleModal>;

const Controlled = (
  args: React.ComponentProps<typeof GarageWorkshopAddVehicleModal>,
) => {
  const [search, setSearch] = React.useState("51G-123");
  return (
    <GarageWorkshopAddVehicleModal
      {...args}
      search={search}
      onSearchChange={setSearch}
    />
  );
};

export const TimXe: Story = { render: (args) => <Controlled {...args} /> };
export const KhongQuyenTaoVaDoi: Story = {
  args: { canCreate: false, canChangeStatus: false },
  render: (args) => <Controlled {...args} />,
};
