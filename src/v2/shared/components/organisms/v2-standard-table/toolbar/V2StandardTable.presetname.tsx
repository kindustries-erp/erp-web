import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { Input } from "@/v2/shared/ui";

export interface V2PresetNameFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Lỗi hiện sau khi người dùng đã bấm Lưu */
  error: string | null;
  submitted: boolean;
}

/** Ô tên của hộp thoại chế độ xem và bộ lọc: nhãn bắt buộc, lỗi hiện sau lần lưu đầu */
export const V2PresetNameField: React.FC<V2PresetNameFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  error,
  submitted,
}) => {
  const shownError = submitted ? error : null;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id}>
        <V2Text variant="label" required>
          {label}
        </V2Text>
      </label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(shownError)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        autoFocus
      />
      {shownError && (
        <V2Text as="p" variant="helper" color="destructive" role="alert">
          {shownError}
        </V2Text>
      )}
    </div>
  );
};
