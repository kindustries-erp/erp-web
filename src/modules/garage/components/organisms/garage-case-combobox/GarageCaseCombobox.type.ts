import type React from "react";

export interface GarageCaseComboboxProps {
  value?: string;
  onChange?: (value: string, selectedOption?: any) => void;
  placeholder?: string;
  className?: string;
  branchId?: string;
  fallbackLabel?: string;
  fallbackTooltipContent?: React.ReactNode;
  customerCode?: string;
  licensePlate?: string;
  supplierId?: string;
  partnerName?: string;
  disabled?: boolean;
  variant?: "default" | "spreadsheet" | "ghost" | "v2";
}
