import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import {
  Download,
  FileSpreadsheet,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
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
import { purchaseOrdersCoreApi } from "../api/purchaseOrdersCoreApi";
import { businessPartnersCoreApi } from "@/modules/business-partners-core/api/businessPartnersCoreApi";
import type { DataTableColumn } from "@/shared/components/DataTable";

export interface PoExportHistoryItem {
  id: string;
  createdAt: string;
  dateFrom: string;
  dateTo: string;
  supplierId?: string;
  supplierName?: string;
  status?: string;
  fileName: string;
}

interface PurchaseOrderExportDrawerProps {
  open: boolean;
  onClose: () => void;
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

const STORAGE_KEY = "erp_po_export_history";

export function PurchaseOrderExportDrawer({
  open,
  onClose,
}: PurchaseOrderExportDrawerProps) {
  const t = useT();

  const [period, setPeriod] = useState(initPeriod());
  const [dateFrom, setDateFrom] = useState(periodFirstDay(period));
  const [dateTo, setDateTo] = useState(periodLastDay(period));
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Lịch sử xuất file (lưu trữ local storage)
  const [historyItems, setHistoryItems] = useState<PoExportHistoryItem[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    },
  );

  const saveHistory = (items: PoExportHistoryItem[]) => {
    setHistoryItems(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  // Fetch danh sách nhà cung cấp (VENDOR)
  const suppliersQuery = useQuery({
    queryKey: ["purchase-orders-export-suppliers"],
    queryFn: async () => {
      const res = await businessPartnersCoreApi.list({
        partnerType: "VENDOR",
        pageSize: 200,
      });
      return res.items || [];
    },
    staleTime: 60_000,
    enabled: open,
  });

  const supplierOptions = useMemo(() => {
    const list = suppliersQuery.data || [];
    return [
      { value: "", label: t("Tất cả nhà cung cấp", "Tất cả nhà cung cấp") },
      ...list.map((s) => ({
        value: s.id,
        label: `${s.code ? s.code + " - " : ""}${s.name}`,
      })),
    ];
  }, [suppliersQuery.data, t]);

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("Tất cả trạng thái", "Tất cả trạng thái") },
      { value: "DRAFT", label: t("Bản nháp (DRAFT)", "Bản nháp (DRAFT)") },
      {
        value: "CONFIRMED",
        label: t("Đã xác nhận (CONFIRMED)", "Đã xác nhận (CONFIRMED)"),
      },
      {
        value: "COMPLETED",
        label: t("Hoàn tất (COMPLETED)", "Hoàn tất (COMPLETED)"),
      },
      {
        value: "CANCELLED",
        label: t("Đã hủy (CANCELLED)", "Đã hủy (CANCELLED)"),
      },
    ],
    [t],
  );

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

  const renderOverflowText = (text: string, className?: string) => {
    const value = text?.trim() || "-";
    const showTooltip = value.length > 32;

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
      setExporting(true);
      const supplierName = selectedSupplierId
        ? suppliersQuery.data?.find((s) => s.id === selectedSupplierId)?.name
        : undefined;

      const fileName = await purchaseOrdersCoreApi.exportExcelByRange({
        date_from: dateFrom,
        date_to: dateTo,
        supplier_id: selectedSupplierId || undefined,
        status: selectedStatus || undefined,
      });

      const newItem: PoExportHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        dateFrom,
        dateTo,
        supplierId: selectedSupplierId || undefined,
        supplierName,
        status: selectedStatus || undefined,
        fileName,
      };

      saveHistory([newItem, ...historyItems].slice(0, 50));
      toast.success(t("Xuất Excel đơn mua hàng thành công và đã tải xuống."));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t("Xuất Excel thất bại, vui lòng thử lại."),
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadAgain = async (item: PoExportHistoryItem) => {
    if (downloadingId) return;
    try {
      setDownloadingId(item.id);
      await purchaseOrdersCoreApi.exportExcelByRange({
        date_from: item.dateFrom,
        date_to: item.dateTo,
        supplier_id: item.supplierId,
        status: item.status,
        fileName: item.fileName,
      });
      toast.success(t("Đang tải lại file XLSX."));
    } catch (error: any) {
      toast.error(
        error?.message || t("Không thể tải file, vui lòng thử lại sau."),
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleClearHistory = () => {
    saveHistory([]);
    toast.success(t("Đã xóa lịch sử xuất file"));
  };

  const columns = useMemo<DataTableColumn<PoExportHistoryItem>[]>(
    () => [
      {
        key: "action",
        header: (
          <Tooltip content={t("Lịch sử xuất")}>
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
                    ? t("Đang tải...")
                    : t("Tải lại file"),
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
        header: t("Tạo lúc"),
        size: 140,
        cell: (row) => toDisplayDate(row.createdAt),
      },
      {
        key: "periodRange",
        header: t("Kỳ / Khoảng ngày"),
        size: 180,
        cell: (row) => toDisplayRange(row.dateFrom, row.dateTo),
      },
      {
        key: "fileName",
        header: t("Tên file"),
        size: 260,
        cell: (row) => renderOverflowText(row.fileName),
      },
      {
        key: "scope",
        header: t("Phạm vi"),
        size: 160,
        cell: (row) => {
          const parts: string[] = [];
          if (row.supplierName) parts.push(row.supplierName);
          if (row.status) parts.push(row.status);
          return renderOverflowText(
            parts.length ? parts.join(" • ") : t("Tất cả"),
          );
        },
      },
      {
        key: "status",
        header: t("Trạng thái"),
        size: 120,
        cell: () => (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            {t("Sẵn sàng")}
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
      title={t("Xuất Excel bảng kê đơn mua hàng")}
      subtitle={t(
        "Tạo file bảng kê 2 sheet (tổng quan đơn hàng và chi tiết từng dòng) theo kỳ",
      )}
      icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      layout="2-columns"
      size="lg"
      leftPanel={
        <div className="space-y-4">
          <DrawerSection
            title={`${t("Lịch sử xuất file")} (${historyItems.length})`}
            titleExtra={
              historyItems.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={handleClearHistory}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {t("Xóa lịch sử")}
                </Button>
              ) : undefined
            }
            collapsible
            defaultCollapsed={false}
          >
            <StandardTable
              tableId="purchase-order-export-history"
              variant="spreadsheet"
              enableColumnResizing={true}
              items={historyItems}
              columns={columns}
              getRowKey={(row) => row.id}
              emptyLabel={t("Chưa có file xuất nào trong lịch sử")}
            />
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="space-y-4">
          <DrawerSection
            title={t("Khoảng thời gian")}
            collapsible
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("Kỳ báo cáo")}
                </label>
                <Combobox
                  options={periodOptions}
                  value={period}
                  onChange={(v) => handlePeriodChange(v ?? "")}
                  placeholder={t("Chọn kỳ...")}
                  allowClear={false}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("Từ ngày")}
                </label>
                <DatePicker
                  value={dateFrom}
                  onChange={(v) => setDateFrom(v)}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("Đến ngày")}
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
            title={t("Phạm vi & Đối tượng")}
            collapsible
            defaultCollapsed={false}
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("Nhà cung cấp")}
                </label>
                <Combobox
                  options={supplierOptions}
                  value={selectedSupplierId}
                  onChange={(v) => setSelectedSupplierId(v ?? "")}
                  placeholder={t("Tất cả nhà cung cấp")}
                  allowClear={true}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t("Trạng thái đơn hàng")}
                </label>
                <Combobox
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={(v) => setSelectedStatus(v ?? "")}
                  placeholder={t("Tất cả trạng thái")}
                  allowClear={true}
                />
              </div>

              <div className="pt-2">
                <Button
                  className="w-full justify-center"
                  onClick={handleStartExport}
                  disabled={exporting}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  {exporting ? t("Đang xuất file Excel...") : t("Xuất Excel")}
                </Button>
              </div>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
