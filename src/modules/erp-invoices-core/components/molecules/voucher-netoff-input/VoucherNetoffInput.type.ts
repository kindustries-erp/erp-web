export interface VoucherNetoffInputProps {
  initialValue: number | "";
  maxAmount: number;
  isSelected?: boolean;
  onChange: (val: number) => void;
}

export type NetOffInputProps = VoucherNetoffInputProps;
