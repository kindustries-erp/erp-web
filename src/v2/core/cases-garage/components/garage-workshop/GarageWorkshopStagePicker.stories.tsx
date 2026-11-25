import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { stagesOf } from "../../workshop";
import { GarageWorkshopStagePicker } from "./GarageWorkshopStagePicker";

const meta: Meta<typeof GarageWorkshopStagePicker> = {
  title: "Core/CasesGarage/GarageWorkshopStagePicker",
  component: GarageWorkshopStagePicker,
  tags: ["autodocs"],
  args: { stages: stagesOf("IN_PROGRESS"), value: "PAINTING" },
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopStagePicker>;

const Controlled = (
  args: React.ComponentProps<typeof GarageWorkshopStagePicker>,
) => {
  const [value, setValue] = React.useState(args.value);
  return (
    <div className="w-80 p-4">
      <GarageWorkshopStagePicker {...args} value={value} onChange={setValue} />
    </div>
  );
};

export const DangLam: Story = { render: (args) => <Controlled {...args} /> };
export const TiepNhan: Story = {
  args: { stages: stagesOf("INTAKE"), value: "" },
  render: (args) => <Controlled {...args} />,
};
