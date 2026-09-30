import React from "react";
import { ViewModeCombobox } from "@/shared/components/ViewModeCombobox";
import type { InvoiceViewModeComboboxProps } from "./InvoiceViewModeCombobox.type";

export function InvoiceViewModeCombobox(props: InvoiceViewModeComboboxProps) {
  return <ViewModeCombobox {...props} i18nNamespace="erpInvoices" />;
}
