import React from "react";
import {
  ViewModeCombobox,
  type ViewModeComboboxProps,
} from "@/shared/components/ViewModeCombobox";

export type BankStatementViewModeComboboxProps = Omit<
  ViewModeComboboxProps,
  "i18nNamespace"
>;

export function BankStatementViewModeCombobox(
  props: BankStatementViewModeComboboxProps,
) {
  return <ViewModeCombobox {...props} i18nNamespace="common" />;
}
