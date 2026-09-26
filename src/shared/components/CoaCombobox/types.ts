export interface CoaAccountDetail {
  id: string;
  accountCode: string;
  accountName: string;
}

export interface CoaComboboxProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  onSelectAccount?: (account: CoaAccountDetail | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  filterActiveOnly?: boolean;
}
