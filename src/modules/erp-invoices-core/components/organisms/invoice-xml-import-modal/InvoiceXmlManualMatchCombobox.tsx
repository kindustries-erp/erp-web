import { useEffect, useRef, useState } from "react";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
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
  const [options, setOptions] = useState(initialOptions);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  // Mỗi lần gõ tăng số thứ tự; kết quả của lượt cũ bị bỏ qua
  const requestIdRef = useRef(0);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      requestIdRef.current++;
    },
    [],
  );

  const handleSearch = (query: string) => {
    clearTimeout(timerRef.current);
    const requestId = ++requestIdRef.current;

    if (!query.trim()) {
      setLoading(false);
      setOptions(initialOptions);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await erpInvoicesCoreApi.list({
          direction,
          search: query,
          pageSize: 20,
        });
        if (requestId === requestIdRef.current) {
          setOptions(res.items.map(toInvoiceOption));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, MANUAL_MATCH_SEARCH_DEBOUNCE_MS);
  };

  const shownOptions =
    value && !options.some((o) => o.value === value)
      ? [...options, { value, label: "Đã chọn hóa đơn" }]
      : options;

  return (
    <V2Combobox
      options={shownOptions}
      value={value || null}
      onValueChange={(v) => onChange(v ?? "")}
      onSearchChange={handleSearch}
      loading={loading}
      placeholder="Chọn ghép thủ công..."
      searchPlaceholder="Tìm số HĐ, ký hiệu..."
      emptyLabel="Không tìm thấy hóa đơn"
      clearable
      className="w-full min-w-[150px]"
    />
  );
}
