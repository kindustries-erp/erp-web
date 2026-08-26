import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { Download, FileSpreadsheet, Play, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

import { Tooltip } from "@/core/components/ui/Tooltip";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";
import {
  bankStatementApi,
  type BankStatementExportHistoryItem,
} from "@/modules/bank-statements/api/bankStatementApi";
import { useBankStatementExportProgress } from "@/modules/bank-statements/hooks/useBankStatementExportProgress";
import { useBankStatementExportProgressStore } from "@/shared/stores/useBankStatementExportProgressStore";
import type { DataTableColumn } from "@/shared/components/DataTable";

interface BankStatementExportDrawerProps {
  open: boolean;
  onClose: () => void;
  type: "bank" | "cash";
  accountsData: any[];
  branches?: Array<{ id: string; name: string }>;
}

function toDisplayDate(iso?: string) {
  if (!iso) return "-";
  const date = parseISO(iso);
  if (!isValid(date)) return "-";
  return format(date, "dd/MM/yyyy HH:mm");
}

function toDisplayRange(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return "-";
  const from = dateFrom ? toDisplayDate(dateFrom).slice(0, 10) : "-";
  const to = dateTo ? toDisplayDate(dateTo).slice(0, 10) : "-";
  return `${from} - ${to}`;
}

export function BankStatementExportDrawer({
  open,
  onClose,
  type,
  accountsData,
}: BankStatementExportDrawerProps) {
  const t = useT();

  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [transactionType, setTransactionType] = useState<string>("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const terminalRefreshGuardRef = useRef<string | null>(null);
  const downloadedJobIdsRef = useRef<Set<string>>(new Set());

  const progress = useBankStatementExportProgressStore();
  const { downloadReadyFile } = useBankStatementExportProgress();

  const handleDownload = async (
    jobIdOrRow: string | BankStatementExportHistoryItem,
    customFileName?: string,
  ) => {
    const jobId =
      typeof jobIdOrRow === "string" ? jobIdOrRow : jobIdOrRow.jobId;
    const fileName =
      typeof jobIdOrRow === "string" ? customFileName : jobIdOrRow.fileName;

    if (downloadingJobId) return;

    try {
      setDownloadingJobId(jobId);
      await downloadReadyFile(jobId, fileName);
      toast.success(t("bankStatement.toastDownloading", "Đang tải file XLSX."));
      void historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("bankStatement.downloadFailed", "Không thể tải file XLSX."),
      );
    } finally {
      setDownloadingJobId(null);
    }
  };

  const historyQuery = useQuery({
    queryKey: ["bank-statement-export-history", page, pageSize],
    queryFn: () => bankStatementApi.listExportExcelHistory(page, pageSize),
    enabled: open,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      if (!open) return false;

      const data = query.state.data as
        | { items?: Array<{ status: string }> }
        | undefined;
      const hasRunningFromHistory = Boolean(
        data?.items?.some((item) => item.status === "RUNNING"),
      );
      const hasRunningFromProgress = Boolean(progress.isRunning);
      const hasRunning = hasRunningFromHistory || hasRunningFromProgress;
      if (!hasRunning) return false;

      const now = Date.now();
      const eventAgeMs = progress.lastEventAt
        ? now - progress.lastEventAt
        : Infinity;
      const sseHealthy = progress.sseConnected && eventAgeMs < 20_000;

      if (sseHealthy) return false;

      return 10_000;
    },
  });

  useEffect(() => {
    if (!open) return;

    // 1. Check SSE progress for completed / ready state
    const activeJobId = progress.jobId;
    if (
      activeJobId &&
      (progress.ready || progress.completed) &&
      !downloadedJobIdsRef.current.has(activeJobId)
    ) {
      downloadedJobIdsRef.current.add(activeJobId);
      void handleDownload(activeJobId, progress.fileName);
    }

    // 2. Check historyQuery items for trackedJobId (fallback if SSE missed event)
    if (trackedJobId && !downloadedJobIdsRef.current.has(trackedJobId)) {
      const historyItem = historyQuery.data?.items?.find(
        (it) => it.jobId === trackedJobId && it.status === "COMPLETED",
      );
      if (historyItem) {
        downloadedJobIdsRef.current.add(trackedJobId);
        void handleDownload(trackedJobId, historyItem.fileName);
      }
    }

    // 3. Refresh history table when terminal state reached
    if (
      activeJobId &&
      (progress.ready || progress.failed || progress.completed)
    ) {
      if (terminalRefreshGuardRef.current !== activeJobId) {
        terminalRefreshGuardRef.current = activeJobId;
        void historyQuery.refetch();
      }
    }
  }, [
    open,
    progress.jobId,
    progress.ready,
    progress.completed,
    progress.failed,
    progress.fileName,
    trackedJobId,
    historyQuery.data?.items,
  ]);

  useEffect(() => {
    if (!progress.isRunning) {
      terminalRefreshGuardRef.current = null;
    }
  }, [progress.isRunning]);

  const periodOptions = useMemo(
    () => [
      ...PERIOD_OPTS,
      {
        value: "custom",
        label: t("bankStatement.exportCustomRange", "Tùy chỉnh khoảng ngày"),
      },
    ],
    [t],
  );

  const handlePeriodChange = (next?: string) => {
    const value = next || "";
    if (!value || value === "custom") {
      setPeriod("custom");
      return;
    }

    setPeriod(value);
    if (value && value !== "custom") {
      setDateFrom(periodFirstDay(value));
      setDateTo(periodLastDay(value));
    }
  };

  useEffect(() => {
    const nextPeriod = periodFromExactRange(dateFrom, dateTo);
    setPeriod((prev) => (prev === nextPeriod ? prev : nextPeriod));
  }, [dateFrom, dateTo]);

  const accountOptions = useMemo(() => {
    const defaultLabel =
      type === "bank"
        ? t("bankStatement.allBankAccounts", "Tất cả tài khoản ngân hàng")
        : t("bankStatement.allCashBooks", "Tất cả sổ quỹ");

    return [
      { value: "", label: defaultLabel },
      ...accountsData.map((a: any) => ({
        value: a.id,
        label:
          type === "bank"
            ? `${a.bankCode} - ${a.accountNumber} (${a.accountName || ""})`
            : a.name,
      })),
    ];
  }, [accountsData, type, t]);

  const transactionTypeOptions = useMemo(
    () => [
      {
        value: "",
        label: t("bankStatement.allTypes", "Tất cả loại giao dịch"),
      },
      { value: "IN", label: t("bankStatement.typeIn", "Tiền vào (Thu)") },
      { value: "OUT", label: t("bankStatement.typeOut", "Tiền ra (Chi)") },
    ],
    [t],
  );

  const renderOverflowText = (text: string, className?: string) => {
    const value = text?.trim() || "-";
    const showTooltip = value.length > 36;

    return (
      <Tooltip content={value} disabled={!showTooltip}>
        <div
          className={`truncate ${className || ""}`}
          title={showTooltip ? undefined : value}
        >
          {value}
        </div>
      </Tooltip>
    );
  };

  const handleStartExport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error(
        t(
          "bankStatement.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }

    try {
      setStarting(true);
      const payload: any = {
        sourceType: type === "bank" ? "BANK" : "CASH",
        startDate: `${dateFrom} 00:00:00`,
        endDate: `${dateTo} 23:59:59`,
      };
      if (selectedAccountId) {
        if (type === "bank") payload.bankAccountId = selectedAccountId;
        else payload.cashBookId = selectedAccountId;
      }
      if (transactionType) payload.transactionType = transactionType;

      const result = await bankStatementApi.startExportExcelBackground(payload);
      setTrackedJobId(result.jobId);
      if (result.reused) {
        toast.success(
          result.message ||
            t(
              "bankStatement.toastReused",
              "Đã tìm thấy file cũ. Đang tự động tải xuống.",
            ),
        );
        if (!downloadedJobIdsRef.current.has(result.jobId)) {
          downloadedJobIdsRef.current.add(result.jobId);
          void handleDownload(result.jobId);
        }
      } else {
        toast.success(
          result.message ||
            t(
              "bankStatement.toastStarted",
              "Đã bắt đầu tiến trình xuất Excel.",
            ),
        );
      }
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t("bankStatement.startFailed", "Không thể bắt đầu xuất Excel."),
      );
    } finally {
      setStarting(false);
    }
  };

  const columns = useMemo<DataTableColumn<BankStatementExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: (
          <Tooltip
            content={t(
              "bankStatement.resetColumnWidth",
              "Khôi phục độ rộng cột",
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent(
                  "reset-column-sizing-bank-statement-export-history",
                );
                window.dispatchEvent(event);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Tooltip>
        ),
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
        headerClassName: "w-[40px] min-w-[40px] text-center",
        className: "w-[40px] min-w-[40px] text-center",
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                label:
                  downloadingJobId === row.jobId
                    ? t("bankStatement.downloading", "Đang tải...")
                    : t("bankStatement.downloadAgain", "Tải lại file"),
                icon: <Download className="w-3.5 h-3.5" />,
                onClick: () => {
                  void handleDownload(row);
                },
                disabled: !row.canDownload || Boolean(downloadingJobId),
                loading: downloadingJobId === row.jobId,
              },
            ]}
          />
        ),
      },
      {
        key: "createdAt",
        header: t("bankStatement.tableCreatedAt", "Tạo lúc"),
        size: 160,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: t("bankStatement.tablePeriod", "Kỳ / Khoảng ngày"),
        size: 170,
        cell: (row) =>
          row.dateFrom || row.dateTo
            ? toDisplayRange(row.dateFrom, row.dateTo)
            : t("bankStatement.allRange", "Tất cả"),
      },
      {
        key: "fileName",
        header: t("bankStatement.tableFileName", "Tên file"),
        size: 240,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "status",
        header: t("bankStatement.tableStatus", "Trạng thái"),
        size: 140,
        cell: (row) => {
          if (row.status === "COMPLETED") {
            return (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {t("bankStatement.statusReady", "Sẵn sàng tải")}
              </Badge>
            );
          }
          if (row.status === "FAILED") {
            return (
              <Badge variant="destructive">
                {t("bankStatement.statusFailed", "Thất bại")}
              </Badge>
            );
          }

          const current =
            progress.jobId === row.jobId && progress.total > 0
              ? progress.current
              : row.current;
          const total =
            progress.jobId === row.jobId && progress.total > 0
              ? progress.total
              : row.total;
          const percent = total > 0 ? Math.round((current / total) * 100) : 0;

          return (
            <Badge className="bg-sky-50 text-sky-700 border-sky-200">
              {t("bankStatement.statusRunning", "Đang tạo")} {percent}%
            </Badge>
          );
        },
      },
      {
        key: "expiresAt",
        header: t("bankStatement.tableExpiresAt", "Hết hạn"),
        size: 150,
        cell: (row) => toDisplayDate(row.expiresAt),
      },
      {
        key: "message",
        header: t("bankStatement.tableMessage", "Thông tin"),
        size: 200,
        cell: (row) => renderOverflowText(row.message),
      },
    ],
    [downloadingJobId, progress.current, progress.jobId, progress.total, t],
  );

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={
        type === "bank"
          ? t("bankStatement.exportBankTitle", "Xuất Excel sao kê ngân hàng")
          : t("bankStatement.exportCashTitle", "Xuất Excel sổ quỹ tiền mặt")
      }
      subtitle={t(
        "bankStatement.exportSubtitle",
        "Tạo file theo kỳ và tải lại file đã tạo trong 24 tiếng",
      )}
      icon={<FileSpreadsheet className="w-4 h-4" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t("bankStatement.historyTitle", "Lịch sử xuất file")}
            collapsible
            defaultCollapsed={false}
          >
            <StandardTable
              tableId="bank-statement-export-history"
              variant="spreadsheet"
              enableColumnResizing={true}
              items={historyQuery.data?.items || []}
              columns={columns}
              getRowKey={(row) => row.jobId}
              loading={historyQuery.isLoading || historyQuery.isFetching}
              page={page}
              pageSize={pageSize}
              total={historyQuery.data?.total || 0}
              totalPages={historyQuery.data?.totalPages || 1}
              onPage={setPage}
              onPageSize={setPageSize}
              emptyLabel={t(
                "bankStatement.emptyHistory",
                "Chưa có file xuất nào",
              )}
            />
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t("bankStatement.timeFilter", "Khoảng thời gian")}
            collapsible
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.period", "Kỳ")}
                </label>
                <Combobox
                  options={periodOptions}
                  value={period}
                  onChange={(v) => handlePeriodChange(v ?? "")}
                  placeholder={t("bankStatement.selectPeriod", "Chọn kỳ...")}
                  allowClear={false}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.dateFrom", "Từ ngày")}
                </label>
                <DatePicker
                  value={dateFrom}
                  onChange={(v) => setDateFrom(v)}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.dateTo", "Đến ngày")}
                </label>
                <DatePicker
                  value={dateTo}
                  onChange={(v) => setDateTo(v)}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>
          </DrawerSection>

          <DrawerSection
            title={t("bankStatement.scopeFilter", "Phạm vi & Đối tượng")}
            collapsible
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {type === "bank"
                    ? t("bankStatement.bankAccount", "Tài khoản ngân hàng")
                    : t("bankStatement.cashBook", "Sổ quỹ")}
                </label>
                <Combobox
                  options={accountOptions}
                  value={selectedAccountId}
                  onChange={(v) => setSelectedAccountId(v ?? "")}
                  placeholder={
                    type === "bank"
                      ? t(
                          "bankStatement.allBankAccounts",
                          "Tất cả tài khoản ngân hàng",
                        )
                      : t("bankStatement.allCashBooks", "Tất cả sổ quỹ")
                  }
                  allowClear={false}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("bankStatement.transactionType", "Loại giao dịch")}
                </label>
                <Combobox
                  options={transactionTypeOptions}
                  value={transactionType}
                  onChange={(v) => setTransactionType(v ?? "")}
                  placeholder={t(
                    "bankStatement.allTypes",
                    "Tất cả loại giao dịch",
                  )}
                  allowClear={false}
                />
              </div>

              <div className="pt-2">
                <Button
                  className="w-full justify-center"
                  onClick={handleStartExport}
                  disabled={starting}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  {starting
                    ? t("bankStatement.starting", "Đang khởi tạo...")
                    : t("bankStatement.start", "Xuất Excel")}
                </Button>
              </div>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
