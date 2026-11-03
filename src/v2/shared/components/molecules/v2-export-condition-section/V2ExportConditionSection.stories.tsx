import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { V2ExportConditionSection } from "./V2ExportConditionSection";
import type { V2ExportMode } from "./V2ExportConditionSection.type";
import type { V2ExportPeriodType } from "@/v2/shared/utils/exportPeriod";

const meta: Meta<typeof V2ExportConditionSection> = {
  title: "Components/Molecules/Forms & Inputs/V2ExportConditionSection",
  component: V2ExportConditionSection,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof V2ExportConditionSection>;

function ConditionSectionDemo() {
  const [exportMode, setExportMode] = useState<V2ExportMode>("by-period");
  const [periodType, setPeriodType] = useState<V2ExportPeriodType>("month");
  const [period, setPeriod] = useState("2026-10");
  const [quarter, setQuarter] = useState("2026-Q4");
  const [dateFrom, setDateFrom] = useState("2026-10-01");
  const [dateTo, setDateTo] = useState("2026-10-31");
  return (
    <div className="w-[420px]">
      <V2ExportConditionSection
        exportMode={exportMode}
        onExportModeChange={setExportMode}
        periodType={periodType}
        onPeriodTypeChange={setPeriodType}
        period={period}
        onPeriodChange={setPeriod}
        periodOptions={[{ value: "2026-10", label: "Tháng 10/2026" }]}
        quarter={quarter}
        onQuarterChange={setQuarter}
        quarterOptions={[{ value: "2026-Q4", label: "Quý 4/2026" }]}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        filterSummaryRows={[{ label: "Loại xe", value: "Ô tô" }]}
        filterCount={1}
        starting={false}
        onStart={() => undefined}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ConditionSectionDemo />,
};
