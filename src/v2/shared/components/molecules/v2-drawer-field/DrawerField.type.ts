import * as React from "react";

export interface DrawerFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export interface DrawerRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  copyable?: boolean;
  copyText?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  multiline?: boolean | 2 | 3;
}

export interface DrawerRowConfig {
  key: string;
  label: React.ReactNode;
  value: React.ReactNode;
  copyable?: boolean;
  copyText?: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  multiline?: boolean | 2 | 3;
  hidden?: boolean;
}

export interface V2DrawerRowListProps {
  rows: DrawerRowConfig[];
  className?: string;
}
