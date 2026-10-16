export interface CashflowAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}
