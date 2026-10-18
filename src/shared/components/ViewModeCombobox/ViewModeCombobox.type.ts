import type React from "react";
import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";

export interface ViewModeFilterItem<T extends string = string> {
  value: T;
  label: React.ReactNode;
  badge?: React.ReactNode;
  dotColor?: "emerald" | "amber" | "rose" | "blue" | "slate";
}

export interface ViewModeFilterGroup<T extends string = string> {
  title?: string;
  value: T;
  onChange: (value: T) => void;
  items: ViewModeFilterItem<T>[];
  allValue?: T;
}

export interface ViewModeComboboxProps<TFilter extends string = string> {
  presets: TableViewPreset[];
  activePresetKey: string;
  onSelect: (preset: TableViewPreset) => void;
  onCreateView: () => void;
  onEditView: (preset: TableViewPreset) => void;
  onDeleteView: (key: string) => void;
  disabled?: boolean;
  className?: string;
  i18nNamespace?: string;
  maxLabelWidthClass?: string;
  filterGroup?: ViewModeFilterGroup<TFilter>;
}
