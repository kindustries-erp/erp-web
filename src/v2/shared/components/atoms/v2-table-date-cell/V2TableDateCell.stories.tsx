import type { Meta } from "@storybook/react";
import React from "react";
import { V2TableDateCell } from "./V2TableDateCell";

const meta: Meta<typeof V2TableDateCell> = {
  title: "V2/Atoms/V2TableDateCell",
  component: V2TableDateCell,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-32 text-xs">
        <Story />
      </div>
    ),
  ],
};
export default meta;

export const WithTime = () => <V2TableDateCell date="2026-10-07T14:35:00" />;
export const DateOnly = () => <V2TableDateCell date="2026-10-07" />;
export const FromTimestamp = () => <V2TableDateCell date={1790000000000} />;
export const Empty = () => <V2TableDateCell date={null} />;
