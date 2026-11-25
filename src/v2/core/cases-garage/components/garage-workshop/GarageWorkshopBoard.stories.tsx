import type { Meta, StoryObj } from "@storybook/react";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopBoard } from "./GarageWorkshopBoard";

const items = [
  workshopCaseFixture({
    id: "1",
    licensePlate: "30A-111.11",
    status: "INTAKE",
    progressStage: "AWAITING_INSPECTION",
  }),
  workshopCaseFixture({
    id: "2",
    licensePlate: "30A-222.22",
    status: "QUOTED",
    progressStage: "AWAITING_APPROVAL",
  }),
  workshopCaseFixture({ id: "3", licensePlate: "30A-333.33" }),
  workshopCaseFixture({
    id: "4",
    licensePlate: "30A-444.44",
    progressStage: "WAITING_PARTS",
    stageStartedAt: "2026-11-23T08:00:00.000Z",
  }),
  workshopCaseFixture({
    id: "5",
    licensePlate: "30A-555.55",
    status: "COMPLETED",
    progressStage: "AWAITING_PAYMENT",
  }),
];

const meta: Meta<typeof GarageWorkshopBoard> = {
  title: "Core/CasesGarage/GarageWorkshopBoard",
  component: GarageWorkshopBoard,
  tags: ["autodocs"],
  args: {
    items,
    now: WORKSHOP_FIXTURE_NOW,
    canMoveStatus: true,
    onOpen: () => undefined,
    onMoveStatus: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="h-[640px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopBoard>;

export const QuanDoc: Story = {};
export const NhanVienXuong: Story = { args: { canMoveStatus: false } };
