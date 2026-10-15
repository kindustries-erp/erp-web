import React from "react";
import { ViewModeCombobox } from "@/shared/components/ViewModeCombobox";
import type { BankStatementViewModeComboboxProps } from "./BankStatementViewModeCombobox.type";

export function BankStatementViewModeCombobox<TFilter extends string = string>(
  props: BankStatementViewModeComboboxProps<TFilter>,
) {
  return <ViewModeCombobox {...props} i18nNamespace="common" />;
}
