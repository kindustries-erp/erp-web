import React from "react";
import { ViewModeCombobox } from "@/shared/components/ViewModeCombobox";
import type { GarageViewModeComboboxProps } from "./GarageViewModeCombobox.type";

export function GarageViewModeCombobox<TFilter extends string = string>(
  props: GarageViewModeComboboxProps<TFilter>,
) {
  return <ViewModeCombobox {...props} i18nNamespace="garage" />;
}
