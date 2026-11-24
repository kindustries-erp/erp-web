import type { Meta, StoryObj } from "@storybook/react";
import { GarageWorkshopTimeFields } from "./GarageWorkshopTimeFields";

const meta: Meta<typeof GarageWorkshopTimeFields> = {
  title: "Core/CasesGarage/GarageWorkshopTimeFields",
  component: GarageWorkshopTimeFields,
  tags: ["autodocs"],
  args: {
    startedAt: "2026-11-24T07:30",
    endedAt: "2026-11-24T09:00",
    showEnd: false,
    showHint: true,
    onChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GarageWorkshopTimeFields>;

export const TaoMoi: Story = {};
export const SuaCongDoanDaDong: Story = {
  args: { showEnd: true, showHint: false },
};
