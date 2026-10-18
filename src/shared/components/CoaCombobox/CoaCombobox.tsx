import React, { useMemo } from "react";
import { Combobox } from "@/shared/components/Combobox";
import { useCoaComboboxLogic } from "./hooks/useCoaComboboxLogic";
import type { CoaComboboxProps } from "./types";
import { useT } from "@/core/i18n";

export const CoaCombobox = React.memo(function CoaCombobox({
  value,
  onChange,
  onSelectAccount,
  placeholder,
  disabled,
  className,
  allowClear = true,
  filterActiveOnly = true,
}: CoaComboboxProps) {
  const t = useT();
  const { options, isLoading } = useCoaComboboxLogic(filterActiveOnly);

  const defaultPlaceholder =
    placeholder ||
    t("moduleConfig.coaPlaceholder", "Chọn tài khoản kế toán...");
  const searchPlaceholder = t("common.search", "Tìm kiếm...");
  const emptyLabel = t("common.noData", "Không tìm thấy dữ liệu.");

  const trimmedValue = (value || "").trim();

  const effectiveValue = useMemo(() => {
    if (!trimmedValue) return "";
    const found = options.find(
      (o) =>
        o.value === trimmedValue ||
        (o.code && o.code.toLowerCase() === trimmedValue.toLowerCase()),
    );
    return found ? found.value : trimmedValue;
  }, [options, trimmedValue]);

  const fallbackLabel = useMemo(() => {
    if (!trimmedValue) return undefined;
    const found = options.find(
      (o) =>
        o.value === trimmedValue ||
        (o.code && o.code.toLowerCase() === trimmedValue.toLowerCase()),
    );
    if (found) return undefined;
    return trimmedValue.startsWith("TK") ? trimmedValue : `TK ${trimmedValue}`;
  }, [options, trimmedValue]);

  const handleChange = (selectedVal: string | null) => {
    const selectedOpt = options.find((o) => o.value === selectedVal);
    onChange?.(selectedVal);
    if (onSelectAccount) {
      if (selectedOpt) {
        onSelectAccount({
          id: selectedOpt.value,
          accountCode: selectedOpt.code || "",
          accountName: selectedOpt.subLabel || "",
        });
      } else {
        onSelectAccount(null);
      }
    }
  };

  return (
    <Combobox
      options={options}
      value={effectiveValue}
      onChange={handleChange}
      placeholder={defaultPlaceholder}
      searchPlaceholder={searchPlaceholder}
      emptyLabel={emptyLabel}
      disabled={disabled}
      className={className}
      allowClear={allowClear}
      loading={isLoading}
      fallbackLabel={fallbackLabel}
    />
  );
});
