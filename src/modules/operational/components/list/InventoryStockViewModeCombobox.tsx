import React from "react";
import {
  ViewModeCombobox,
  type ViewModeComboboxProps,
} from "@/shared/components/ViewModeCombobox";

export type InventoryStockViewModeComboboxProps = Omit<
  ViewModeComboboxProps,
  "i18nNamespace"
>;

export function InventoryStockViewModeCombobox(
  props: InventoryStockViewModeComboboxProps,
) {
  return <ViewModeCombobox {...props} i18nNamespace="common" />;
}
