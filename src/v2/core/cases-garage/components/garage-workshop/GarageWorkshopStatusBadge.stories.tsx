import type { Meta, StoryObj } from "@storybook/react";
import { WORKSHOP_STATUSES } from "../../workshop";
import { GarageWorkshopStatusBadge } from "./GarageWorkshopStatusBadge";

const meta: Meta<typeof GarageWorkshopStatusBadge> = {
  title: "Core/CasesGarage/GarageWorkshopStatusBadge",
  component: GarageWorkshopStatusBadge,
  tags: ["autodocs"],
  args: { status: "IN_PROGRESS", stage: "PAINTING" },
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopStatusBadge>;

export const MotBadge: Story = {};

/** Mọi status v2 kèm status nhỏ đầu tiên. */
export const TatCaStatus: Story = {
  render: () => (
    <div className="flex flex-col gap-2 p-4">
      {WORKSHOP_STATUSES.map((s) => (
        <GarageWorkshopStatusBadge
          key={s.key}
          status={s.key}
          stage={s.stages[0]}
        />
      ))}
    </div>
  ),
};
