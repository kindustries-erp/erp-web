import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Input, Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";
import type {
  V2FilterOperator,
  V2OperatorFilter,
} from "@/v2/shared/types/v2-table";
import { cn } from "@/v2/shared/utils/cn";
import {
  buildOperatorFilter,
  getDefaultOperator,
  getOperators,
  operatorNeedsRange,
  operatorNeedsValue,
  type V2OperatorGroup,
} from "./V2ColumnHeaderFilter.operators";

interface Props {
  group: V2OperatorGroup;
  /** Giá trị đang chờ áp dụng; null khi chưa có toán tử hiệu lực */
  value?: V2OperatorFilter | null;
  onChange: (filter: V2OperatorFilter | null) => void;
}

export const V2OperatorFilterField: React.FC<Props> = ({
  group,
  value,
  onChange,
}) => {
  const { t } = useV2Translation();
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [operator, setOperator] = React.useState<V2FilterOperator>(
    value?.operator ?? getDefaultOperator(group),
  );
  const [first, setFirst] = React.useState(value?.value ?? "");
  const [second, setSecond] = React.useState(value?.valueTo ?? "");
  const hadValue = React.useRef(Boolean(value));

  React.useEffect(() => {
    if (value) {
      setOperator(value.operator);
      setFirst(value.value);
      setSecond(value.valueTo ?? "");
    } else if (hadValue.current) {
      setOperator(getDefaultOperator(group));
      setFirst("");
      setSecond("");
    }
    hadValue.current = Boolean(value);
  }, [value, group]);

  const label = (op: V2FilterOperator) =>
    t(`v2.table.operators.${group}.${op}`, op);
  const commit = (op = operator, a = first, b = second) =>
    onChange(buildOperatorFilter(op, a, b));
  const inputType = group === "number" ? "number" : "text";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-fg">
        {t("v2.table.advancedFilter", "Bộ lọc nâng cao")}
      </span>
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <V2Button
            variant="outline"
            size="sm"
            className="w-full justify-between font-normal"
            rightIcon={<ChevronDown className="h-3.5 w-3.5" />}
          >
            {label(operator)}
          </V2Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg p-0"
        >
          {getOperators(group).map((op) => (
            <V2Button
              key={op}
              variant="ghost"
              className={cn(
                "h-auto w-full justify-between rounded-none px-3 py-1.5 text-xs font-normal",
                op === operator && "bg-primary/5 font-semibold text-primary",
              )}
              onClick={() => {
                setOperator(op);
                commit(op);
                setPickerOpen(false);
              }}
            >
              {label(op)}
              {op === operator && <Check className="h-3 w-3" />}
            </V2Button>
          ))}
        </PopoverContent>
      </Popover>
      {operatorNeedsValue(operator) && (
        <div className="flex items-center gap-1.5">
          <Input
            type={inputType}
            className="h-8 text-xs"
            aria-label={t("v2.table.valueLabel", "Giá trị")}
            value={first}
            onChange={(e) => {
              setFirst(e.target.value);
              commit(operator, e.target.value, second);
            }}
          />
          {operatorNeedsRange(operator) && (
            <Input
              type={inputType}
              className="h-8 text-xs"
              aria-label={t("v2.table.to", "Đến")}
              value={second}
              onChange={(e) => {
                setSecond(e.target.value);
                commit(operator, first, e.target.value);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
