import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { V2Calendar } from "./V2Calendar";
import { V2DatePicker } from "./V2DatePicker";
import { V2DateRangePicker } from "./V2DateRangePicker";
import { buildV2DatePresets } from "./V2DatePicker.helper";
import type { V2DateRangeValue } from "./V2DatePicker.type";

const meta: Meta<typeof V2DatePicker> = {
  title: "Components/Molecules/Forms & Inputs/V2DatePicker",
  component: V2DatePicker,
  tags: ["autodocs"],
  args: { value: null, onValueChange: () => {} },
  decorators: [
    (Story) => (
      <div className="w-64 p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof V2DatePicker>;

const SingleDemo = (
  props: Partial<React.ComponentProps<typeof V2DatePicker>>,
) => {
  const [value, setValue] = React.useState<string | null>("2026-01-15");
  return <V2DatePicker {...props} value={value} onValueChange={setValue} />;
};

const RangeDemo = ({ withPresets }: { withPresets?: boolean }) => {
  const [value, setValue] = React.useState<V2DateRangeValue>(
    withPresets ? {} : { from: "2026-01-05", to: "2026-01-18" },
  );
  return (
    <V2DateRangePicker
      value={value}
      onValueChange={setValue}
      clearable
      presets={
        withPresets
          ? buildV2DatePresets((_, fallback) => fallback ?? "")
          : undefined
      }
    />
  );
};

export const Single: Story = { render: () => <SingleDemo clearable /> };

export const WithLimits: Story = {
  render: () => <SingleDemo minDate="2026-01-10" maxDate="2026-01-20" />,
};

export const Range: Story = { render: () => <RangeDemo /> };

export const RangeWithPresets: Story = {
  render: () => <RangeDemo withPresets />,
};

/** Lịch hiển thị sẵn để xem kiểu dáng; thực tế lịch nằm trong popover của ô chọn ngày */
export const CalendarPreview: Story = {
  render: () => (
    <div className="flex w-max gap-8 rounded-xl border border-border bg-background p-4">
      <V2Calendar
        mode="single"
        selected={new Date(2026, 0, 15)}
        defaultMonth={new Date(2026, 0, 1)}
      />
      <V2Calendar
        mode="range"
        numberOfMonths={2}
        selected={{ from: new Date(2026, 0, 8), to: new Date(2026, 0, 18) }}
        defaultMonth={new Date(2026, 0, 1)}
      />
    </div>
  ),
};
