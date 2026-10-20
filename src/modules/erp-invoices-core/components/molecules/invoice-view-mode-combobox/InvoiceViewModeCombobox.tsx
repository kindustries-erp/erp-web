import React from "react";
import { ViewModeCombobox } from "@/shared/components/ViewModeCombobox";
import type { InvoiceViewModeComboboxProps } from "./InvoiceViewModeCombobox.type";

export function InvoiceViewModeCombobox<TFilter extends string = string>(
  props: InvoiceViewModeComboboxProps<TFilter>,
) {
  return <ViewModeCombobox {...props} i18nNamespace="erpInvoices" />;
}
