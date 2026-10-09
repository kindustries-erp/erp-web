import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import {
  ColumnValueType,
  TableSortState,
  type V2DateRange,
  type V2OperatorFilter,
} from "@/v2/shared/types/v2-table";
import { V2ColumnHeaderFilter } from "./V2ColumnHeaderFilter";
import {
  V2_IDLE_OPTIONS_STATE,
  type V2FilterOptionsState,
} from "./V2ColumnHeaderFilter.type";

const meta: Meta<typeof V2ColumnHeaderFilter> = {
  title: "Components/Molecules/Table/V2ColumnHeaderFilter",
  component: V2ColumnHeaderFilter,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="h-[420px] w-72 pt-2">
        <Story />
      </div>
    ),
  ],
};
export default meta;

const READY: V2FilterOptionsState = {
  ...V2_IDLE_OPTIONS_STATE,
  status: "ready",
  options: Array.from({ length: 12 }, (_, i) => ({
    value: `v${i}`,
    label: `Giá trị ${i + 1}`,
  })),
};

const Demo = ({
  valueType = ColumnValueType.TEXT,
  optionsState = READY,
  initialSelected = [],
  label = "Mã phiếu",
}: {
  valueType?: ColumnValueType;
  optionsState?: V2FilterOptionsState;
  initialSelected?: string[];
  label?: string;
}) => {
  const [sort, setSort] = useState(TableSortState.NONE);
  const [selected, setSelected] = useState(initialSelected);
  const [search, setSearch] = useState("");
  const [operator, setOperator] = useState<V2OperatorFilter | undefined>();
  const [dateRange, setDateRange] = useState<V2DateRange | undefined>();
  return (
    <V2ColumnHeaderFilter
      columnKey="demo"
      label={label}
      valueType={valueType}
      sort={sort}
      onSortChange={setSort}
      selected={selected}
      onSelectedChange={setSelected}
      search={search}
      onSearchChange={setSearch}
      operator={operator}
      onOperatorChange={(f) => setOperator(f ?? undefined)}
      dateRange={dateRange}
      onDateRangeChange={(r) => setDateRange(r ?? undefined)}
      onClear={() => {
        setSelected([]);
        setSearch("");
        setOperator(undefined);
        setDateRange(undefined);
      }}
      optionsState={optionsState}
    />
  );
};

export const Text = () => <Demo />;
export const NumberColumn = () => (
  <Demo valueType={ColumnValueType.NUMBER} label="Thành tiền" />
);
export const DateColumn = () => (
  <Demo valueType={ColumnValueType.DATE} label="Ngày HĐ" />
);
export const Status = () => (
  <Demo valueType={ColumnValueType.STATUS} label="Trạng thái" />
);
export const WithActiveFilter = () => <Demo initialSelected={["v1", "v2"]} />;
export const LoadingOptions = () => (
  <Demo optionsState={{ ...V2_IDLE_OPTIONS_STATE, status: "loading" }} />
);
export const ErrorOptions = () => (
  <Demo optionsState={{ ...V2_IDLE_OPTIONS_STATE, status: "error" }} />
);
export const EmptyOptions = () => (
  <Demo optionsState={{ ...V2_IDLE_OPTIONS_STATE, status: "ready" }} />
);
export const InfiniteScroll = () => (
  <Demo optionsState={{ ...READY, hasNextPage: true, onLoadMore: () => {} }} />
);
