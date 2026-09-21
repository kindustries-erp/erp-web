import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { Download, FileSpreadsheet, Play, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@/core/components/ui/Tooltip";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";
import {
  invoiceDebtsApi,
  type GetInvoiceDebtsQueryParams,
  type InvoiceDebtExportHistoryItem,
  type InvoicePartnerType,
} from "../api/invoiceDebtsApi";
import type { DataTableColumn } from "@/shared/components/DataTable";

export interface InvoiceDebtsExportDrawerProps {
  open: boolean;
  onClose: () => void;
  initialPartnerType?: InvoicePartnerType;
  buildBaseQuery?: () => Partial<GetInvoiceDebtsQueryParams>;
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

export function InvoiceDebtsExportDrawer({
  open,
  onClose,
  initialPartnerType = "CUSTOMER",
  buildBaseQuery,
}: InvoiceDebtsExportDrawerProps) {
  const { t } = useTranslation(["debts", "common"]);
  const [partnerType, setPartnerType] =
    useState<InvoicePartnerType>(initialPartnerType);
  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [starting, setStarting] = useState(false);
  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const downloadedJobIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (initialPartnerType) {
      setPartnerType(initialPartnerType);
    }
  }, [initialPartnerType, open]);

  const historyQuery = useQuery({
    queryKey: ["invoice-debts-export-history", page, pageSize],
    queryFn: () =>
      invoiceDebtsApi.listExportExcelBackgroundHistory(page, pageSize),
    enabled: open,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      if (!open) return false;
      const data = query.state.data as
        | { items?: Array<{ status: string }> }
        | undefined;
      const hasRunning = Boolean(
        data?.items?.some((item) => item.status === "RUNNING"),
      );
      return hasRunning ? 5000 : false;
    },
  });

  const handleDownload = async (
    jobIdOrRow: string | InvoiceDebtExportHistoryItem,
    customFileName?: string,
  ) => {
    const jobId =
      typeof jobIdOrRow === "string" ? jobIdOrRow : jobIdOrRow.jobId;
    const fileName =
      typeof jobIdOrRow === "string" ? customFileName : jobIdOrRow.fileName;

    if (downloadingJobId) return;

    try {
      setDownloadingJobId(jobId);
      const blob = await invoiceDebtsApi.downloadExportExcelBackground(jobId);
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = fileName || "Bao_cao_cong_no.xlsx";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);

      toast.success(
        t("debts:exportDrawer.toast.downloading", "Đang tải file XLSX."),
      );
      void historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "debts:exportDrawer.error.downloadFailed",
            "Không thể tải lại file XLSX.",
          ),
      );
    } finally {
      setDownloadingJobId(null);
    }
  };

  useEffect(() => {
    if (!open || !trackedJobId) return;

    if (!downloadedJobIdsRef.current.has(trackedJobId)) {
      const historyItem = historyQuery.data?.items?.find(
        (it) => it.jobId === trackedJobId && it.status === "COMPLETED",
      );
      if (historyItem) {
        downloadedJobIdsRef.current.add(trackedJobId);
        void handleDownload(trackedJobId, historyItem.fileName);
      }
    }
  }, [open, trackedJobId, historyQuery.data?.items]);

  const periodOptions = useMemo(
    () => [
      ...PERIOD_OPTS,
      {
        value: "custom",
        label: t(
          "debts:exportDrawer.customRange",
          "Tùy chỉnh từ ngày/đến ngày",
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
          "debts:exportDrawer.error.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }

    try {
      setStarting(true);
      const baseParams = buildBaseQuery ? buildBaseQuery() : {};
      const payload: GetInvoiceDebtsQueryParams = {
        ...baseParams,
        partner_type: partnerType,
        date_from: dateFrom,
        date_to: dateTo,
      };
      const result = await invoiceDebtsApi.startExportExcelBackground(payload);
      setTrackedJobId(result.jobId);
      if (result.reused) {
        toast.success(
          result.message ||
            t(
              "debts:exportDrawer.toast.reused",
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
              "debts:exportDrawer.toast.started",
              "Đã bắt đầu tiến trình xuất Excel công nợ.",
            ),
        );
      }
      await historyQuery.refetch();
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "debts:exportDrawer.error.startFailed",
            "Không thể bắt đầu xuất Excel.",
          ),
      );
    } finally {
      setStarting(false);
    }
  };

  const columns = useMemo<DataTableColumn<InvoiceDebtExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: (
          <Tooltip
            content={t(
              "debts:exportDrawer.resetColumnWidth",
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
                  "reset-column-sizing-invoice-debts-export-history",
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
                    ? t("debts:exportDrawer.downloading", "Đang tải...")
                    : t("debts:exportDrawer.downloadAgain", "Tải lại file"),
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
        header: t("debts:exportDrawer.table.createdAt", "Tạo lúc"),
        size: 160,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: t("debts:exportDrawer.table.period", "Kỳ / Khoảng ngày"),
        size: 170,
        cell: (row) =>
          row.dateFrom || row.dateTo
            ? toDisplayRange(row.dateFrom, row.dateTo)
            : t("debts:exportDrawer.allRange", "Tất cả"),
      },
      {
        key: "fileName",
        header: t("debts:exportDrawer.table.fileName", "Tên file"),
        size: 240,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "status",
        header: t("debts:exportDrawer.table.status", "Trạng thái"),
        size: 140,
        cell: (row) => {
          if (row.status === "COMPLETED") {
            return (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {t("debts:exportDrawer.status.ready", "Sẵn sàng tải")}
              </Badge>
            );
          }
          if (row.status === "FAILED") {
            return (
              <Badge variant="destructive">
                {t("debts:exportDrawer.status.failed", "Thất bại")}
              </Badge>
            );
          }

          const percent =
            row.total > 0 ? Math.round((row.current / row.total) * 100) : 0;

          return (
            <Badge className="bg-sky-50 text-sky-700 border-sky-200">
              {t("debts:exportDrawer.status.running", "Đang tạo")} {percent}%
            </Badge>
          );
        },
      },
      {
        key: "expiresAt",
        header: t("debts:exportDrawer.table.expiresAt", "Hết hạn"),
        size: 150,
        cell: (row) => toDisplayDate(row.expiresAt),
      },
      {
        key: "message",
        header: t("debts:exportDrawer.table.message", "Thông tin"),
        size: 200,
        cell: (row) => renderOverflowText(row.message),
      },
    ],
    [downloadingJobId, t],
  );

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("debts:exportDrawer.title", "Xuất Excel báo cáo công nợ")}
      subtitle={t(
        "debts:exportDrawer.subtitle",
        "Tạo file theo kỳ và tải lại file đã tạo trong 24 tiếng",
      )}
      icon={<FileSpreadsheet className="w-4 h-4" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t("debts:exportDrawer.historyTitle", "Lịch sử xuất file")}
            collapsible
            defaultCollapsed={false}
          >
            <StandardTable
              tableId="invoice-debts-export-history"
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
                "debts:exportDrawer.emptyHistory",
                "Chưa có file xuất nào",
              )}
            />
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t(
              "debts:exportDrawer.filterConditions",
              "Điều kiện xuất dữ liệu",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("debts:exportDrawer.partnerType", "Đối tượng công nợ")}
                </label>
                <PillTabs
                  className="w-full"
                  size="sm"
                  items={[
                    {
                      value: "CUSTOMER",
                      label: t("debts:exportDrawer.customer", "Khách hàng"),
                    },
                    {
                      value: "SUPPLIER",
                      label: t("debts:exportDrawer.supplier", "Nhà cung cấp"),
                    },
                  ]}
                  value={partnerType}
                  onValueChange={(val) =>
                    setPartnerType(val as InvoicePartnerType)
                  }
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("debts:exportDrawer.period", "Kỳ")}
                </label>
                <Combobox
                  options={periodOptions}
                  value={period}
                  onChange={(v) => handlePeriodChange(v ?? "")}
                  placeholder={t(
                    "debts:exportDrawer.selectPeriod",
                    "Chọn kỳ...",
                  )}
                  allowClear={false}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("debts:exportDrawer.dateFrom", "Từ ngày")}
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
                  {t("debts:exportDrawer.dateTo", "Đến ngày")}
                </label>
                <DatePicker
                  value={dateTo}
                  onChange={(v) => {
                    setDateTo(v);
                  }}
                  placeholder="dd/mm/yyyy"
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
                    ? t("debts:exportDrawer.starting", "Đang khởi tạo...")
                    : t("debts:exportDrawer.start", "Xuất Excel")}
                </Button>
              </div>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
