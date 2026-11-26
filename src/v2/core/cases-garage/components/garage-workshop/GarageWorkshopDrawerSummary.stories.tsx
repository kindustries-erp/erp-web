import type { Meta, StoryObj } from "@storybook/react";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopDrawerSummary } from "./GarageWorkshopDrawerSummary";

const meta: Meta<typeof GarageWorkshopDrawerSummary> = {
  title: "Core/CasesGarage/GarageWorkshopDrawerSummary",
  component: GarageWorkshopDrawerSummary,
  tags: ["autodocs"],
  args: {
    item: workshopCaseFixture({ workSummary: "Sơn cản trước" }),
    now: WORKSHOP_FIXTURE_NOW,
    canEdit: true,
    canMoveStatus: true,
    onChangeStatus: () => undefined,
    onUntrack: () => undefined,
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
type Story = StoryObj<typeof GarageWorkshopDrawerSummary>;

export const CoQuyen: Story = {};
export const ChiXem: Story = {
  args: { canEdit: false, canMoveStatus: false, onChangeStatus: undefined },
};
