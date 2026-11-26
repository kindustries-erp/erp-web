import type { Meta, StoryObj } from "@storybook/react";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopCard } from "./GarageWorkshopCard";

const meta: Meta<typeof GarageWorkshopCard> = {
  title: "Core/CasesGarage/GarageWorkshopCard",
  component: GarageWorkshopCard,
  tags: ["autodocs"],
  args: { item: workshopCaseFixture(), now: WORKSHOP_FIXTURE_NOW },
  decorators: [
    (Story) => (
      <div className="w-72 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopCard>;

export const DangLam: Story = {};

export const ChuaChonCongDoan: Story = {
  args: {
    item: workshopCaseFixture({
      status: "INTAKE",
      progressStage: null,
      stageStartedAt: null,
      stageWorkerName: null,
      lastNote: null,
    }),
  },
};

export const CongDoanQuaLauTreHen: Story = {
  args: {
    item: workshopCaseFixture({
      stageStartedAt: "2026-11-23T06:00:00.000Z",
      isOverdue: true,
    }),
  },
};
