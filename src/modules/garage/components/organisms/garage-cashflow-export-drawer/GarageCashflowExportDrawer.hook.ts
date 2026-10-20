import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  startOfISOWeek,
  endOfISOWeek,
  format,
  subWeeks,
  getISOWeek,
  getISOWeekYear,
} from "date-fns";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/core/api/axiosInstance";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { garageCashflowApi } from "@/modules/garage/api/garageCashflowApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { DEFAULT_GARAGE_CASHFLOW_EXPORT_COLUMNS } from "./GarageCashflowExportDrawer.columns.config";
import type { CashflowExportHistoryItem } from "./GarageCashflowExportDrawer.columns";
import type {
  GarageCashflowExportMode,
  GarageCashflowPeriodType,
} from "./components/GarageCashflowExportConditionSection";

export const GARAGE_CASHFLOW_EXPORT_COLUMNS_STORAGE_KEY =
  "garage_cashflow_export_columns_v1";

function loadSavedColumns(): string[] {
  try {
    const saved = localStorage.getItem(
      GARAGE_CASHFLOW_EXPORT_COLUMNS_STORAGE_KEY,
    );
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* empty */
  }
  return DEFAULT_GARAGE_CASHFLOW_EXPORT_COLUMNS;
}

export interface UseGarageCashflowExportDrawerProps {
  open: boolean;
  tableFilter?: any;
}

