import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bankTransactionLinkApi } from "@/v2/modules/finance-invoice/api/linkSources/bankTransactionLinkApi";
import type { BankTransactionLinkDto } from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";
import {
  buildNetOffItems,
  clampAmount,
  matchesSide,
  remainingOf,
  sumSelected,
  type NetOffSelection,
  type NetOffSide,
} from "./bankNetOff.helper";

/** Trạng thái bảng sao kê cấn trừ, đưa xuống các cột */
export type V2BankNetOffPickerState = ReturnType<typeof useV2BankNetOffPicker>;

export interface UseV2BankNetOffPickerOptions {
  open: boolean;
  side: NetOffSide;
  /** Giao dịch đã cấn trừ với hóa đơn: hiện nhãn và không cho chọn lại */
  existingTxnIds: string[];
  onSelect: (items: { id: string; amount: number }[]) => void;
  onClose: () => void;
}

/**
 * Chọn nhiều giao dịch sao kê để cấn trừ. Lựa chọn (kèm số tiền từng dòng) được giữ
 * khi chuyển trang. Số tiền mặc định là phần còn lại của giao dịch và luôn bị kẹp trong khoảng đó.
 */
export function useV2BankNetOffPicker({
  open,
  side,
  existingTxnIds,
  onSelect,
  onClose,
}: UseV2BankNetOffPickerOptions) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearchText] = useState("");
  const [selected, setSelected] = useState<Record<string, NetOffSelection>>({});

  // Mỗi lần mở lại bắt đầu từ trang đầu, không lọc, không chọn sẵn
  useEffect(() => {
    if (open) {
      setPage(1);
      setSearchText("");
      setSelected({});
    }
  }, [open]);

  const query = { page, pageSize, search };
  const result = useQuery({
    queryKey: ["finance-invoices", "link-sources", "bank-transactions", query],
    queryFn: () => bankTransactionLinkApi.list(query),
    enabled: open,
    staleTime: 30_000,
  });

  // Chỉ hiện đúng chiều cấn trừ của hóa đơn (chi thì có debit, thu thì có credit)
  const rows = useMemo(
    () => (result.data?.items ?? []).filter((txn) => matchesSide(txn, side)),
    [result.data, side],
  );

  const isLinked = (id: string) => existingTxnIds.includes(id);

  /** Đặt lại danh sách chọn theo khóa mà bảng báo (bảng gửi cả danh sách mới) */
  const setSelectedKeys = (keys: string[]) => {
    setSelected((current) => {
      const next: Record<string, NetOffSelection> = {};
      for (const key of keys) {
        if (isLinked(key)) continue;
        const txn = findTxn(key, rows) ?? current[key]?.txn;
        if (!txn) continue;
        next[key] = current[key] ?? { txn, amount: remainingOf(txn) };
      }
      return next;
    });
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

  const total = sumSelected(selected);
  const count = Object.keys(selected).length;

  const confirm = () => {
    const items = buildNetOffItems(selected);
    if (items.length === 0) return;
    onSelect(items);
    onClose();
  };

  return {
    rows,
    totalRows: result.data?.total ?? 0,
    page,
    pageSize,
    search,
    loading: result.isPending,
    failed: result.isError,
    selectedKeys: Object.keys(selected),
    selected,
    count,
    selectedTotal: total,
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
    confirm,
  };
}

function findTxn(
  id: string,
  rows: BankTransactionLinkDto[],
): BankTransactionLinkDto | undefined {
  return rows.find((row) => row.id === id);
}
