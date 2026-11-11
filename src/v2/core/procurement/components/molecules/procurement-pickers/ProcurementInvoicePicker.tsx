import * as React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { V2Combobox, V2ReadValue } from "@/v2/shared/components";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  findSupplierByTaxCode,
  listPurchaseInvoicePage,
  type PurchaseInvoiceRow,
} from "../../../api/procurementLookups";

const PAGE_SIZE = 20;

const toOption = (row: PurchaseInvoiceRow): V2ComboboxOption => ({
  value: row.invoiceNo,
  label: row.invoiceNo,
  description:
    [row.serialNo, row.sellerName, row.invoiceDate]
      .filter(Boolean)
      .join(" · ") || undefined,
});

/**
 * Chọn số hóa đơn mua vào (combobox có tìm kiếm, cuộn tải thêm). Chọn hóa đơn thì
 * tự tìm NCC có cùng MST người bán và báo qua `onSupplierMatch` (null nếu không khớp).
 * Hóa đơn chưa đồng bộ thì không có trong danh sách: ghi vào Ghi chú.
 */
export function ProcurementInvoicePicker({
  value,
  viewing,
  onChange,
  onSupplierMatch,
}: {
  /** Số hóa đơn đang lưu (chuỗi rỗng khi chưa có) */
  value: string;
  viewing: boolean;
  onChange: (invoiceNo: string) => void;
  onSupplierMatch: (supplier: { id: string; name: string } | null) => void;
}) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [noSupplierMatch, setNoSupplierMatch] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const invoices = useInfiniteQuery({
    queryKey: ["v2-procurement", "purchase-invoice-options", debounced],
    queryFn: ({ pageParam }) =>
      listPurchaseInvoicePage({
        search: debounced,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.next ?? undefined,
    staleTime: 30_000,
    enabled: !viewing,
  });

  /** Mọi hóa đơn đã thấy (kể cả khi đổi từ khóa), để tra MST người bán lúc chọn */
  const seenRef = React.useRef(new Map<string, PurchaseInvoiceRow>());
  const rows = React.useMemo(() => {
    const unique = new Map<string, PurchaseInvoiceRow>();
    for (const page of invoices.data?.pages ?? []) {
      for (const row of page.rows) {
        if (!unique.has(row.invoiceNo)) unique.set(row.invoiceNo, row);
        seenRef.current.set(row.invoiceNo, row);
      }
    }
    return [...unique.values()];
  }, [invoices.data]);

  if (viewing) return <V2ReadValue value={value || "—"} />;

  const handleSelect = async (invoiceNo: string | null) => {
    if (invoiceNo === null) {
      setNoSupplierMatch(false);
      onChange("");
      return;
    }
    onChange(invoiceNo);
    const row = seenRef.current.get(invoiceNo);
    if (!row?.sellerTaxCode) {
      setNoSupplierMatch(true);
      onSupplierMatch(null);
      return;
    }
    const supplier = await queryClient.fetchQuery({
      queryKey: ["v2-procurement", "supplier-by-tax", row.sellerTaxCode],
      queryFn: () => findSupplierByTaxCode(row.sellerTaxCode),
      staleTime: 30_000,
    });
    setNoSupplierMatch(!supplier);
    onSupplierMatch(supplier);
  };

  return (
    <div className="flex flex-col gap-1">
      <V2Combobox
        aria-label={t(
          "v2.procurement.fields.supplierInvoiceNo",
          "Số hóa đơn NCC",
        )}
        placeholder={t(
          "v2.procurement.fields.invoicePlaceholder",
          "Chọn số hóa đơn mua vào",
        )}
        options={rows.map(toOption)}
        loading={invoices.isFetching}
        value={value || null}
        fallbackLabel={value || undefined}
        onSearchChange={setSearch}
        onScrollBottom={() => {
          if (invoices.hasNextPage && !invoices.isFetchingNextPage) {
            void invoices.fetchNextPage();
          }
        }}
        clearable
        onValueChange={(v) => void handleSelect(v)}
      />
      <p className="text-[11px] text-muted-fg">
        {t(
          "v2.procurement.fields.invoiceNotSyncedHint",
          "Chưa thấy hóa đơn? Ghi số hóa đơn và NCC vào Ghi chú.",
        )}
      </p>
      {noSupplierMatch && value ? (
        <p className="text-[11px] text-warning">
          {t(
            "v2.procurement.fields.supplierNotFoundHint",
            "NCC của hóa đơn chưa có trong danh mục: chọn tay hoặc ghi vào Ghi chú.",
          )}
        </p>
      ) : null}
    </div>
  );
}
