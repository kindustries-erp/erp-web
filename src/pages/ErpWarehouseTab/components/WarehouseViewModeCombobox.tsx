import React from "react";
import {
  ViewModeCombobox,
  type ViewModeComboboxProps,
} from "@/shared/components/ViewModeCombobox";

export type WarehouseViewModeComboboxProps = Omit<
  ViewModeComboboxProps,
  "i18nNamespace"
>;

export function WarehouseViewModeCombobox(
  props: WarehouseViewModeComboboxProps,
) {
  return <ViewModeCombobox {...props} i18nNamespace="common" />;
}
