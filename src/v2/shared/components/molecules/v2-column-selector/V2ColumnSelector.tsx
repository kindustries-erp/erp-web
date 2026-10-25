import * as React from "react";
import { V2Button, V2Stack, V2Text } from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Checkbox } from "@/v2/shared/ui/checkbox";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ColumnSelectorProps } from "./V2ColumnSelector.type";

export const V2ColumnSelector: React.FC<V2ColumnSelectorProps> = ({
  groups,
  selectedKeys,
  defaultKeys,
  onChange,
  className,
}) => {
  const { t } = useV2Translation();

  const allKeys = React.useMemo(
    () => groups.flatMap((g) => g.columns.map((c) => c.key)),
    [groups],
  );
  const selected = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);

  // Giữ thứ tự khai báo: lọc `allKeys` theo tập đang chọn sau khi đổi
  const commit = (next: Set<string>) =>
    onChange(allKeys.filter((key) => next.has(key)));

  const toggleKey = (key: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    commit(next);
  };

  const toggleGroup = (keys: string[], checked: boolean) => {
    const next = new Set(selected);
    keys.forEach((key) => (checked ? next.add(key) : next.delete(key)));
    commit(next);
  };

  return (
    <V2Stack gap="xs" className={cn("gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <V2Text variant="body-sm" className="text-muted-foreground">
          {t("v2.exportExcel.columnSelector.selectedCount", {
            defaultValue: "Đã chọn {{count}}/{{total}}",
            count: selectedKeys.length,
            total: allKeys.length,
          })}
        </V2Text>
        <div className="flex items-center gap-1">
          <V2Button
            size="xs"
            variant="ghost"
            onClick={() => commit(new Set(allKeys))}
          >
            {t("v2.exportExcel.columnSelector.selectAll", "Chọn tất cả")}
          </V2Button>
          <V2Button size="xs" variant="ghost" onClick={() => commit(new Set())}>
            {t("v2.exportExcel.columnSelector.clear", "Bỏ chọn")}
          </V2Button>
          <V2Button
            size="xs"
            variant="ghost"
            onClick={() => commit(new Set(defaultKeys))}
          >
            {t("v2.exportExcel.columnSelector.reset", "Mặc định")}
          </V2Button>
        </div>
      </div>

      {groups.map((group) => {
        const groupKeys = group.columns.map((c) => c.key);
        const count = groupKeys.filter((key) => selected.has(key)).length;
        const groupState =
          count === 0
            ? false
            : count === groupKeys.length
              ? true
              : "indeterminate";

        return (
          <V2Stack
            key={group.key}
            role="group"
            aria-label={group.label}
            gap="xs"
          >
            <V2Text asChild>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={groupState}
                  onCheckedChange={(checked) =>
                    toggleGroup(groupKeys, checked === true)
                  }
                />
                <V2Text variant="body-sm" weight="semibold">
                  {group.label}
                </V2Text>
              </label>
            </V2Text>
            <div className="grid grid-cols-1 gap-1.5 pl-6 sm:grid-cols-2">
              {group.columns.map((column) => (
                <V2Text asChild key={column.key}>
                  <label className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-surface-hover">
                    <Checkbox
                      checked={selected.has(column.key)}
                      onCheckedChange={(checked) =>
                        toggleKey(column.key, checked === true)
                      }
                    />
                    <V2Text variant="body-sm">{column.label}</V2Text>
                  </label>
                </V2Text>
              ))}
            </div>
          </V2Stack>
        );
      })}
    </V2Stack>
  );
};
