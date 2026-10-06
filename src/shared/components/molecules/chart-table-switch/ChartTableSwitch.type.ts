export interface ChartTableSwitchProps {
  value: "chart" | "table";
  onChange: (val: "chart" | "table") => void;
  chartLabel?: string;
  tableLabel?: string;
  className?: string;
  disabled?: boolean;
}
