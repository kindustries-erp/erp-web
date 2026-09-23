import React, { useState } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { garageDashboardApi } from "../api/garageDashboardApi";
import { money } from "@/shared/utils/format";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Wallet,
  Wrench,
  Building2,
  Zap,
  HelpCircle,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { GarageCaseStandaloneDrawer } from "./GarageCaseStandaloneDrawer";
import { cn } from "@/shared/utils";
import toast from "react-hot-toast";
import { format } from "date-fns";

export interface GarageCheckpointDrawerProps {
  open: boolean;
  onClose: () => void;
  dateFrom: string;
  dateTo: string;
  periodLabel: string;
}

const CLASSIFICATION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  SUA_CHUA_CHUNG: {
    label: "Sửa chữa chung",
    icon: Wrench,
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  KY_GUI_NOI_BO: {
    label: "Ký gửi / Nội bộ",
    icon: Building2,
    color:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  OJ_NGOAI: {
    label: "OJ Ngoài",
    icon: Zap,
    color:
      "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  KHAC: {
    label: "Khác",
    icon: HelpCircle,
    color:
      "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  },
};

export function GarageCheckpointDrawer({
  open,
  onClose,
  dateFrom,
  dateTo,
  periodLabel,
}: GarageCheckpointDrawerProps) {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "all" | "remaining" | "paid" | "unpaid"
  >("all");
  const [classification, setClassification] = useState<string>("ALL");
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "garage",
      "checkpointCases",
      dateFrom,
      dateTo,
      page,
      search,
      paymentStatus,
      classification,
    ],
    queryFn: () =>
      garageDashboardApi.getCheckpointCases({
        date_from: dateFrom,
        date_to: dateTo,
        page,
        pageSize,
        search: search.trim() || undefined,
        payment_status: paymentStatus,
        classification: classification === "ALL" ? undefined : classification,
      }),
    enabled: open && !!dateFrom && !!dateTo,
  });

  const cases = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const summary = data?.summary;
  const classificationSummary = data?.classificationSummary;

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const blob = await garageDashboardApi.exportExcel({
        date_from: dateFrom,
        date_to: dateTo,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
      a.download = `Bao_cao_Chi_tiet_Garage_${periodLabel.replace(/\s+/g, "_")}_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Đã tải xuống file Excel báo cáo");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất file Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setPaymentStatus("all");
    setClassification("ALL");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" || paymentStatus !== "all" || classification !== "ALL";

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        layout="1-column"
        size="full"
        bodyClassName="p-0 overflow-hidden flex flex-col h-full min-h-0"
        title={`Vụ việc Dịch vụ Garage - ${periodLabel}`}
        subtitle={`Khoảng thời gian: ${dateFrom} đến ${dateTo} (${summary?.totalCount ?? total} vụ việc)`}
        titleExtra={
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-emerald-600">
              {summary?.totalCount ?? total} vụ việc hoàn tất
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={isExporting}
              onClick={handleExportExcel}
            >
              <Download className="w-3.5 h-3.5" />
              Xuất Excel
            </Button>
          </div>
        }
        actions={[
          {
            label: "Đóng",
            onClick: onClose,
          },
        ]}
        leftPanel={
          <div className="w-full flex flex-col flex-1 h-full min-h-0 bg-background">
            {/* Top Summary Banner: Realized Stats across the whole period */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-border/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Metric 1: Total Billed (Tổng Phải Thu) */}
              <div className="flex flex-col bg-surface border border-border/60 rounded-lg p-2.5 shadow-xs">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Tổng Phải Thu (Có VAT)
                </span>
                <span className="text-[15px] font-bold font-mono text-foreground mt-0.5 tabular-nums">
                  {money(summary?.totalTienCoThue || 0)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {summary?.totalCount || 0} phiếu hoàn tất
                </span>
              </div>

              {/* Metric 2: Paid & Collection Rate */}
              <div className="flex flex-col bg-surface border border-border/60 rounded-lg p-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Đã Thu Thực Tế
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold tabular-nums"
                  >
                    {(summary?.collectionRate || 0).toFixed(1)}%
                  </Badge>
                </div>
                <span className="text-[15px] font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                  {money(summary?.totalPaid || 0)}
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, summary?.collectionRate || 0))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Metric 3: Remaining Debt */}
              <div className="flex flex-col bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Còn Phải Thu (Nợ)
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10 font-bold tabular-nums"
                  >
                    {summary?.remainingCount || 0} phiếu
                  </Badge>
                </div>
                <span className="text-[15px] font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
                  {money(summary?.totalRemaining || 0)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {summary?.paidCount || 0} phiếu đã thu đủ 100%
                </span>
              </div>

              {/* Metric 4: Net Revenue */}
              <div className="flex flex-col bg-surface border border-border/60 rounded-lg p-2.5 shadow-xs">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Doanh Thu Thuần
                </span>
                <span className="text-[15px] font-bold font-mono text-foreground mt-0.5 tabular-nums">
                  {money(summary?.totalRevenue || 0)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Chưa trừ giá vốn
                </span>
              </div>

              {/* Metric 5: Gross Cost */}
              <div className="flex flex-col bg-surface border border-border/60 rounded-lg p-2.5 shadow-xs">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Giá Vốn Dịch Vụ
                </span>
                <span className="text-[15px] font-bold font-mono text-foreground mt-0.5 tabular-nums">
                  {money(summary?.totalCost || 0)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Phụ tùng + Gia công
                </span>
              </div>

              {/* Metric 6: Gross Profit */}
              <div className="flex flex-col bg-surface border border-border/60 rounded-lg p-2.5 shadow-xs">
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  Lãi Gộp Toàn Kỳ
                </span>
                <span
                  className={cn(
                    "text-[15px] font-bold font-mono mt-0.5 tabular-nums",
                    (summary?.totalProfit || 0) >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-rose-600",
                  )}
                >
                  {money(summary?.totalProfit || 0)}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Biên LN:{" "}
                  {(summary?.totalRevenue || 0) > 0
                    ? (
                        ((summary?.totalProfit || 0) /
                          (summary?.totalRevenue || 1)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>

            {/* Filter Bar: ERP Classification & Payment Status & Search */}
            <div className="p-3 border-b bg-background flex flex-col gap-2.5">
              {/* Row 1: ERP Classification Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">
                    Phân loại ERP:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setClassification("ALL");
                      setPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                      classification === "ALL"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-surface text-muted-foreground border-border hover:bg-muted/50",
                    )}
                  >
                    Tất cả ({summary?.totalCount || 0})
                  </button>
                  {Object.entries(CLASSIFICATION_CONFIG).map(([key, cfg]) => {
                    const cData = classificationSummary?.[key];
                    const count = cData?.count || 0;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setClassification(key);
                          setPage(1);
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1",
                          classification === key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-surface text-muted-foreground border-border hover:bg-muted/50",
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cfg.label}</span>
                        <span className="text-[10px] opacity-80 tabular-nums">
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive/90 gap-1 px-2"
                    onClick={handleResetFilters}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>

              {/* Row 2: Payment Status Filters & Search Input */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border/40">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">
                    Tiến độ thu:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("all");
                      setPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                      paymentStatus === "all"
                        ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-transparent"
                        : "bg-surface text-muted-foreground border-border hover:bg-muted/50",
                    )}
                  >
                    Tất cả ({total})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("remaining");
                      setPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1",
                      paymentStatus === "remaining"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
                    )}
                  >
                    <Wallet className="w-3 h-3" />
                    <span>Còn phải thu</span>
                    <span className="text-[10px] tabular-nums font-bold">
                      ({summary?.remainingCount || 0})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("paid");
                      setPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1",
                      paymentStatus === "paid"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
                    )}
                  >
                    <span>Đã thu đủ 100%</span>
                    <span className="text-[10px] tabular-nums font-bold">
                      ({summary?.paidCount || 0})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("unpaid");
                      setPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                      paymentStatus === "unpaid"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20",
                    )}
                  >
                    <span>Chưa thu ({summary?.unpaidCount || 0})</span>
                  </button>
                </div>

                {/* Search input & pagination summary */}
                <div className="flex items-center gap-3">
                  <div className="relative w-[240px]">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm biển số, số phiếu, KH..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full h-7 pl-8 pr-3 text-xs rounded-md border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Pagination control */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>
                      {page} / {totalPages} ({total})
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      disabled={page <= 1 || isLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      disabled={page >= totalPages || isLoading}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold border-b sticky top-0 bg-background z-10">
                  <tr>
                    <th className="px-3.5 py-2.5">Số chứng từ</th>
                    <th className="px-3.5 py-2.5">Biển số xe</th>
                    <th className="px-3.5 py-2.5">Khách hàng</th>
                    <th className="px-3.5 py-2.5 text-center">Phân loại</th>
                    <th className="px-3.5 py-2.5">Ngày hoàn thành</th>
                    <th className="px-3.5 py-2.5 text-center">Trạng thái</th>
                    <th className="px-3.5 py-2.5 text-right">Tổng phải thu</th>
                    <th className="px-3.5 py-2.5 text-right">Đã thu</th>
                    <th className="px-3.5 py-2.5 text-right">Còn phải thu</th>
                    <th className="px-3.5 py-2.5 text-right">
                      Doanh thu thuần
                    </th>
                    <th className="px-3.5 py-2.5 text-right">Lãi gộp</th>
                    <th className="px-3.5 py-2.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : cases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Không có vụ việc nào phù hợp với bộ lọc
                      </td>
                    </tr>
                  ) : (
                    cases.map((c) => {
                      const totalBilled = c.tienCoThue || c.doanhThu || 0;
                      const paid = c.tienDaThanhToan || 0;
                      const remaining = c.tienConPhaiThanhToan || 0;
                      const rate =
                        totalBilled > 0
                          ? Math.min(100, (paid / totalBilled) * 100)
                          : 0;
                      const classConfig =
                        CLASSIFICATION_CONFIG[c.classification || "KHAC"] ||
                        CLASSIFICATION_CONFIG.KHAC;

                      return (
                        <tr
                          key={c.id || c.soChungTu}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          {/* Số chứng từ */}
                          <td className="px-3.5 py-2 font-medium text-primary cursor-pointer hover:underline">
                            <span
                              onClick={() => setSelectedCaseCode(c.soChungTu)}
                            >
                              {c.soChungTu}
                            </span>
                          </td>

                          {/* Biển số xe */}
                          <td className="px-3.5 py-2 font-medium">
                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-semibold text-foreground">
                              {c.bienSoXe || "—"}
                            </span>
                          </td>

                          {/* Khách hàng */}
                          <td
                            className="px-3.5 py-2 text-muted-foreground max-w-[160px] truncate"
                            title={c.khachHangName}
                          >
                            {c.khachHangName || "—"}
                          </td>

                          {/* Phân loại ERP */}
                          <td className="px-3.5 py-2 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                                classConfig.color,
                              )}
                            >
                              {classConfig.label}
                            </span>
                          </td>

                          {/* Ngày hoàn thành */}
                          <td className="px-3.5 py-2 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                            {c.ngayHoanThanhCongViec
                              ? c.ngayHoanThanhCongViec.substring(0, 10)
                              : "—"}
                          </td>

                          {/* Trạng thái dịch vụ */}
                          <td className="px-3.5 py-2 text-center">
                            <div className="flex justify-center">
                              <KgaraCaseStatusBadge
                                status={c.tenTinhTrangDichVu || "Không rõ"}
                              />
                            </div>
                          </td>

                          {/* Tổng phải thu (Có VAT) */}
                          <td className="px-3.5 py-2 text-right font-bold font-mono text-foreground tabular-nums">
                            {money(totalBilled)}
                          </td>

                          {/* Đã thu & Mini Progress */}
                          <td className="px-3.5 py-2 text-right font-mono tabular-nums">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11.5px]">
                                {money(paid)}
                              </span>
                              <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Còn phải thu */}
                          <td className="px-3.5 py-2 text-right font-mono tabular-nums">
                            {remaining > 0 ? (
                              <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11.5px]">
                                {money(remaining)}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                                0 ₫
                              </span>
                            )}
                          </td>

                          {/* Doanh thu thuần */}
                          <td className="px-3.5 py-2 text-right text-muted-foreground font-mono tabular-nums">
                            {money(c.doanhThu)}
                          </td>

                          {/* Lãi gộp */}
                          <td className="px-3.5 py-2 text-right font-medium font-mono tabular-nums">
                            <span
                              className={
                                c.loiNhuan >= 0
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-rose-600"
                              }
                            >
                              {money(c.loiNhuan)}
                            </span>
                          </td>

                          {/* Thao tác */}
                          <td className="px-3.5 py-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setSelectedCaseCode(c.soChungTu)}
                              title="Xem chi tiết phiếu"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }
      />

      <GarageCaseStandaloneDrawer
        isOpen={!!selectedCaseCode}
        caseCode={selectedCaseCode}
        onClose={() => setSelectedCaseCode(null)}
        onSuccess={() => refetch()}
      />
    </>
  );
}
