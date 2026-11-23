import type * as React from "react";

export interface V2MultiSelectOption {
  value: string;
  label: string;
  description?: string | null;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface V2MultiSelectProps {
  options: V2MultiSelectOption[];
  value: string[];
  /** Chuẩn callback của V2 */
  onValueChange?: (value: string[]) => void;
  /** Tương thích ngược với V1 MultiSelect */
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  maxDisplayTags?: number;
  searchable?: boolean;
  clearable?: boolean;
  "aria-label"?: string;
}
