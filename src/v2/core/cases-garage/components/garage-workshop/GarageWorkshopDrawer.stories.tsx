import type { Meta, StoryObj } from "@storybook/react";
import {
  WORKSHOP_FIXTURE_NOW,
  workshopCaseFixture,
  workshopLogFixture,
  workshopWorkersFixture,
} from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopDrawer } from "./GarageWorkshopDrawer";

const done = () => Promise.resolve();

const meta: Meta<typeof GarageWorkshopDrawer> = {
  title: "Core/CasesGarage/GarageWorkshopDrawer",
  component: GarageWorkshopDrawer,
  tags: ["autodocs"],
  args: {
    open: true,
    item: workshopCaseFixture(),
    logs: [
      workshopLogFixture({
        id: "l2",
        stage: "PAINTING",
        startedAt: "2026-11-24T08:30:00.000Z",
        endedAt: null,
      }),
      workshopLogFixture(),
    ],
    now: WORKSHOP_FIXTURE_NOW,
    canEdit: true,
    workers: workshopWorkersFixture,
    onCreate: done,
    onUpdate: done,
    onRemove: done,
    onClose: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopDrawer>;

export const CoQuyenGhi: Story = {};
export const ChiXem: Story = { args: { canEdit: false } };
