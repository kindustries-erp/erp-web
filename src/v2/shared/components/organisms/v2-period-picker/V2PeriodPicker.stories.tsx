import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { V2PeriodPicker } from "./V2PeriodPicker";
import type { V2PeriodUnit } from "./V2PeriodPicker.type";

const meta: Meta<typeof V2PeriodPicker> = {
  title: "Components/Molecules/Form & Input/V2PeriodPicker",
  component: V2PeriodPicker,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof V2PeriodPicker>;

const MONTH_OPTIONS = [
  { value: "2026-10", label: "Tháng 10/2026" },
  { value: "2026-09", label: "Tháng 9/2026" },
];

const Demo = () => {
  const [unit, setUnit] = useState<V2PeriodUnit>("month");
  const [period, setPeriod] = useState("2026-10");
  const [dateFrom, setDateFrom] = useState("2026-10-01");
  const [dateTo, setDateTo] = useState("2026-10-31");
  return (
    <div className="w-[420px]">
      <V2PeriodPicker
        unit={unit}
        onUnitChange={setUnit}
        period={period}
        onPeriodChange={setPeriod}
        periodOptions={MONTH_OPTIONS}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
      />
    </div>
  );
};

export const Default: Story = { render: () => <Demo /> };
