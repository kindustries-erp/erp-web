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

  const effectiveValue = useMemo(() => {
    if (!value) return "";
    const found = options.find((o) => o.value === value || o.code === value);
    return found ? found.value : value;
  }, [options, value]);

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
    />
  );
});
