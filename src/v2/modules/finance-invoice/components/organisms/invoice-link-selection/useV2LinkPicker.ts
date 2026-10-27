import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  LinkPageDto,
  LinkPageQuery,
} from "@/v2/modules/finance-invoice/api/linkSources/linkSourceDto";

export interface UseV2LinkPickerOptions<T extends { id: string }> {
  /** Khóa cache riêng cho từng loại chứng từ, ví dụ "purchase-orders" */
  queryKey: string;
  fetchPage: (query: LinkPageQuery) => Promise<LinkPageDto<T>>;
  open: boolean;
  /** Chứng từ đã liên kết với hóa đơn: hiện nhãn và không cho chọn lại */
  existingIds: string[];
  onSelect: (row: T) => void;
  onClose: () => void;
}

/** Trạng thái một lần chọn chứng từ, đưa xuống `V2LinkPickerModal` */
export interface V2LinkPickerState<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  loading: boolean;
  failed: boolean;
  setSearch: (text: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  isLinked: (id: string) => boolean;
  choose: (row: T) => void;
}

/**
 * Trạng thái chung của mọi modal chọn chứng từ để ghép nối: phân trang, tìm kiếm,
 * và chọn một dòng rồi đóng modal. Mỗi lần mở lại bắt đầu từ trang đầu, không lọc.
 */
export function useV2LinkPicker<T extends { id: string }>({
  queryKey,
  fetchPage,
  open,
  existingIds,
  onSelect,
  onClose,
}: UseV2LinkPickerOptions<T>): V2LinkPickerState<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearchText] = useState("");

  useEffect(() => {
    if (open) {
      setPage(1);
      setSearchText("");
    }
  }, [open]);

  const query: LinkPageQuery = { page, pageSize, search };
  const result = useQuery({
    queryKey: ["finance-invoices", "link-sources", queryKey, query],
    queryFn: () => fetchPage(query),
    enabled: open,
    staleTime: 30_000,
  });
  const rows = result.data?.items ?? [];

  const choose = (row: T) => {
    if (existingIds.includes(row.id)) return;
    onSelect(row);
    onClose();
  };

  return {
    rows,
    total: result.data?.total ?? 0,
    page,
    pageSize,
    search,
    loading: result.isPending,
    failed: result.isError,
    setSearch: (text: string) => {
      setSearchText(text);
      setPage(1);
    },
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    isLinked: (id: string) => existingIds.includes(id),
    choose,
  };
}
