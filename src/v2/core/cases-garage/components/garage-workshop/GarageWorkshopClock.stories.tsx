import type { Meta, StoryObj } from "@storybook/react";
import { WORKSHOP_FIXTURE_NOW } from "../../workshop/garageWorkshop.fixtures";
import { GarageWorkshopClock } from "./GarageWorkshopClock";

const meta: Meta<typeof GarageWorkshopClock> = {
  title: "Core/CasesGarage/GarageWorkshopClock",
  component: GarageWorkshopClock,
  tags: ["autodocs"],
  args: { now: WORKSHOP_FIXTURE_NOW, startedAt: "2026-11-24T08:30:00.000Z" },
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopClock>;

export const BinhThuong: Story = {};
export const CanhBao8Gio: Story = {
  args: { startedAt: "2026-11-24T01:00:00.000Z" },
};
export const NghiemTrong24Gio: Story = {
  args: { startedAt: "2026-11-22T10:00:00.000Z" },
};
