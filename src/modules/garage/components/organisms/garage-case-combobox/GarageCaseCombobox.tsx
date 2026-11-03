import React, { useMemo } from "react";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { GarageCaseComboboxProps } from "./GarageCaseCombobox.type";
import { useGarageCaseCombobox } from "./GarageCaseCombobox.hook";

export const GarageCaseCombobox: React.FC<GarageCaseComboboxProps> = ({
  value,
  onChange,
  placeholder = "Chọn mã phiếu dịch vụ...",
  className,
  branchId,
  fallbackLabel,
  customerCode,
  licensePlate,
  supplierId,
  partnerName,
  disabled,
}) => {
  const { options, isLoading, isFetchingNextPage, fetchNextPage, setSearch } =
    useGarageCaseCombobox({
      branchId,
      customerCode,
      licensePlate,
      supplierId,
      partnerName,
    });

  const v2Options = useMemo(
    () =>
      options.map((o: any) => ({
        ...o,
        value: o.value,
        label: o.label,
        description: o.subLabel,
        disabled: o.disabled,
      })),
    [options],
  );

  return (
    <div className={className}>
      <V2Combobox
        value={value || null}
        onValueChange={(val) => {
          if (onChange) {
            const selectedOption = options.find((o: any) => o.value === val);
            onChange(val || "", selectedOption);
          }
        }}
        options={v2Options}
        disabled={disabled}
        placeholder={isLoading ? "Đang tải..." : placeholder}
        onSearchChange={setSearch}
        onScrollBottom={fetchNextPage}
        loading={isLoading || isFetchingNextPage}
        fallbackLabel={fallbackLabel}
      />
    </div>
  );
};
