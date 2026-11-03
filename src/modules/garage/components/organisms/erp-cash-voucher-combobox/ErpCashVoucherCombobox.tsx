import React, { useMemo } from "react";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { ErpCashVoucherComboboxProps } from "./ErpCashVoucherCombobox.type";
import { useErpCashVoucherCombobox } from "./ErpCashVoucherCombobox.hook";

export const ErpCashVoucherCombobox: React.FC<
  ErpCashVoucherComboboxProps & { branchId?: string }
> = ({
  value,
  onChange,
  placeholder = "Chọn phiếu thu chi ERP...",
  className,
  branchId,
  fallbackLabel,
}) => {
  const { options, isLoading, isFetchingNextPage, fetchNextPage, setSearch } =
    useErpCashVoucherCombobox(branchId);

  const v2Options = useMemo(
    () =>
      options.map((item: any) => ({
        value: item.value,
        label: item.label,
        description: item.subLabel
          ? `${item.code} - ${item.subLabel}`
          : item.code,
      })),
    [options],
  );

  return (
    <div className={className}>
      <V2Combobox
        value={value || null}
        onValueChange={(val) => {
          if (onChange) onChange(val || "");
        }}
        options={v2Options}
        placeholder={isLoading ? "Đang tải..." : placeholder}
        onSearchChange={setSearch}
        onScrollBottom={fetchNextPage}
        loading={isLoading || isFetchingNextPage}
        fallbackLabel={fallbackLabel}
      />
    </div>
  );
};
