import type { Meta, StoryObj } from "@storybook/react";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopLogFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopTimeline } from "./GarageWorkshopTimeline";

const meta: Meta<typeof GarageWorkshopTimeline> = {
  title: "Core/CasesGarage/GarageWorkshopTimeline",
  component: GarageWorkshopTimeline,
  tags: ["autodocs"],
  args: {
    now: WORKSHOP_FIXTURE_NOW,
    logs: [
      workshopLogFixture({
        id: "l2",
        stage: "PAINTING",
        startedAt: "2026-11-24T08:30:00.000Z",
        endedAt: null,
      }),
      workshopLogFixture({
        id: "l3",
        kind: "NOTE",
        stage: null,
        note: "Khách hỏi giờ giao xe",
        endedAt: null,
      }),
      workshopLogFixture(),
    ],
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
type Story = StoryObj<typeof GarageWorkshopTimeline>;

export const ChiXem: Story = {};
export const CoQuyenSua: Story = { args: { canEdit: true } };
export const Rong: Story = { args: { logs: [] } };
