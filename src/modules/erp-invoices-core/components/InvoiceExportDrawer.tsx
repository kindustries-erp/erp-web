import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { Download, FileSpreadsheet, Play, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@/core/components/ui/Tooltip";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { StandardTable } from "@/shared/components/StandardTable";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";
import {
  erpInvoicesCoreApi,
  type ErpInvoiceListParams,
  type InvoiceExportHistoryItem,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { useInvoiceExportProgress } from "@/modules/erp-invoices-core/hooks/useInvoiceExportProgress";
import { useInvoiceExportProgressStore } from "@/shared/stores/useInvoiceExportProgressStore";
import type { DataTableColumn } from "@/shared/components/DataTable";

interface InvoiceExportDrawerProps {
  open: boolean;
  onClose: () => void;
  direction: "IN" | "OUT";
  buildBaseQuery: () => Partial<ErpInvoiceListParams>;
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

export function InvoiceExportDrawer({
  open,
  onClose,
  direction,
  buildBaseQuery,
}: InvoiceExportDrawerProps) {
  const { t } = useTranslation("erpInvoices");
  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const terminalRefreshGuardRef = useRef<string | null>(null);

  const progress = useInvoiceExportProgressStore();
  const { downloadReadyFile } = useInvoiceExportProgress();

  const historyQuery = useQuery({
    queryKey: ["invoice-export-history", page, pageSize, direction],
    queryFn: () =>
      erpInvoicesCoreApi.listExportExcelBackgroundHistory(page, pageSize),
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

      // SSE-first: only fallback poll when stream is stale/disconnected during active jobs.
      if (sseHealthy) return false;

      return 10_000;
    },
  });

  useEffect(() => {
    if (!open) return;
    if (!progress.jobId) return;

    const isTerminalState =
      progress.ready || progress.failed || progress.completed;
    if (!isTerminalState) return;

    if (terminalRefreshGuardRef.current === progress.jobId) return;
    terminalRefreshGuardRef.current = progress.jobId;
    void historyQuery.refetch();
  }, [
    historyQuery,
    open,
    progress.completed,
    progress.failed,
    progress.jobId,
    progress.ready,
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
        label: t(
          "erpInvoices:exportDrawer.customRange",
          "Tuy chinh tu ngay/den ngay",
        ),
      },
    ],
    [t],
  );

  const handlePeriodChange = (next?: string) => {
    const value = next || "";
    if (!value || value === "custom") {
      setPeriod("");
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
          "erpInvoices:exportDrawer.error.missingDateRange",
          "Vui long chon day du ngay bat dau va ngay ket thuc.",
        ),
      );
      return;
    }

    try {
      setStarting(true);
      const payload: ErpInvoiceListParams = {
        ...buildBaseQuery(),
        direction,
        date_from: `${dateFrom}T00:00:00`,
        date_to: `${dateTo}T23:59:59`,
      };
      const result =
        await erpInvoicesCoreApi.startExportExcelBackground(payload);
      if (result.reused) {
        toast.success(
          result.message ||
            t(
              "erpInvoices:exportDrawer.toast.reused",
              "Da tim thay file cu. Ban co the tai lai ngay.",
            ),
        );
      } else {
        toast.success(
          result.message ||
            t(
              "erpInvoices:exportDrawer.toast.started",
              "Da bat dau tien trinh xuat Excel.",
            ),
        );
      }
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "erpInvoices:exportDrawer.error.startFailed",
            "Khong the bat dau xuat Excel.",
          ),
      );
    } finally {
      setStarting(false);
    }
  };

  const handleDownload = async (row: InvoiceExportHistoryItem) => {
    if (!row.canDownload || downloadingJobId) return;

    try {
      setDownloadingJobId(row.jobId);
      await downloadReadyFile(row.jobId, row.fileName);
      toast.success(
        t("erpInvoices:exportDrawer.toast.downloading", "Dang tai file XLSX."),
      );
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "erpInvoices:exportDrawer.error.downloadFailed",
            "Khong the tai lai file XLSX.",
          ),
      );
    } finally {
      setDownloadingJobId(null);
    }
  };

  const columns = useMemo<DataTableColumn<InvoiceExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: (
          <Tooltip
            content={t(
              "erpInvoices:exportDrawer.resetColumnWidth",
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
                  "reset-column-sizing-invoice-export-history",
                );
                window.dispatchEvent(event);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Tooltip>
        ),
        size: 40,
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                label:
                  downloadingJobId === row.jobId
                    ? t("erpInvoices:exportDrawer.downloading", "Đang tải...")
                    : t(
                        "erpInvoices:exportDrawer.downloadAgain",
                        "Tải lại file",
                      ),
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
        header: t("erpInvoices:exportDrawer.table.createdAt", "Tạo lúc"),
        size: 160,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: t("erpInvoices:exportDrawer.table.period", "Kỳ / Khoảng ngày"),
        size: 170,
        cell: (row) =>
          row.dateFrom || row.dateTo
            ? toDisplayRange(row.dateFrom, row.dateTo)
            : t("erpInvoices:exportDrawer.allRange", "Tất cả"),
      },
      {
        key: "fileName",
        header: t("erpInvoices:exportDrawer.table.fileName", "Tên file"),
        size: 240,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "status",
        header: t("erpInvoices:exportDrawer.table.status", "Trạng thái"),
        size: 140,
        cell: (row) => {
          if (row.status === "COMPLETED") {
            return (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {t("erpInvoices:exportDrawer.status.ready", "Sẵn sàng tải")}
              </Badge>
            );
          }
          if (row.status === "FAILED") {
            return (
              <Badge variant="destructive">
                {t("erpInvoices:exportDrawer.status.failed", "Thất bại")}
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
              {t("erpInvoices:exportDrawer.status.running", "Đang tạo")}{" "}
              {percent}%
            </Badge>
          );
        },
      },
      {
        key: "expiresAt",
        header: t("erpInvoices:exportDrawer.table.expiresAt", "Hết hạn"),
        size: 150,
        cell: (row) => toDisplayDate(row.expiresAt),
      },
      {
        key: "message",
        header: t("erpInvoices:exportDrawer.table.message", "Thông tin"),
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
      title={t("erpInvoices:exportDrawer.title", "Xuất Excel hóa đơn")}
      subtitle={t(
        "erpInvoices:exportDrawer.subtitle",
        "Tạo file theo kỳ và tải lại file đã tạo trong 24 tiếng",
      )}
      icon={<FileSpreadsheet className="w-4 h-4" />}
      layout="1-column"
      size="xl"
      leftPanel={
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("erpInvoices:exportDrawer.period", "Kỳ")}
              </label>
              <Combobox
                options={periodOptions}
                value={period}
                onChange={(v) => handlePeriodChange(v ?? "")}
                placeholder={t(
                  "erpInvoices:exportDrawer.selectPeriod",
                  "Chọn kỳ...",
                )}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("erpInvoices:exportDrawer.dateFrom", "Từ ngày")}
              </label>
              <DatePicker
                value={dateFrom}
                onChange={(v) => {
                  setDateFrom(v);
                }}
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                {t("erpInvoices:exportDrawer.dateTo", "Đến ngày")}
              </label>
              <DatePicker
                value={dateTo}
                onChange={(v) => {
                  setDateTo(v);
                }}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleStartExport} disabled={starting}>
              <Play className="w-4 h-4" />
              {starting
                ? t("erpInvoices:exportDrawer.starting", "Đang khởi tạo...")
                : t("erpInvoices:exportDrawer.start", "Xuất Excel")}
            </Button>
          </div>

          <div className="text-sm font-semibold">
            {t("erpInvoices:exportDrawer.historyTitle", "Lịch sử xuất file")}
          </div>

          <StandardTable
            tableId="invoice-export-history"
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
              "erpInvoices:exportDrawer.emptyHistory",
              "Chưa có file xuất nào",
            )}
          />
        </div>
      }
    />
  );
}
