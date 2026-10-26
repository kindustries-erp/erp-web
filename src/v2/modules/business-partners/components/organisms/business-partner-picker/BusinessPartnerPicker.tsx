import * as React from "react";
import {
  V2Combobox,
  type V2ComboboxOption,
} from "@/v2/shared/components/molecules/v2-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useBusinessPartnerSelectOptionsQuery } from "../../../api/queries/useBusinessPartnerSelectOptionsQuery";
import {
  toPartnerOptionValue,
  type PartnerSelectionItem,
} from "../../../domain/rules/partnerSelection";
import type { BusinessPartnerPickerProps } from "./BusinessPartnerPicker.type";

const toOption = (
  item: PartnerSelectionItem & { code?: string | null },
  fromInvoiceLabel: string,
): V2ComboboxOption => ({
  value: toPartnerOptionValue(item),
  label: item.name,
  description:
    item.source === "INVOICE"
      ? [item.taxCode, fromInvoiceLabel].filter(Boolean).join(" · ")
      : [item.code, item.taxCode].filter(Boolean).join(" · ") || undefined,
});

/**
 * Chọn Đối tượng cho sao kê: đối tác trong danh mục và người mua/bán từ hóa đơn.
 * Tìm trên server; giá trị chọn được mã hóa để tách đối tác có sẵn và đối tác cần tạo.
 */
export const BusinessPartnerPicker: React.FC<BusinessPartnerPickerProps> = ({
  direction,
  value,
  selectedLabel,
  onValueChange,
  disabled = false,
  className,
}) => {
  const { t } = useV2Translation();
  const [search, setSearch] = React.useState("");
  const query = useBusinessPartnerSelectOptionsQuery(direction, search);

  const fromInvoiceLabel = t("v2.partners.picker.fromInvoice", "Từ hóa đơn");
  const fetched = (query.data?.items ?? []).map((item) =>
    toOption(item, fromInvoiceLabel),
  );

  // Giữ lựa chọn hiện tại trong danh sách dù kết quả tìm kiếm không còn chứa nó
  const options =
    value && selectedLabel && !fetched.some((o) => o.value === value)
      ? [{ value, label: selectedLabel }, ...fetched]
      : fetched;

  return (
    <div className={className}>
      <V2Combobox
        options={options}
        value={value}
        onValueChange={(next) => {
          const picked = options.find((o) => o.value === next);
          onValueChange(next, picked?.label ?? null);
        }}
        onSearchChange={setSearch}
        loading={query.isFetching}
        clearable
        disabled={disabled}
        placeholder={t("v2.partners.picker.placeholder", "Chọn đối tượng...")}
        searchPlaceholder={t(
          "v2.partners.picker.searchPlaceholder",
          "Tìm theo tên hoặc MST",
        )}
        emptyLabel={t("v2.partners.picker.empty", "Không có đối tượng phù hợp")}
        aria-label={t("v2.partners.picker.placeholder", "Chọn đối tượng...")}
      />
    </div>
  );
};