export function useGarageCashflowExportDrawer({
  open,
  tableFilter,
}: UseGarageCashflowExportDrawerProps) {
  const token = useAuthStore((s) => s.accessToken);
  const [exportMode, setExportMode] =
    useState<GarageCashflowExportMode>("by-period");
  const [periodType, setPeriodType] =
    useState<GarageCashflowPeriodType>("month");

  // Dates
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentQStr = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;

  // Week Options (12 recent weeks)
  const weekOptions = useMemo(() => {
    const list: Array<{ value: string; label: string }> = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const target = subWeeks(d, i);
      const start = startOfISOWeek(target);
      const end = endOfISOWeek(target);
      const w = getISOWeek(start);
      const y = getISOWeekYear(start);
      const val = `${format(start, "yyyy-MM-dd")}_${format(end, "yyyy-MM-dd")}`;
      list.push({
        value: val,
        label: `Tuần ${w}/${y} (${format(start, "dd/MM")} - ${format(end, "dd/MM/yyyy")})`,
      });
    }
    return list;
  }, []);

  const [week, setWeek] = useState<string>(() => weekOptions[0]?.value || "");
  const [period, setPeriod] = useState<string>(currentMonthStr);
  const [quarter, setQuarter] = useState<string>(currentQStr);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Filters
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(loadSavedColumns);

  // Pagination & Job tracking
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    jobId?: string | null;
    total: number;
    current: number;
  }>({ total: 100, current: 0 });

  const downloadedRef = useRef<Set<string>>(new Set());
  const sseAbortControllerRef = useRef<AbortController | null>(null);

  // Period Options (12 recent months)
  const periodOptions = useMemo(() => {
    const list: Array<{ value: string; label: string }> = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const val = `${year}-${String(month).padStart(2, "0")}`;
      list.push({
        value: val,
        label: `Tháng ${month}/${year}`,
      });
      d.setMonth(d.getMonth() - 1);
    }
    return list;
  }, []);

  // Quarter Options (8 recent quarters)
  const quarterOptions = useMemo(() => {
    const list: Array<{ value: string; label: string }> = [];
    const curYear = now.getFullYear();
    const curQ = Math.floor(now.getMonth() / 3) + 1;
    for (let y = curYear; y >= curYear - 1; y--) {
      const maxQ = y === curYear ? curQ : 4;
      for (let q = maxQ; q >= 1; q--) {
        list.push({
          value: `${y}-Q${q}`,
          label: `Quý ${q}/${y}`,
        });
      }
    }
    return list;
  }, []);

  // Update dateFrom / dateTo when periodType, week, period, quarter changes
  useEffect(() => {
    if (periodType === "week") {
      const currentWeekVal = week || weekOptions[0]?.value || "";
      if (!week && currentWeekVal) {
        setWeek(currentWeekVal);
      }
      if (currentWeekVal.includes("_")) {
        const [wFrom, wTo] = currentWeekVal.split("_");
        setDateFrom(wFrom);
        setDateTo(wTo);
      }
    } else if (periodType === "month" && period) {
      const [y, m] = period.split("-").map(Number);
      if (y && m) {
        const first = new Date(y, m - 1, 1);
        const last = new Date(y, m, 0);
        setDateFrom(first.toISOString().slice(0, 10));
        setDateTo(last.toISOString().slice(0, 10));
      }
    } else if (periodType === "quarter" && quarter) {
      const [yStr, qStr] = quarter.split("-Q");
      const y = Number(yStr);
      const q = Number(qStr);
      if (y && q) {
        const startM = (q - 1) * 3;
        const endM = startM + 2;
        const first = new Date(y, startM, 1);
        const last = new Date(y, endM + 1, 0);
        setDateFrom(first.toISOString().slice(0, 10));
        setDateTo(last.toISOString().slice(0, 10));
      }
    }
  }, [periodType, week, period, quarter, weekOptions]);

  const { data: accountsData = [] } = useQuery<any[]>({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      try {
        const data = await bankStatementApi.getBankAccounts();
        return (data as any[]) || [];
      } catch {
        return [];
      }
    },
    enabled: open,
    staleTime: 60_000,
  });

  const accountOptions = useMemo(() => {
    return [
      { value: "", label: "Tất cả tài khoản ngân hàng" },
      ...accountsData.map((a: any) => ({
        value: a.id,
        label: `${a.bankCode} - ${a.accountNumber} (${a.accountName || ""})`,
      })),
    ];
  }, [accountsData]);

  const transactionTypeOptions = useMemo(
    () => [
      { value: "", label: "Tất cả loại giao dịch" },
      { value: "RECEIPT", label: "Tiền vào (Thu)" },
      { value: "PAYMENT", label: "Tiền ra (Chi)" },
    ],
    [],
  );

  const handleColumnsChange = (cols: string[]) => {
    setSelectedColumns(cols);
    try {
      localStorage.setItem(
        GARAGE_CASHFLOW_EXPORT_COLUMNS_STORAGE_KEY,
        JSON.stringify(cols),
      );
    } catch {
      /* empty */
    }
  };

  const handleResetDefaultColumns = () => {
    handleColumnsChange(DEFAULT_GARAGE_CASHFLOW_EXPORT_COLUMNS);
  };

  const historyQuery = useQuery({
    queryKey: ["garage-cashflow-export-history", page, pageSize],
    queryFn: () => garageCashflowApi.listExportExcelHistory(page, pageSize),
    enabled: open,
    staleTime: 5_000,
    refetchInterval: (query) => {
      if (!open) return false;
      const data = query.state.data as
        | { items?: Array<{ status: string }> }
        | undefined;
      const hasRunning = data?.items?.some((it) => it.status === "RUNNING");
      const isTracking = Boolean(
        trackedJobId && !downloadedRef.current.has(trackedJobId),
      );
      return hasRunning || isTracking ? 1500 : 15_000;
    },
  });

  const handleDownload = useCallback(
    async (
      rowOrJobId: CashflowExportHistoryItem | string,
      customFileName?: string,
    ) => {
      const jobId =
        typeof rowOrJobId === "string" ? rowOrJobId : rowOrJobId.jobId;
      const fileName =
        typeof rowOrJobId === "string"
          ? customFileName || "Thu_chi_garage.xlsx"
          : rowOrJobId.fileName || "Thu_chi_garage.xlsx";

      if (downloadingJobId) return;
      try {
        setDownloadingJobId(jobId);
        const blob = await garageCashflowApi.downloadExportExcelFile(jobId);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 2000);
        toast.success("Đang tải file Excel về máy.");
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Không thể tải file Excel.",
        );
      } finally {
        setDownloadingJobId(null);
      }
    },
    [downloadingJobId, setDownloadingJobId],
  );

  // Auto-download when tracked job finishes (via historyQuery polling)
  useEffect(() => {
    if (!open || !trackedJobId) return;
    if (downloadedRef.current.has(trackedJobId)) return;

    const items = (historyQuery.data as any)?.items as
      | CashflowExportHistoryItem[]
      | undefined;
    const found = items?.find((it) => it.jobId === trackedJobId);

    if (found) {
      if (found.status === "COMPLETED" && found.canDownload !== false) {
        downloadedRef.current.add(trackedJobId);
        toast.success("File Excel đã sẵn sàng. Đang tự động tải về máy...");
        void handleDownload(found);
        setTrackedJobId(null);
      } else if (found.status === "FAILED") {
        toast.error(found.message || "Xuất file Excel thất bại.");
        setTrackedJobId(null);
      }
    }
  }, [open, trackedJobId, historyQuery.data, handleDownload]);

  // Connect SSE for real-time progress & instant auto-download
  useEffect(() => {
    if (!open || !token) return;

    const controller = new AbortController();
    sseAbortControllerRef.current = controller;

    const url = `${API_BASE_URL}/api/v1/greenway/cashflow-vouchers/export/excel/progress/stream`;

    const connectSSE = async () => {
      try {
        await fetchEventSource(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
          onmessage(ev) {
            if (!ev.data) return;
            try {
              const data = JSON.parse(ev.data);
              if (data.processId === "ping") return;

              setProgress({
                jobId: data.jobId,
                current: data.current ?? 0,
                total: data.total ?? 100,
              });

              // Check if tracked job is ready or completed
              if (
                data.jobId &&
                data.jobId === trackedJobId &&
                (data.ready || data.completed) &&
                !downloadedRef.current.has(data.jobId)
              ) {
                downloadedRef.current.add(data.jobId);
                toast.success(
                  "File Excel đã sẵn sàng. Đang tự động tải về máy...",
                );
                void handleDownload(data.jobId, data.fileName);
                setTrackedJobId(null);
                void historyQuery.refetch();
              }
            } catch {
              /* ignore parse errors */
            }
          },
        });
      } catch {
        /* ignore connection errors, historyQuery will fallback */
      }
    };

    void connectSSE();

    return () => {
      controller.abort();
    };
  }, [open, token, trackedJobId, handleDownload, historyQuery]);

  const handleStartExport = useCallback(async () => {
    setStarting(true);
    try {
      let payload: any = {
        mode: exportMode,
        selectedColumns,
      };

      if (exportMode === "by-period") {
        if (!dateFrom || !dateTo) {
          toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.");
          return;
        }
        payload = {
          ...payload,
          periodType,
          week: periodType === "week" ? week : undefined,
          period,
          quarter,
          dateFrom,
          dateTo,
          accountId: selectedAccountId || undefined,
          voucherType: transactionType || undefined,
        };
      } else {
        // current-filter
        if (tableFilter) {
          payload = {
            ...payload,
            column_filters: tableFilter.column_filters,
            column_search: tableFilter.column_search,
            sorts: tableFilter.sorts,
            search: tableFilter.search,
          };
        }
      }

      const res = await garageCashflowApi.startExportExcelBackground(payload);
      if (res.reused) {
        toast.success(res.message || "Đã tìm thấy file cũ. Đang tự động tải.");
        downloadedRef.current.add(res.jobId);
        void handleDownload(
          res.jobId,
          `Thu_chi_garage_${period || "export"}.xlsx`,
        );
      } else {
        setTrackedJobId(res.jobId);
        toast.success(res.message || "Đã bắt đầu tiến trình xuất Excel.");
      }
      await historyQuery.refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể khởi tạo xuất Excel.",
      );
    } finally {
      setStarting(false);
    }
  }, [
    exportMode,
    selectedColumns,
    periodType,
    week,
    period,
    quarter,
    dateFrom,
    dateTo,
    selectedAccountId,
    transactionType,
    tableFilter,
    handleDownload,
    historyQuery,
    setStarting,
    setTrackedJobId,
  ]);

  return {
    exportMode,
    setExportMode,
    periodType,
    setPeriodType,
    week,
    setWeek,
    weekOptions,
    period,
    setPeriod,
    periodOptions,
    quarter,
    setQuarter,
    quarterOptions,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    selectedAccountId,
    setSelectedAccountId,
    accountOptions,
    transactionType,
    setTransactionType,
    transactionTypeOptions,
    selectedColumns,
    setSelectedColumns: handleColumnsChange,
    handleResetDefaultColumns,
    page,
    setPage,
    pageSize,
    setPageSize,
    starting,
    downloadingJobId,
    progress,
    historyQuery,
    handleDownload,
    handleStartExport,
  };
}
