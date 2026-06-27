import { useState, useCallback, useEffect, useMemo } from "react";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";

type Direction = "IN" | "OUT";

export function useErpInvoicesList(initialDirection: Direction = "IN") {
  const [direction, setDirection] = useState<Direction>(initialDirection);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [invoices, setInvoices] = useState<ErpInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState<string>("invoiceDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "DRAFT", label: "Nháp" },
      { value: "CONFIRMED", label: "Đã xác nhận" },
      { value: "CANCELLED", label: "Đã hủy" },
    ],
    [],
  );

  const filterConfig = useMemo(
    () => ({
      search: true,
      period: true,
      noDefaultPeriod: true,
      status: { options: STATUS_OPTIONS, placeholder: "Tất cả trạng thái" },
    }),
    [STATUS_OPTIONS],
  );

  const handlePageReset = useCallback(() => setPage(1), []);
  const filterPanel = useFilterPanel(filterConfig, handlePageReset);

  const sellerNameFilter = filterPanel.state.custom?.seller_name ?? "";
  const buyerNameFilter = filterPanel.state.custom?.buyer_name ?? "";

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { search, dateFrom, dateTo, status } = filterPanel.state;
      const res = await erpInvoicesCoreApi.list({
        direction,
        search: search || undefined,
        seller_name: sellerNameFilter || undefined,
        buyer_name: buyerNameFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status: status || undefined,
        tag_id: (filterPanel.state.custom?.tag_id as string) || undefined,
        page,
        pageSize,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
      });
      setInvoices(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [
    direction,
    filterPanel.state.search,
    filterPanel.state.dateFrom,
    filterPanel.state.dateTo,
    filterPanel.state.status,
    sellerNameFilter,
    buyerNameFilter,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  useEffect(() => {
    setPage(1);
  }, [direction]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return {
    direction,
    setDirection,
    page,
    setPage,
    pageSize,
    setPageSize,
    invoices,
    total,
    totalPages,
    loading,
    sortBy,
    sortOrder,
    handleSort,
    filterPanel,
    loadInvoices,
    STATUS_OPTIONS,
  };
}
