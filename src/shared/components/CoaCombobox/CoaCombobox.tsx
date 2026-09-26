import React from "react";
import { Combobox } from "@/shared/components/Combobox";
import { useCoaComboboxLogic } from "./hooks/useCoaComboboxLogic";
import type { CoaComboboxProps } from "./types";
import { useT } from "@/core/i18n";

export const CoaCombobox = React.memo(function CoaCombobox({
  value,
  onChange,
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

  return (
    <Combobox
      options={options}
      value={value || ""}
      onChange={(val) => onChange(val || null)}
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
