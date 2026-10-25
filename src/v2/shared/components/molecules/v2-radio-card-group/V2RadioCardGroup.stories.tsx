import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { V2RadioCardGroup } from "./V2RadioCardGroup";

const meta: Meta<typeof V2RadioCardGroup> = {
  title: "Components/Molecules/Forms & Inputs/V2RadioCardGroup",
  component: V2RadioCardGroup,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof V2RadioCardGroup>;

function ExportModeDemo() {
  const [value, setValue] = useState<"by-period" | "by-current-filter">(
    "by-period",
  );
  return (
    <div className="w-[360px]">
      <V2RadioCardGroup
        name="story-export-mode"
        ariaLabel="Chế độ xuất dữ liệu"
        options={[
          {
            value: "by-period",
            label: "Theo kỳ",
            description: "Chọn khoảng thời gian theo kỳ",
          },
          {
            value: "by-current-filter",
            label: "Theo filter hiện tại",
            description: "Giữ bộ lọc đang xem",
          },
        ]}
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}

export const ExportMode: Story = {
  render: () => <ExportModeDemo />,
};
