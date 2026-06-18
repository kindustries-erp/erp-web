import { useState, useCallback, useEffect } from "react";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";

type Direction = "IN" | "OUT";

export function useErpInvoicesList() {
  const [direction, setDirection] = useState<Direction>("IN");
  const [page, setPage] = useState(1);
  const [invoices, setInvoices] = useState<ErpInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState<string>("invoiceDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const STATUS_OPTIONS = [
    { value: "DRAFT", label: "Nháp" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "CANCELLED", label: "Đã hủy" },
  ];

  const filterPanel = useFilterPanel(
    {
      search: true,
      period: true,
      noDefaultPeriod: true,
      status: { options: STATUS_OPTIONS, placeholder: "Tất cả trạng thái" },
    },
    () => setPage(1),
  );

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { search, dateFrom, dateTo, status } = filterPanel.state;
      const res = await erpInvoicesCoreApi.list({
        direction,
        search: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status: status || undefined,
        page,
        pageSize: 40,
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
    sortBy,
    sortOrder,
    page,
  ]);

  useEffect(() => {
    setPage(1);
  }, [direction]);

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
