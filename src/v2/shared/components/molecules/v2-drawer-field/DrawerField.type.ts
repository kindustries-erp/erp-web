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
}
