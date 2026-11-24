import type { Meta, StoryObj } from "@storybook/react";
import {
  workshopLogFixture,
  workshopWorkersFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopLogForm } from "./GarageWorkshopLogForm";

const meta: Meta<typeof GarageWorkshopLogForm> = {
  title: "Core/CasesGarage/GarageWorkshopLogForm",
  component: GarageWorkshopLogForm,
  tags: ["autodocs"],
  args: {
    status: "IN_PROGRESS",
    editing: null,
    workers: workshopWorkersFixture,
    onSubmit: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopLogForm>;

export const TaoMoi: Story = {};
export const TiepNhan: Story = { args: { status: "INTAKE" } };
export const SuaDong: Story = { args: { editing: workshopLogFixture() } };
