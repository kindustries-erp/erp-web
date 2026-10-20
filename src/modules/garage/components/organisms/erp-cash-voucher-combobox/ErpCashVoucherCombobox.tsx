import React from "react";
import { Combobox } from "@/shared/components/Combobox";
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

  return (
    <div className={className}>
      <Combobox
        value={value || ""}
        onChange={(val: string) => {
          if (onChange) onChange(val);
        }}
        options={options}
        placeholder={isLoading ? "Đang tải..." : placeholder}
        onSearch={setSearch}
        onScrollBottom={fetchNextPage}
        loading={isLoading || isFetchingNextPage}
        fallbackLabel={fallbackLabel}
      />
    </div>
  );
};
