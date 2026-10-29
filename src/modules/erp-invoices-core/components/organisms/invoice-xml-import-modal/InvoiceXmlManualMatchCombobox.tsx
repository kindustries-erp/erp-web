import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { toInvoiceOption } from "./invoiceXmlImportModal.helper";

export const MANUAL_MATCH_SEARCH_DEBOUNCE_MS = 300;

export interface InvoiceXmlManualMatchComboboxProps {
  direction: "IN" | "OUT";
  value: string;
  onChange: (value: string) => void;
  initialOptions: { value: string; label: string }[];
}

/** Ghép HĐ thủ công: tìm trên server khi gõ (debounce), giữ nhãn của HĐ đã chọn */
export function InvoiceXmlManualMatchCombobox({
  direction,
  value,
  onChange,
  initialOptions,
}: InvoiceXmlManualMatchComboboxProps) {
  const { t } = useTranslation("erpInvoices");
  const [search, setSearch] = useState("");
  const query = search.trim();
  const debouncedQuery = useDebounce(query, MANUAL_MATCH_SEARCH_DEBOUNCE_MS);

  const searchQuery = useQuery({
    queryKey: [
      "erp-invoices",
      "manual-match-search",
      direction,
      debouncedQuery,
    ],
    queryFn: async () =>
      (
        await erpInvoicesCoreApi.list({
          direction,
          search: debouncedQuery,
          pageSize: 20,
        })
      ).items,
    enabled: debouncedQuery.length > 0,
  });

  const searchOptions = useMemo(
    () => (searchQuery.data ?? []).map((inv) => toInvoiceOption(inv, t)),
    [searchQuery.data, t],
  );
  const hasSearchResult = debouncedQuery.length > 0 && !!searchQuery.data;
  const options = hasSearchResult ? searchOptions : initialOptions;
  const loading =
    query.length > 0 && (query !== debouncedQuery || searchQuery.isFetching);

  const shownOptions =
    value && !options.some((o) => o.value === value)
      ? [
          ...options,
          { value, label: t("xmlManualMatchSelected", "Đã chọn hóa đơn") },
        ]
      : options;

  return (
    <V2Combobox
      options={shownOptions}
      value={value || null}
      onValueChange={(v) => onChange(v ?? "")}
      onSearchChange={setSearch}
      loading={loading}
      placeholder={t("xmlManualMatchPlaceholder", "Chọn ghép thủ công...")}
      searchPlaceholder={t(
        "xmlManualMatchSearchPlaceholder",
        "Tìm số HĐ, ký hiệu...",
      )}
      emptyLabel={t("xmlManualMatchEmpty", "Không tìm thấy hóa đơn")}
      clearable
      className="w-full min-w-[150px]"
    />
  );
}
