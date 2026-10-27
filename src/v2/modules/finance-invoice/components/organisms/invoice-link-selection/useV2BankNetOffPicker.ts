import { useEffect, useMemo, useState } from "react";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import { useQuery } from "@tanstack/react-query";
import { useV2NetOffSuggestions } from "./useV2NetOffSuggestions";
import {
  bankTransactionLinkApi,
  type BankLinkSource,
} from "@/v2/modules/finance-invoice/api/linkSources/bankTransactionLinkApi";
import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";
import {
  buildNetOffItems,
  clampAmount,
  matchesSide,
  mergeSelectionKeys,
  remainingOf,
  suggestionToTxn,
  sumSelected,
  type NetOffSelection,
  type NetOffSide,
} from "./bankNetOff.helper";

export interface UseV2BankNetOffPickerOptions {
  open: boolean;
  side: NetOffSide;
  /** Hóa đơn đang cấn trừ: để lấy gợi ý. Không truyền thì không có gợi ý */
  invoiceId?: string;
  /** Giao dịch đã cấn trừ với hóa đơn: hiện nhãn và không cho chọn lại */
  existingTxnIds: string[];
  onSelect: (items: { id: string; amount: number }[]) => void;
  onClose: () => void;
}

/** Trạng thái bảng cấn trừ sao kê/sổ quỹ, đưa xuống các cột và modal */
export type V2BankNetOffPickerState = ReturnType<typeof useV2BankNetOffPicker>;

/**
 * Chọn nhiều giao dịch để cấn trừ, từ sao kê hoặc sổ quỹ, hoặc chỉ các gợi ý khớp.
 * Lựa chọn (kèm số tiền từng dòng) được giữ khi đổi nguồn, đổi trang, hoặc bật/tắt gợi ý.
 */
export function useV2BankNetOffPicker({
  open,
  side,
  invoiceId,
  existingTxnIds,
  onSelect,
  onClose,
}: UseV2BankNetOffPickerOptions) {
  const [source, setSource] = useState<BankLinkSource>("BANK");
  const [suggestionsOnly, setSuggestionsOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearchText] = useState("");
  const [selected, setSelected] = useState<Record<string, NetOffSelection>>({});

  // Mỗi lần mở lại bắt đầu từ sao kê, trang đầu, không lọc, không chọn sẵn
  useEffect(() => {
    if (open) {
      setSource("BANK");
      setSuggestionsOnly(false);
      setPage(1);
      setSearchText("");
      setSelected({});
    }
  }, [open]);

  const query = { page, pageSize, search };
  const listing = useQuery({
    queryKey: [
      "finance-invoices",
      "link-sources",
      "bank-transactions",
      source,
      query,
    ],
    queryFn: () => bankTransactionLinkApi.list(query, source),
    enabled: open && !suggestionsOnly,
    staleTime: 30_000,
  });

  const suggestions = useV2NetOffSuggestions(open, invoiceId);

  // Dòng hiển thị: danh sách theo nguồn, hoặc các gợi ý (đúng chiều cấn trừ)
  const rows = useMemo<BankTransactionLinkDto[]>(() => {
    if (suggestionsOnly) {
      return suggestions.items
        .map(suggestionToTxn)
        .filter((txn) => matchesSide(txn, side));
    }
    return (listing.data?.items ?? []).filter((txn) => matchesSide(txn, side));
  }, [suggestionsOnly, suggestions.items, listing.data, side]);

  const isLinked = (id: string) => existingTxnIds.includes(id);

  /** Nhận danh sách khóa mới của bảng; giữ các dòng đã chọn ở chỗ khác */
  const setSelectedKeys = (keys: string[]) => {
    const visibleIds = rows.map((row) => row.id);
    const byId = new Map(rows.map((row) => [row.id, row]));
    setSelected((current) =>
      mergeSelectionKeys(
        current,
        visibleIds,
        keys,
        (id) => byId.get(id),
        isLinked,
      ),
    );
  };

  const setAmount = (id: string, value: number) => {
    setSelected((current) => {
      const row = current[id];
      if (!row) return current;
      return {
        ...current,
        [id]: { ...row, amount: clampAmount(value, remainingOf(row.txn)) },
      };
    });
  };

  const confirm = () => {
    const items = buildNetOffItems(selected);
    if (items.length === 0) return;
    onSelect(items);
    onClose();
  };

  return {
    source,
    setSource: (next: BankLinkSource) => {
      setSource(next);
      setPage(1);
    },
    suggestionsOnly,
    toggleSuggestionsOnly: () => setSuggestionsOnly((v) => !v),
    hasSuggestions: Boolean(invoiceId),
    suggestionBadge: suggestions.badgeOf,
    rows,
    totalRows: listing.data?.total ?? 0,
    page,
    pageSize,
    search,
    loading: suggestionsOnly ? suggestions.isPending : listing.isPending,
    failed: listing.isError,
    selectedKeys: Object.keys(selected),
    selected,
    count: Object.keys(selected).length,
    selectedTotal: sumSelected(selected),
    setSelectedKeys,
    setAmount,
    setSearch: (text: string) => {
      setSearchText(text);
      setPage(1);
    },
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    isLinked,
    onTableQueryChange: (query: V2TableQuery) => {
      setSearchText(query.search ?? "");
      setPage(query.page);
      setPageSize(query.pageSize);
    },
    confirm,
  };
}
