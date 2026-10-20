import { useMemo } from "react";
import type { ComboboxOption } from "@/shared/components/Combobox";
import type { CostGroupType } from "./garage-opex-drawer.type";
import { COST_GROUPS, CATEGORY_PRESETS } from "./garage-opex-drawer.constants";
import { buildPeriodOptions } from "./garage-opex-drawer.helper";

export function useOpexOptions(
  currentYear: number,
  costGroup: CostGroupType,
  t: (key: string, fallback: string) => string,
) {
  const { monthOptions, yearOptions, untilYearOptions } = useMemo(
    () => buildPeriodOptions(currentYear),
    [currentYear],
  );

  const costGroupOptions: ComboboxOption[] = useMemo(
    () =>
      COST_GROUPS.map((g) => ({
        value: g.key,
        label: t(`opex.${g.labelKey}`, g.defaultLabel),
      })),
    [t],
  );

  const categoryOptions: ComboboxOption[] = useMemo(
    () =>
      CATEGORY_PRESETS.filter((p) => p.group === costGroup).map((p) => ({
        value: p.key,
        label: t(`opex.${p.labelKey}`, p.defaultName),
      })),
    [costGroup, t],
  );

  return {
    monthOptions,
    yearOptions,
    untilYearOptions,
    costGroupOptions,
    categoryOptions,
  };
}
