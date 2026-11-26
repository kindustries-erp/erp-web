import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { workshopCandidatesFixture } from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopCandidatePicker } from "./GarageWorkshopCandidatePicker";

const meta: Meta<typeof GarageWorkshopCandidatePicker> = {
  title: "Core/CasesGarage/GarageWorkshopCandidatePicker",
  component: GarageWorkshopCandidatePicker,
  tags: ["autodocs"],
  args: {
    search: "51G-123",
    candidates: workshopCandidatesFixture,
    canCreate: true,
    value: null,
  },
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopCandidatePicker>;

const Controlled = (
  args: React.ComponentProps<typeof GarageWorkshopCandidatePicker>,
) => {
  const [value, setValue] = React.useState<string | null>(args.value);
  return (
    <div className="w-96 p-4">
      <GarageWorkshopCandidatePicker
        {...args}
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export const CoXe: Story = { render: (args) => <Controlled {...args} /> };
export const KhongQuyenTao: Story = {
  args: { candidates: [], canCreate: false, search: "99Z-000" },
  render: (args) => <Controlled {...args} />,
};
