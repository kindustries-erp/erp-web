import React from "react";
import {
  ViewModeCombobox,
  type ViewModeComboboxProps,
} from "@/shared/components/ViewModeCombobox";

export type InvoiceViewModeComboboxProps = Omit<
  ViewModeComboboxProps,
  "i18nNamespace"
>;

export function InvoiceViewModeCombobox(props: InvoiceViewModeComboboxProps) {
  return <ViewModeCombobox {...props} i18nNamespace="erpInvoices" />;
}
