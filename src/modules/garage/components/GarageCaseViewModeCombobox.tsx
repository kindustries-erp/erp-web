import React from "react";
import {
  ViewModeCombobox,
  type ViewModeComboboxProps,
} from "@/shared/components/ViewModeCombobox";

export type GarageCaseViewModeComboboxProps = Omit<
  ViewModeComboboxProps,
  "i18nNamespace"
>;

export function GarageCaseViewModeCombobox(
  props: GarageCaseViewModeComboboxProps,
) {
  return <ViewModeCombobox {...props} i18nNamespace="garage" />;
}
