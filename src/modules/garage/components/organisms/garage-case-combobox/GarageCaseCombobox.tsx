import React from "react";
import { Combobox } from "@/shared/components/Combobox";
import { GarageCaseComboboxProps } from "./GarageCaseCombobox.type";
import { useGarageCaseCombobox } from "./GarageCaseCombobox.hook";

export const GarageCaseCombobox: React.FC<GarageCaseComboboxProps> = ({
  value,
  onChange,
  placeholder = "Chọn mã phiếu dịch vụ...",
  className,
  branchId,
  fallbackLabel,
}) => {
  const { options, isLoading, isFetchingNextPage, fetchNextPage, setSearch } =
    useGarageCaseCombobox(branchId);

  return (
    <div className={className}>
      <Combobox
        value={value || ""}
        onChange={(val: string) => {
          if (onChange) {
            const selectedOption = options.find((o: any) => o.value === val);
            onChange(val, selectedOption);
          }
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
