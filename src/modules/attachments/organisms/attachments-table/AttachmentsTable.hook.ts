import { useState, useEffect, useCallback } from "react";
import {
  getAttachmentsPagedApi,
  getAttachmentOptionsApi,
} from "@/modules/system/api/attachmentsApi";
import type { ErpAttachment } from "../../types/attachment.types";
import type { SortOrder } from "./AttachmentsTable.type";

export function useAttachmentsTable() {
  const [items, setItems] = useState<ErpAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sort, setSort] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [colSearch, setColSearch] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await getAttachmentsPagedApi({
        page,
        pageSize,
        documentType: typeFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort,
        filtersStr:
          Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined,
      });
      setItems(res.items || []);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setFetchError("Không thể tải danh sách tài liệu đính kèm.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter, dateFrom, dateTo, sort, filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSortChange = (key: string, state: SortOrder) => {
    if (state === "none") {
      setSort(["-createdAt"]);
    } else {
      setSort([state === "desc" ? `-${key}` : key]);
    }
    setPage(1);
  };

  const getSortState = (key: string): SortOrder => {
    if (sort.includes(key)) return "asc";
    if (sort.includes(`-${key}`)) return "desc";
    return "none";
  };

  const fetchAttachmentOptions = async ({
    columnKey,
    search: querySearch,
    pageParam = 1,
    filtersStr,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    return getAttachmentOptionsApi({
      columnKey,
      search: querySearch,
      pageParam,
      filtersStr,
    });
  };

  return {
    items,
    loading,
    fetchError,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    typeFilter,
    setTypeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    filters,
    setFilters,
    colSearch,
    setColSearch,
    loadData,
    handleSortChange,
    getSortState,
    fetchAttachmentOptions,
  };
}
