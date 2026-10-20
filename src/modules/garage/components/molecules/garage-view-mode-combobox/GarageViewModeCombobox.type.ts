import type { ViewModeComboboxProps } from "@/shared/components/ViewModeCombobox";

export type GarageViewModeComboboxProps<TFilter extends string = string> = Omit<
  ViewModeComboboxProps<TFilter>,
  "i18nNamespace"
>;
