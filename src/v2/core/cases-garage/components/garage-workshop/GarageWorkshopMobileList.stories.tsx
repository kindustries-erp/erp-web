import type { Meta, StoryObj } from "@storybook/react";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopMobileList } from "./GarageWorkshopMobileList";

const meta: Meta<typeof GarageWorkshopMobileList> = {
  title: "Core/CasesGarage/GarageWorkshopMobileList",
  component: GarageWorkshopMobileList,
  tags: ["autodocs"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    now: WORKSHOP_FIXTURE_NOW,
    onOpen: () => undefined,
    items: [
      workshopCaseFixture({ id: "1" }),
      workshopCaseFixture({
        id: "2",
        licensePlate: "29C-888.88",
        progressStage: "QC",
      }),
      workshopCaseFixture({ id: "3", status: "INTAKE", progressStage: null }),
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[375px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopMobileList>;

export const DangLam: Story = {};
export const TiepNhan: Story = { args: { defaultStatus: "INTAKE" } };
