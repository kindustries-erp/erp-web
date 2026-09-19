import React, { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  Download,
  FileSpreadsheet,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
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
import {
  PERIOD_OPTS,
  periodFirstDay,
  periodLastDay,
  periodFromExactRange,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";
import {
  garageApi,
  type ExportCompletedCasesParams,
} from "@/modules/garage/api/garageApi";
import { useGarageBranches } from "@/modules/garage/hooks/useGarage";
import { GARAGE_CASE_CLASSIFICATIONS } from "./GarageCaseClassificationBadge";
import type { DataTableColumn } from "@/shared/components/DataTable";

export interface GarageCaseExportHistoryItem {
  id: string;
  createdAt: string;
  dateFrom: string;
  dateTo: string;
  dateType: "completion_date" | "case_date";
  branchId?: string;
  branchName?: string;
  classification?: string;
  status?: string;
  fileName: string;
}

interface GarageCaseExportDrawerProps {
  open: boolean;
  onClose: () => void;
  initialBranchId?: string;
}

function toDisplayDate(iso?: string) {
  if (!iso) return "-";
  const date = parseISO(iso);
  if (!isValid(date)) return "-";
  return format(date, "dd/MM/yyyy HH:mm");
}

function toDisplayRange(dateFrom?: string, dateTo?: string) {
  if (!dateFrom && !dateTo) return "-";
  return `${dateFrom} - ${dateTo}`;
}

const STORAGE_KEY = "erp_garage_case_export_history";

export function GarageCaseExportDrawer({
  open,
  onClose,
  initialBranchId,
}: GarageCaseExportDrawerProps) {
  const { t } = useTranslation("garage");
  const { data: branches } = useGarageBranches();

  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [dateType, setDateType] = useState<"completion_date" | "case_date">(
    "completion_date",
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialBranchId || "",
  );
  const [selectedClassification, setSelectedClassification] =
    useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("completed");

  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Lịch sử xuất file (lưu trữ localStorage tương tự PO export)
  const [historyItems, setHistoryItems] = useState<
    GarageCaseExportHistoryItem[]
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveHistory = (items: GarageCaseExportHistoryItem[]) => {
    setHistoryItems(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage error
    }
  };

  useEffect(() => {
    if (initialBranchId && !selectedBranchId) {
      setSelectedBranchId(initialBranchId);
    }
  }, [initialBranchId, selectedBranchId]);

  const branchOptions = useMemo(() => {
    const list = branches || [];
    return [
      {
        value: "",
        label: t("cases.exportDrawer.allBranches", "Tất cả chi nhánh"),
      },
      ...list.map((b: any) => ({
        value: b.externalId,
        label: b.name || b.code || b.externalId,
      })),
    ];
  }, [branches, t]);

  const classificationOptions = useMemo(
    () => [
      {
        value: "",
        label: t("cases.exportDrawer.allClassifications", "Tất cả phân loại"),
      },
      ...Object.entries(GARAGE_CASE_CLASSIFICATIONS).map(([k, meta]) => ({
        value: k,
        label: meta.label,
      })),
    ],
    [t],
  );

  const dateTypeOptions = useMemo(
    () => [
      {
        value: "completion_date",
        label: t(
          "cases.exportDrawer.dateTypeCompletion",
          "Ngày hoàn thành (kết thúc)",
        ),
      },
      {
        value: "case_date",
        label: t(
          "cases.exportDrawer.dateTypeCase",
          "Ngày tiếp nhận / phát sinh",
        ),
      },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      {
        value: "completed",
        label: t(
          "cases.exportDrawer.statusCompletedOnly",
          "Đã kết thúc / Hoàn tất (Mặc định)",
        ),
      },
      {
        value: "all",
        label: t("cases.exportDrawer.statusAll", "Tất cả trạng thái"),
      },
    ],
    [t],
  );

  const periodOptions = useMemo(
    () => [
      ...PERIOD_OPTS,
      {
        value: "custom",
        label: t("cases.exportDrawer.customRange", "Tùy chỉnh khoảng ngày"),
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

  const renderOverflowText = (text: string, className?: string) => {
    const value = text?.trim() || "-";
    const showTooltip = value.length > 30;

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
          "cases.exportDrawer.missingDateRange",
          "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.",
        ),
      );
      return;
    }

    try {
      setExporting(true);
      const branchName = selectedBranchId
        ? branches?.find((b: any) => b.externalId === selectedBranchId)?.name
        : undefined;

      const exportParams: ExportCompletedCasesParams = {
        date_from: dateFrom,
        date_to: dateTo,
        date_type: dateType,
        branchId: selectedBranchId || undefined,
        classification: selectedClassification || undefined,
        status: selectedStatus,
      };

      const fileName = await garageApi.exportCompletedCasesExcel(exportParams);

      const newItem: GarageCaseExportHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        dateFrom,
        dateTo,
        dateType,
        branchId: selectedBranchId || undefined,
        branchName,
        classification: selectedClassification || undefined,
        status: selectedStatus,
        fileName,
      };

      saveHistory([newItem, ...historyItems].slice(0, 50));
      toast.success(
        t(
          "cases.exportDrawer.exportSuccess",
          "Xuất Excel bảng kê phiếu dịch vụ thành công.",
        ),
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t(
            "cases.exportDrawer.exportFailed",
            "Xuất Excel thất bại, vui lòng thử lại.",
          ),
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadAgain = async (item: GarageCaseExportHistoryItem) => {
    if (downloadingId) return;
    try {
      setDownloadingId(item.id);
      await garageApi.exportCompletedCasesExcel({
        date_from: item.dateFrom,
        date_to: item.dateTo,
        date_type: item.dateType,
        branchId: item.branchId,
        classification: item.classification,
        status: item.status,
        customFileName: item.fileName,
      });
      toast.success(
        t("cases.exportDrawer.downloadAgainSuccess", "Đang tải lại file XLSX."),
      );
    } catch (error: any) {
      toast.error(
        error?.message ||
          t(
            "cases.exportDrawer.downloadFailed",
            "Không thể tải file, vui lòng thử lại sau.",
          ),
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleClearHistory = () => {
    saveHistory([]);
    toast.success(
      t("cases.exportDrawer.historyCleared", "Đã xóa lịch sử xuất file"),
    );
  };

  const columns = useMemo<DataTableColumn<GarageCaseExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: (
          <Tooltip
            content={t(
              "cases.exportDrawer.resetColumnWidth",
              "Khôi phục độ rộng cột",
            )}
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground mx-auto" />
          </Tooltip>
        ),
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableResizing: false,
        headerClassName: "w-[44px] min-w-[44px] text-center",
        className: "w-[44px] min-w-[44px] text-center",
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                label:
                  downloadingId === row.id
                    ? t("cases.exportDrawer.downloading", "Đang tải...")
                    : t("cases.exportDrawer.downloadAgain", "Tải lại file"),
                icon: <Download className="w-3.5 h-3.5" />,
                onClick: () => {
                  void handleDownloadAgain(row);
                },
                disabled: Boolean(downloadingId),
                loading: downloadingId === row.id,
              },
            ]}
          />
        ),
      },
      {
        key: "createdAt",
        header: t("cases.exportDrawer.table.createdAt", "Tạo lúc"),
        size: 140,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: t("cases.exportDrawer.table.period", "Kỳ / Khoảng ngày"),
        size: 180,
        cell: (row) => toDisplayRange(row.dateFrom, row.dateTo),
      },
      {
        key: "fileName",
        header: t("cases.exportDrawer.table.fileName", "Tên file"),
        size: 260,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "scope",
        header: t("cases.exportDrawer.table.scope", "Phạm vi"),
        size: 180,
        cell: (row) => {
          const parts: string[] = [];
          if (row.branchName) parts.push(row.branchName);
          if (row.classification) {
            const classLabel =
              GARAGE_CASE_CLASSIFICATIONS[row.classification]?.label ||
              row.classification;
            parts.push(classLabel);
          }
          if (row.dateType === "case_date") {
            parts.push("Ngày phát sinh");
          } else {
            parts.push("Ngày hoàn thành");
          }
          return renderOverflowText(
            parts.length
              ? parts.join(" • ")
              : t("cases.exportDrawer.allScope", "Tất cả"),
          );
        },
      },
      {
        key: "status",
        header: t("cases.exportDrawer.table.status", "Trạng thái"),
        size: 120,
        cell: () => (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            {t("cases.exportDrawer.ready", "Sẵn sàng")}
          </Badge>
        ),
      },
    ],
    [downloadingId, t],
  );

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("cases.exportDrawer.title", "Xuất Excel bảng kê phiếu dịch vụ")}
      subtitle={t(
        "cases.exportDrawer.subtitle",
        "Tạo file bảng kê 2 sheet (Tổng quan phiếu kết thúc & Chi tiết DV/phụ tùng) theo kỳ",
      )}
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <div className="space-y-4">
          <DrawerSection
            title={`${t("cases.exportDrawer.historyTitle", "Lịch sử xuất file")} (${historyItems.length})`}
            titleExtra={
              historyItems.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={handleClearHistory}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {t("cases.exportDrawer.clearHistory", "Xóa lịch sử")}
                </Button>
              ) : undefined
            }
            collapsible
            defaultCollapsed={false}
          >
            <StandardTable
              tableId="garage-case-export-history"
              variant="spreadsheet"
              enableColumnResizing={true}
              items={historyItems}
              columns={columns}
              getRowKey={(row) => row.id}
              emptyLabel={t(
                "cases.exportDrawer.emptyHistory",
                "Chưa có file xuất nào trong lịch sử",
              )}
            />
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t(
              "cases.exportDrawer.timeConditions",
              "Khoảng thời gian báo cáo",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("cases.exportDrawer.period", "Kỳ báo cáo")}
                </label>
                <Combobox
                  options={periodOptions}
                  value={period}
                  onChange={(v) => handlePeriodChange(v ?? "")}
                  placeholder={t(
                    "cases.exportDrawer.selectPeriod",
                    "Chọn kỳ...",
                  )}
                  allowClear={false}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("cases.exportDrawer.dateType", "Loại ngày lọc")}
                </label>
                <Combobox
                  options={dateTypeOptions}
                  value={dateType}
                  onChange={(v) =>
                    setDateType(
                      (v as "completion_date" | "case_date") ||
                        "completion_date",
                    )
                  }
                  allowClear={false}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("cases.exportDrawer.dateFrom", "Từ ngày")}
                </label>
                <DatePicker
                  value={dateFrom}
                  onChange={(v) => setDateFrom(v)}
                  placeholder="dd/mm/yyyy"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("cases.exportDrawer.dateTo", "Đến ngày")}
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
            title={t(
              "cases.exportDrawer.scopeConditions",
              "Phạm vi & Điều kiện lọc",
            )}
            collapsible
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("cases.exportDrawer.branch", "Chi nhánh")}
                </label>
                <Combobox
                  options={branchOptions}
                  value={selectedBranchId}
                  onChange={(v) => setSelectedBranchId(v ?? "")}
                  placeholder={t(
                    "cases.exportDrawer.allBranches",
                    "Tất cả chi nhánh",
                  )}
                  allowClear={true}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("cases.exportDrawer.classification", "Phân loại vụ việc")}
                </label>
                <Combobox
                  options={classificationOptions}
                  value={selectedClassification}
                  onChange={(v) => setSelectedClassification(v ?? "")}
                  placeholder={t(
                    "cases.exportDrawer.allClassifications",
                    "Tất cả phân loại",
                  )}
                  allowClear={true}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("cases.exportDrawer.status", "Trạng thái phiếu")}
                </label>
                <Combobox
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(v) => setSelectedStatus(v ?? "completed")}
                  allowClear={false}
                />
              </div>

              <div className="pt-2">
                <Button
                  className="w-full justify-center"
                  onClick={handleStartExport}
                  disabled={exporting}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  {exporting
                    ? t(
                        "cases.exportDrawer.exporting",
                        "Đang tạo file Excel...",
                      )
                    : t("cases.exportDrawer.startExport", "Xuất Excel")}
                </Button>
              </div>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
