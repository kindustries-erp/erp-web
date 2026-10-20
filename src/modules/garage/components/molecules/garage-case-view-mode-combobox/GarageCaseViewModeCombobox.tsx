import React from "react";
import { ViewModeCombobox } from "@/shared/components/ViewModeCombobox";
import type { GarageCaseViewModeComboboxProps } from "./GarageCaseViewModeCombobox.type";

export function GarageCaseViewModeCombobox<TFilter extends string = string>(
  props: GarageCaseViewModeComboboxProps<TFilter>,
) {
  return <ViewModeCombobox {...props} i18nNamespace="garage" />;
}
