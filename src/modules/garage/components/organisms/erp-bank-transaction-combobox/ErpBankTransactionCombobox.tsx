import React from "react";
import { Combobox } from "@/shared/components/Combobox";
import { ErpBankTransactionComboboxProps } from "./ErpBankTransactionCombobox.type";
import { useErpBankTransactionCombobox } from "./ErpBankTransactionCombobox.hook";

export const ErpBankTransactionCombobox: React.FC<
  ErpBankTransactionComboboxProps
> = ({
  value,
  onChange,
  placeholder = "Chọn giao dịch ngân hàng...",
  className,
  branchId,
  fallbackLabel,
}) => {
  const { options, isLoading, isFetchingNextPage, fetchNextPage, setSearch } =
    useErpBankTransactionCombobox(branchId);

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
