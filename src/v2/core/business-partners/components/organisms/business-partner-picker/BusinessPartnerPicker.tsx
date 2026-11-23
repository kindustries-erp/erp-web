import * as React from "react";
import {
  V2Combobox,
  type V2ComboboxOption,
} from "@/v2/shared/components/molecules/v2-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button } from "@/v2/shared/components";
import { BusinessPartnerDrawer } from "../../../drawers/BusinessPartnerDrawer";
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
  const [creating, setCreating] = React.useState(false);
  // Tiền thu là khách hàng, tiền chi là nhà cung cấp
  const partnerType = direction === "OUT" ? "CUSTOMER" : "VENDOR";

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
      <V2Button
        variant="ghost"
        size="sm"
        className="mt-1 px-1"
        disabled={disabled}
        onClick={() => setCreating(true)}
      >
        {t("v2.partners.picker.createNew", "+ Tạo đối tác mới")}
      </V2Button>
      {creating && (
        <BusinessPartnerDrawer
          open
          partnerId={null}
          mode="edit"
          partnerType={partnerType}
          canUpdate
          onClose={() => setCreating(false)}
          onCreated={(partner) => {
            onValueChange(`master:${partner.id}`, partner.name);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
};
