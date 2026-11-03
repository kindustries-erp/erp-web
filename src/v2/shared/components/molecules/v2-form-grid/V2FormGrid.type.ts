import type * as React from "react";
import type {
  V2FormFieldProps,
  V2FormFieldTypeInput,
  V2FieldOption,
  V2FormFieldViewModeInput,
  V2FieldOrientationInput,
} from "../v2-form-field";

export interface V2FormFieldConfig<T = any> {
  name: keyof T & string;
  label: string;
  type?: V2FormFieldTypeInput;
  required?: boolean;
  disabled?: boolean | ((values: T) => boolean);
  readOnly?: boolean;
  colSpan?: 1 | 2;
  placeholder?: string;
  options?: V2FieldOption[];
  copyable?: boolean;
  uppercase?: boolean;
  decimals?: number;
  min?: number;
  max?: number;
  rows?: number;
  prefixSlot?: React.ReactNode;
  suffixSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  helperText?: React.ReactNode | ((values: T) => React.ReactNode);
  error?: React.ReactNode | ((values: T) => React.ReactNode);
  viewMode?: V2FormFieldViewModeInput;
  orientation?: V2FieldOrientationInput;
  className?: string;
  /** Render tuỳ biến chỉ khi ở chế độ xem (View Mode) */
  renderView?: (
    props: V2FormFieldProps,
    displayValue: string,
    values: T,
  ) => React.ReactNode;
  /** Render điều khiển tuỳ biến khi ở chế độ sửa (Edit Mode) */
  renderEdit?: (
    props: V2FormFieldProps,
    onChange: (val: any) => void,
    values: T,
  ) => React.ReactNode;
  /** Điều kiện ẩn/hiện trường */
  visible?: (values: T, mode: "view" | "edit") => boolean;
}

export interface V2FormGridProps<T = Record<string, any>> {
  fields: V2FormFieldConfig<T>[];
  values: T;
  onChange?: (name: keyof T & string, value: any) => void;
  viewing?: boolean;
  className?: string;
  gridClassName?: string;
}
