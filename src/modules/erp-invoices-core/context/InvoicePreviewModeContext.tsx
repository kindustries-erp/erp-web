import { createContext, useContext } from "react";

export type InvoiceDetailViewMode = "template" | "pdf";

export interface InvoicePreviewModeContextValue {
  previewMode: InvoiceDetailViewMode;
  setPreviewMode: (mode: InvoiceDetailViewMode) => void;
  hasPdf: boolean;
}

export const InvoicePreviewModeContext =
  createContext<InvoicePreviewModeContextValue | null>(null);

export function useInvoicePreviewMode() {
  return useContext(InvoicePreviewModeContext);
}
