import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { BarChart } from "@/shared/components/charts/BarChart";
import { LineChart } from "@/shared/components/charts/LineChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { garageApi } from "../api/garageApi";
import { GarageCaseStandaloneDrawer } from "./GarageCaseStandaloneDrawer";
import { GarageCaseSettlementDrawerModal } from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionDrawer } from "./InvoiceSelectionDrawer";
import { useSyncGarageCaseDetail } from "../hooks/useGarage";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import {
  DataTable,
  type DataTableColumn,
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { Button } from "@/shared/components/ui/Button";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { PillTabs } from "@/shared/components/PillTabs";
import { toast } from "react-hot-toast";
import {
  Building2,
  Car,
  Eye,
  Pencil,
  Scale,
  Link2,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  RotateCcw,
} from "lucide-react";

interface GarageCustomerDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  customerCode: string | null;
  customerName?: string;
  branchId?: string;
}

export function GarageCustomerDetailDrawer({
  open,
  onClose,
  customerCode,
  customerName,
  branchId,
}: GarageCustomerDetailDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const { mutate: syncCaseDetail } = useSyncGarageCaseDetail();
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState<boolean>(false);
  const [settlementCase, setSettlementCase] = useState<any | null>(null);
  const [invoiceLinkingCase, setInvoiceLinkingCase] = useState<any | null>(
    null,
  );

  // Sub-tabs navigation state (Left Panel)
  const [activeSubTab, setActiveSubTab] = useState<string>("cases");

  // Client-side pagination state for drawer table
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Table client state hook
  const tableState = useTableColumnState(
    `garage-customer-cases-detail-${customerCode || "unknown"}`,
  );

  const {
    data: cases = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["garage-cases-by-customer", branchId, customerCode],
    queryFn: () => {
      if (!customerCode) return Promise.resolve([]);
      return garageApi.getCasesByCustomer(branchId || "", customerCode);
    },
    enabled: open && Boolean(customerCode),
  });

  // Reset pagination when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [
    customerCode,
    tableState.columnSearch,
    tableState.columnFilters,
    tableState.sorts,
    tableState.dateFrom,
    tableState.dateTo,
  ]);

  const totals = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let maxAging = 0;
    let aging0_30 = 0;
    let aging31_60 = 0;
    let aging61_90 = 0;
    let agingOver90 = 0;

    const uniqueVehicles = new Set<string>();

    cases.forEach((c: any) => {
      const rev = Number(c.tienCoThue) || 0;
      const paid = Number(c.tienDaThanhToan) || 0;
      const bal = Number(c.tienConPhaiThanhToan) || 0;
      const aging = Number(c.agingDays) || 0;

      if (c.bienSoXe) uniqueVehicles.add(c.bienSoXe);

      totalRevenue += rev;
      totalPaid += paid;
      totalBalance += bal;
      if (bal > 0 && aging > maxAging) maxAging = aging;

      if (bal > 0) {
        if (aging <= 30) aging0_30 += bal;
        else if (aging <= 60) aging31_60 += bal;
        else if (aging <= 90) aging61_90 += bal;
        else agingOver90 += bal;
      }
    });

    return {
      totalRevenue,
      totalPaid,
      totalBalance,
      maxAging,
      aging0_30,
      aging31_60,
      aging61_90,
      agingOver90,
      vehicleCount: uniqueVehicles.size,
      recoveryRate:
        totalRevenue > 0
          ? Math.min(100, Math.round((totalPaid / totalRevenue) * 100))
          : totalBalance === 0
            ? 100
            : 0,
    };
  }, [cases]);

  // Vehicle-based debt matrix aggregation for Analytics tab
  const vehicleDebtStats = useMemo(() => {
    const map: Record<
      string,
      {
        licensePlate: string;
        latestDate?: string;
        caseCount: number;
        totalRevenue: number;
        totalPaid: number;
        totalBalance: number;
        maxAgingDays: number;
      }
    > = {};

    cases.forEach((c: any) => {
      const plate = c.bienSoXe || "Khác / Chưa rõ";
      const caseDate = c.ngayPhatSinh || c.createdAt;
      if (!map[plate]) {
        map[plate] = {
          licensePlate: plate,
          latestDate: caseDate,
          caseCount: 0,
          totalRevenue: 0,
          totalPaid: 0,
          totalBalance: 0,
          maxAgingDays: 0,
        };
      } else if (
        caseDate &&
        (!map[plate].latestDate || caseDate > map[plate].latestDate!)
      ) {
        map[plate].latestDate = caseDate;
      }
      const rev = Number(c.tienCoThue) || 0;
      const paid = Number(c.tienDaThanhToan) || 0;
      const bal = Number(c.tienConPhaiThanhToan) || 0;
      const aging = Number(c.agingDays) || 0;

      map[plate].caseCount += 1;
      map[plate].totalRevenue += rev;
      map[plate].totalPaid += paid;
      map[plate].totalBalance += bal;
      if (bal > 0 && aging > map[plate].maxAgingDays) {
        map[plate].maxAgingDays = aging;
      }
    });

    return Object.values(map).sort((a, b) => b.totalBalance - a.totalBalance);
  }, [cases]);

  // Aging distribution Donut data
  const agingDonutItems = useMemo(() => {
    return [
      { label: "0-30 ngày", value: totals.aging0_30, color: "#10b981" },
      { label: "31-60 ngày", value: totals.aging31_60, color: "#f59e0b" },
      { label: "61-90 ngày", value: totals.aging61_90, color: "#f97316" },
      { label: ">90 ngày", value: totals.agingOver90, color: "#f43f5e" },
    ].filter((item) => item.value > 0);
  }, [totals]);

  // Monthly trend BarChart data (Stacked: Đã thanh toán + Còn nợ = Tổng phát sinh)
  const monthlyBarData = useMemo(() => {
    const monthMap: Record<
      string,
      { paid: number; balance: number; total: number }
    > = {};

    cases.forEach((c: any) => {
      const dateStr = c.ngayPhatSinh || c.createdAt;
      if (!dateStr) return;
      const monthKey = String(dateStr).slice(0, 7); // "YYYY-MM"
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { paid: 0, balance: 0, total: 0 };
      }
      const rev = Number(c.tienCoThue) || 0;
      const paid = Number(c.tienDaThanhToan) || 0;
      const bal = Number(c.tienConPhaiThanhToan) || 0;

      monthMap[monthKey].paid += paid;
      monthMap[monthKey].balance += bal;
      monthMap[monthKey].total += rev;
    });

    const sortedMonths = Object.keys(monthMap).sort();
    const labels = sortedMonths.map((m) => {
      const [year, month] = m.split("-");
      return `Th${month}/${year?.slice(2) || ""}`;
    });
    const paidData = sortedMonths.map((m) => monthMap[m].paid);
    const balData = sortedMonths.map((m) => monthMap[m].balance);

    return {
      labels,
      datasets: [
        {
          label: t("customers.drawer.paidAmount", "Đã thanh toán"),
          data: paidData,
          color: "#10b981", // emerald-500
        },
        {
          label: t("customers.drawer.balanceAmount", "Còn nợ"),
          data: balData,
          color: "#f97316", // orange-500
        },
      ],
    };
  }, [cases, t]);

  // Cumulative Cashflow & Balance Run-rate Trend Data (LineChart)
  const cumulativeTrendData = useMemo(() => {
    const monthMap: Record<string, { rev: number; paid: number; bal: number }> =
      {};
    cases.forEach((c: any) => {
      const dateStr = c.ngayPhatSinh || c.createdAt;
      if (!dateStr) return;
      const monthKey = String(dateStr).slice(0, 7); // "YYYY-MM"
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { rev: 0, paid: 0, bal: 0 };
      }
      monthMap[monthKey].rev += Number(c.tienCoThue) || 0;
      monthMap[monthKey].paid += Number(c.tienDaThanhToan) || 0;
      monthMap[monthKey].bal += Number(c.tienConPhaiThanhToan) || 0;
    });

    const sortedMonths = Object.keys(monthMap).sort();
    const labels = sortedMonths.map((m) => {
      const [year, month] = m.split("-");
      return `Th${month}/${year?.slice(2) || ""}`;
    });

    let runningRev = 0;
    let runningPaid = 0;
    const cumRevData: number[] = [];
    const cumPaidData: number[] = [];
    const balanceData: number[] = [];

    sortedMonths.forEach((m) => {
      runningRev += monthMap[m].rev;
      runningPaid += monthMap[m].paid;
      cumRevData.push(runningRev);
      cumPaidData.push(runningPaid);
      balanceData.push(Math.max(0, runningRev - runningPaid));
    });

    return {
      labels,
      datasets: [
        {
          label: t("customers.drawer.cumRevenue", "Tổng phát sinh tích lũy"),
          data: cumRevData,
          color: "#3b82f6", // blue-500
          fill: false,
        },
        {
          label: t("customers.drawer.cumPaid", "Tiền đã thu tích lũy"),
          data: cumPaidData,
          color: "#10b981", // emerald-500
          fill: false,
        },
        {
          label: t("customers.drawer.cumBalance", "Dư nợ còn lại"),
          data: balanceData,
          color: "#ef4444", // rose-500
          fill: false,
          borderDash: [4, 4],
        },
      ],
    };
  }, [cases, t]);

  // Vehicle Breakdown Stacked Bar Chart Data (Top 10 Vehicles by debt/volume)
  const vehicleBarData = useMemo(() => {
    const sortedVehicles = [...vehicleDebtStats].slice(0, 10);
    const labels = sortedVehicles.map((v) => v.licensePlate);
    const paidData = sortedVehicles.map((v) => v.totalPaid);
    const balData = sortedVehicles.map((v) => v.totalBalance);

    return {
      labels,
      datasets: [
        {
          label: t("customers.drawer.paidAmount", "Đã thu"),
          data: paidData,
          color: "#10b981", // emerald-500
        },
        {
          label: t("customers.drawer.balanceAmount", "Còn nợ"),
          data: balData,
          color: "#f97316", // orange-500
        },
      ],
    };
  }, [vehicleDebtStats, t]);

  const resolvedName =
    customerName ||
    cases[0]?.khachHangName ||
    customerCode ||
    t("customers.drawer.title", "Hồ sơ công nợ khách hàng");

  // Aging bucket extractor helper
  const getAgingBucket = (item: any) => {
    const bal = Number(item.tienConPhaiThanhToan) || 0;
    if (bal <= 0) return "PAID";
    const aging = Number(item.agingDays) || 0;
    if (aging <= 30) return "0-30";
    if (aging <= 60) return "31-60";
    if (aging <= 90) return "61-90";
    return ">90";
  };

  // Universal client-side filter and sorter
  const filteredCases = useMemo(() => {
    return filterClientItems(cases, tableState, {
      dateField: "ngayPhatSinh",
      customExtractors: {
        agingDays: getAgingBucket,
      },
    });
  }, [cases, tableState]);

  // Client-side paginated cases for table
  const totalItems = filteredCases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedCases = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, page, pageSize]);

  // Column Header Filter Builder
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: cases,
        defaultAlign: "center",
      }),
    [tableState, cases],
  );

  // Floating Action Bar & Right-Click Context Menu items builder
  const getRowActions = useCallback(
    (row: any) => [
      {
        groupLabel: "VỤ VIỆC",
        items: [
          {
            label: t("customers.drawer.viewDetail", "Xem chi tiết"),
            icon: <Eye className="w-4 h-4" />,
            onClick: () => {
              setDrawerEditMode(false);
              setSelectedCaseCode(row.soChungTu);
            },
          },
          {
            label: t("customers.drawer.editCase", "Chỉnh sửa"),
            icon: <Pencil className="w-4 h-4 text-amber-600" />,
            onClick: () => {
              setDrawerEditMode(true);
              setSelectedCaseCode(row.soChungTu);
            },
          },
          {
            label: t("customers.drawer.syncFromKgara", "Đồng bộ từ KGara"),
            icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
            onClick: () => {
              syncCaseDetail(row.id, {
                onSuccess: () => {
                  toast.success(
                    t("cases.syncSuccess", "Đã đồng bộ chi tiết vụ việc"),
                  );
                  void refetch();
                },
              });
            },
          },
        ],
      },
      {
        groupLabel: "TÀI CHÍNH & HÓA ĐƠN",
        items: [
          {
            label: t("customers.drawer.netOffVoucher", "Cấn trừ sao kê"),
            icon: <Scale className="w-4 h-4 text-emerald-600" />,
            onClick: () => setSettlementCase(row),
          },
          {
            label: t("customers.drawer.linkInvoice", "Liên kết hóa đơn VAT"),
            icon: <Link2 className="w-4 h-4 text-indigo-600" />,
            onClick: () => setInvoiceLinkingCase(row),
          },
        ],
      },
    ],
    [syncCaseDetail, refetch, t],
  );

  // Columns definition following /standardize-table & /invoice-debts (13 columns, no fixed action column)
  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
      // 1. STT (#)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        enableResizing: false,
        className: "text-center w-[40px] min-w-[40px]",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => <span>{idx}</span>,
      },
      // 2. Số chứng từ
      {
        key: "soChungTu",
        header: headerFilter(
          "soChungTu",
          t("customers.drawer.caseCode", "Số chứng từ"),
        ),
        size: 175,
        minSize: 155,
        enableResizing: true,
        cell: (row: any) => (
          <TableText
            text={row.soChungTu || "N/A"}
            enableCopy={true}
            tooltip={true}
            className="font-mono text-primary font-medium"
            onDetailClick={(e) => {
              e?.stopPropagation();
              setDrawerEditMode(false);
              setSelectedCaseCode(row.soChungTu);
            }}
          />
        ),
      },
      // 3. Biển số xe
      {
        key: "bienSoXe",
        header: headerFilter(
          "bienSoXe",
          t("customers.drawer.licensePlate", "Biển số xe"),
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        cell: (row: any) => (
          <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground bg-muted/50 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap">
            <Car className="w-3 h-3 text-muted-foreground shrink-0" />
            {row.bienSoXe || "—"}
          </span>
        ),
      },
      // 4. Ngày tiếp nhận
      {
        key: "ngayPhatSinh",
        className: "text-right",
        header: headerFilter.date(
          "ngayPhatSinh",
          t("customers.drawer.caseDate", "Ngày tiếp nhận"),
        ),
        size: 125,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <TableDateCell
            date={row.ngayPhatSinh}
            format="date"
            className="justify-end w-full"
          />
        ),
      },
      // 5. Tổng tiền
      {
        key: "tienCoThue",
        className: "text-right",
        header: headerFilter.amount(
          "tienCoThue",
          t("customers.drawer.totalAmount", "Tổng tiền"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
            {money(row.tienCoThue)}
          </span>
        ),
      },
      // 6. Đã thu
      {
        key: "tienDaThanhToan",
        className: "text-right",
        header: headerFilter.amount(
          "tienDaThanhToan",
          t("customers.drawer.paidAmount", "Đã thu"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <span className="tabular-nums font-mono font-medium text-xs text-emerald-700 dark:text-emerald-400">
            {money(row.tienDaThanhToan)}
          </span>
        ),
      },
      // 7. Còn nợ
      {
        key: "tienConPhaiThanhToan",
        className: "text-right",
        header: headerFilter.amount(
          "tienConPhaiThanhToan",
          t("customers.drawer.balanceAmount", "Còn nợ"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => (
          <span
            className={cn(
              "tabular-nums font-mono font-bold text-xs",
              row.tienConPhaiThanhToan > 0
                ? "text-destructive"
                : "text-muted-foreground font-normal",
            )}
          >
            {money(row.tienConPhaiThanhToan)}
          </span>
        ),
      },
      // 8. 0-30 ngày
      {
        key: "aging0_30",
        className:
          "text-right bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-xs",
        headerClassName:
          "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-right justify-end",
        header: headerFilter.amount(
          "aging0_30",
          t("customers.drawer.aging0_30", "0-30 ngày"),
        ),
        size: 125,
        minSize: 110,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          const aging = Number(row.agingDays) || 0;
          const val = bal > 0 && aging <= 30 ? bal : 0;
          if (val <= 0) {
            return (
              <span className="text-muted-foreground/30 font-normal select-none">
                —
              </span>
            );
          }
          return (
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {money(val)}
            </span>
          );
        },
      },
      // 9. 31-60 ngày
      {
        key: "aging31_60",
        className:
          "text-right bg-amber-50/40 dark:bg-amber-950/20 font-mono text-xs",
        headerClassName:
          "bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-right justify-end",
        header: headerFilter.amount(
          "aging31_60",
          t("customers.drawer.aging31_60", "31-60 ngày"),
        ),
        size: 125,
        minSize: 110,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          const aging = Number(row.agingDays) || 0;
          const val = bal > 0 && aging > 30 && aging <= 60 ? bal : 0;
          if (val <= 0) {
            return (
              <span className="text-muted-foreground/30 font-normal select-none">
                —
              </span>
            );
          }
          return (
            <span className="font-semibold text-amber-800 dark:text-amber-300 tabular-nums">
              {money(val)}
            </span>
          );
        },
      },
      // 10. 61-90 ngày
      {
        key: "aging61_90",
        className:
          "text-right bg-orange-50/40 dark:bg-orange-950/20 font-mono text-xs",
        headerClassName:
          "bg-orange-50/80 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-semibold text-right justify-end",
        header: headerFilter.amount(
          "aging61_90",
          t("customers.drawer.aging61_90", "61-90 ngày"),
        ),
        size: 125,
        minSize: 110,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          const aging = Number(row.agingDays) || 0;
          const val = bal > 0 && aging > 60 && aging <= 90 ? bal : 0;
          if (val <= 0) {
            return (
              <span className="text-muted-foreground/30 font-normal select-none">
                —
              </span>
            );
          }
          return (
            <span className="font-semibold text-orange-700 dark:text-orange-400 tabular-nums">
              {money(val)}
            </span>
          );
        },
      },
      // 11. >90 ngày
      {
        key: "agingOver90",
        className:
          "text-right bg-rose-50/40 dark:bg-rose-950/20 font-mono text-xs",
        headerClassName:
          "bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold text-right justify-end",
        header: headerFilter.amount(
          "agingOver90",
          t("customers.drawer.agingOver90", ">90 ngày"),
        ),
        size: 130,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          const aging = Number(row.agingDays) || 0;
          const val = bal > 0 && aging > 90 ? bal : 0;
          if (val <= 0) {
            return (
              <span className="text-muted-foreground/30 font-normal select-none">
                —
              </span>
            );
          }
          return (
            <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
              {money(val)}
            </span>
          );
        },
      },
      // 12. Tuổi nợ (Badge)
      {
        key: "agingDays",
        className: "text-center",
        header: headerFilter.numeric(
          "agingDays",
          t("customers.drawer.agingDays", "Tuổi nợ"),
        ),
        size: 105,
        minSize: 95,
        enableResizing: true,
        cell: (row: any) => {
          if (row.tienConPhaiThanhToan <= 0) {
            return (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-normal"
              >
                Đã tất toán
              </Badge>
            );
          }
          const aging = Number(row.agingDays) || 0;
          const isOver90 = aging > 90;
          const is61to90 = aging > 60 && aging <= 90;
          const is31to60 = aging > 30 && aging <= 60;
          const tagCls = isOver90
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : is61to90
              ? "bg-orange-50 text-orange-700 border-orange-200"
              : is31to60
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200";

          return (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 font-mono font-medium",
                tagCls,
              )}
            >
              {aging} ngày
            </Badge>
          );
        },
      },
      // 13. Trạng thái
      {
        key: "status",
        className: "text-center",
        header: headerFilter(
          "status",
          t("customers.drawer.status", "Trạng thái"),
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        cell: (row: any) => (
          <KgaraCaseStatusBadge status={row.tenTinhTrangDichVu || "Kết thúc"} />
        ),
      },
    ];
  }, [headerFilter, t]);

  // Subtotal Summary Row for Drawer Table
  const summaryRow = useMemo(() => {
    if (!filteredCases || filteredCases.length === 0) return undefined;

    let subtotalRev = 0;
    let subtotalPaid = 0;
    let subtotalBal = 0;
    let subtotalA0_30 = 0;
    let subtotalA31_60 = 0;
    let subtotalA61_90 = 0;
    let subtotalAOver90 = 0;

    for (const c of paginatedCases) {
      const rev = Number(c.tienCoThue) || 0;
      const paid = Number(c.tienDaThanhToan) || 0;
      const bal = Number(c.tienConPhaiThanhToan) || 0;
      const aging = Number(c.agingDays) || 0;

      subtotalRev += rev;
      subtotalPaid += paid;
      subtotalBal += bal;

      if (bal > 0) {
        if (aging <= 30) subtotalA0_30 += bal;
        else if (aging <= 60) subtotalA31_60 += bal;
        else if (aging <= 90) subtotalA61_90 += bal;
        else subtotalAOver90 += bal;
      }
    }

    const cumCount = (page - 1) * pageSize + paginatedCases.length;

    return {
      soChungTu: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={page}
          totalPages={totalPages}
          totalCount={totalItems}
          currentPageCount={paginatedCases.length}
          cumulativeCount={cumCount}
          itemTitle={t("customers.drawer.caseCode", "Phiếu")}
          itemUnit={t("cases.summary.unit", "phiếu")}
        />
      ),
      tienCoThue: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.drawer.totalAmount", "Tổng tiền")}
          itemTitle={t("customers.drawer.caseCode", "Phiếu")}
          itemUnit={t("cases.summary.unit", "phiếu")}
          subtotalAmount={subtotalRev}
          grandTotalAmount={totals.totalRevenue}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedCases.length}
          totalCount={totalItems}
          valueClassName="text-foreground font-bold font-mono"
        />
      ),
      tienDaThanhToan: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.drawer.paidAmount", "Đã thu")}
          itemTitle={t("customers.drawer.caseCode", "Phiếu")}
          itemUnit={t("cases.summary.unit", "phiếu")}
          subtotalAmount={subtotalPaid}
          grandTotalAmount={totals.totalPaid}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedCases.length}
          totalCount={totalItems}
          valueClassName="text-emerald-700 dark:text-emerald-400 font-bold font-mono"
        />
      ),
      tienConPhaiThanhToan: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.drawer.balanceAmount", "Còn nợ")}
          itemTitle={t("customers.drawer.caseCode", "Phiếu")}
          itemUnit={t("cases.summary.unit", "phiếu")}
          subtotalAmount={subtotalBal}
          grandTotalAmount={totals.totalBalance}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedCases.length}
          totalCount={totalItems}
          valueClassName={
            subtotalBal === 0
              ? "font-bold text-emerald-600 dark:text-emerald-400 font-mono"
              : "font-bold text-destructive font-mono"
          }
        />
      ),
      aging0_30: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.drawer.aging0_30", "0-30 ngày")}
          itemTitle={t("customers.drawer.caseCode", "Phiếu")}
          itemUnit={t("cases.summary.unit", "phiếu")}
          subtotalAmount={subtotalA0_30}
          grandTotalAmount={totals.aging0_30}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedCases.length}
          totalCount={totalItems}
          valueClassName="font-bold text-emerald-700 dark:text-emerald-400 font-mono"
        />
      ),
      aging31_60: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.drawer.aging31_60", "31-60 ngày")}
          itemTitle={t("customers.drawer.caseCode", "Phiếu")}
          itemUnit={t("cases.summary.unit", "phiếu")}
          subtotalAmount={subtotalA31_60}
          grandTotalAmount={totals.aging31_60}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedCases.length}
          totalCount={totalItems}
          valueClassName="font-bold text-amber-800 dark:text-amber-300 font-mono"
        />
      ),
      aging61_90: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.drawer.aging61_90", "61-90 ngày")}
          itemTitle={t("customers.drawer.caseCode", "Phiếu")}
          itemUnit={t("cases.summary.unit", "phiếu")}
          subtotalAmount={subtotalA61_90}
          grandTotalAmount={totals.aging61_90}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedCases.length}
          totalCount={totalItems}
          valueClassName="font-bold text-orange-700 dark:text-orange-400 font-mono"
        />
      ),
      agingOver90: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.drawer.agingOver90", ">90 ngày")}
          itemTitle={t("customers.drawer.caseCode", "Phiếu")}
          itemUnit={t("cases.summary.unit", "phiếu")}
          subtotalAmount={subtotalAOver90}
          grandTotalAmount={totals.agingOver90}
          page={page}
          totalPages={totalPages}
          currentPageCount={paginatedCases.length}
          totalCount={totalItems}
          valueClassName="font-bold text-rose-700 dark:text-rose-400 font-mono"
        />
      ),
    };
  }, [
    paginatedCases,
    filteredCases,
    page,
    pageSize,
    totalPages,
    totalItems,
    totals,
    t,
  ]);

  // Right Panel: Thông tin khách hàng & KPI Tổng quan tài chính (As requested)
  const rightPanelContent = (
    <div className="space-y-4">
      {/* 1. THÔNG TIN KHÁCH HÀNG (Placed on Right Panel) */}
      <DrawerSection
        title={t("customers.drawer.generalInfo", "Thông tin khách hàng")}
      >
        <div className="space-y-1 text-xs">
          <DrawerRow
            label={t("customers.columns.customerName", "Tên khách hàng")}
            value={
              <span className="font-semibold text-foreground break-words select-text">
                {resolvedName}
              </span>
            }
          />
          <DrawerRow
            label={t("customers.columns.customerCode", "Mã KH")}
            value={
              <Badge
                variant="outline"
                className="font-mono font-medium text-[11px]"
              >
                {customerCode || "NO_CODE"}
              </Badge>
            }
          />
          <DrawerRow
            label={t("customers.drawer.licensePlate", "Số lượng xe")}
            value={
              <span className="font-mono font-medium text-foreground">
                {totals.vehicleCount} phương tiện
              </span>
            }
          />
          <DrawerRow
            label={t("customers.columns.caseCount", "SL Phiếu DV")}
            value={
              <span className="font-mono font-medium text-primary">
                {cases.length} phiếu dịch vụ
              </span>
            }
          />
        </div>
      </DrawerSection>

      {/* 2. CHỈ SỐ CÔNG NỢ & THU HỒI */}
      <DrawerSection
        title={t(
          "customers.drawer.financialOverview",
          "Chỉ số công nợ & Thu hồi",
        )}
      >
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-lg border bg-card/60 space-y-1">
            <span className="text-[11px] text-muted-foreground font-normal">
              {t("customers.drawer.totalReceivable", "Tổng phát sinh")}
            </span>
            <div className="font-mono font-bold text-sm text-foreground">
              {money(totals.totalRevenue)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg border bg-card/60 space-y-1">
            <span className="text-[11px] text-muted-foreground font-normal">
              {t("customers.drawer.totalPaid", "Đã thu")}
            </span>
            <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {money(totals.totalPaid)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg border bg-card/60 space-y-1">
            <span className="text-[11px] text-muted-foreground font-normal">
              {t("customers.drawer.totalBalance", "Dư nợ còn lại")}
            </span>
            <div
              className={cn(
                "font-mono font-bold text-sm",
                totals.totalBalance > 0
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {money(totals.totalBalance)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg border bg-card/60 space-y-1">
            <span className="text-[11px] text-muted-foreground font-normal">
              {t("customers.drawer.recoveryRate", "Tỷ lệ thu hồi")}
            </span>
            <div className="font-mono font-bold text-sm text-primary">
              {totals.recoveryRate}%
            </div>
          </div>
        </div>

        {/* Progress bar for recovery rate */}
        <div className="space-y-1.5 pt-1 border-t border-border/40">
          <div className="flex justify-between items-center text-[11px] text-muted-foreground">
            <span>Tiến độ thu hồi nợ</span>
            <span className="font-mono font-semibold text-foreground">
              {totals.recoveryRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                totals.recoveryRate === 100
                  ? "bg-emerald-500"
                  : "bg-emerald-600",
              )}
              style={{ width: `${totals.recoveryRate}%` }}
            />
          </div>
        </div>

        {/* 4 Aging brackets distribution breakdown */}
        <div className="space-y-2 pt-3 border-t border-border/40 mt-3">
          <div className="flex justify-between items-center text-xs font-semibold text-foreground">
            <span>
              {t(
                "customers.drawer.agingDistribution",
                "Phân bổ nợ theo thời hạn",
              )}
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Max: {totals.maxAging} ngày
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                0-30 ngày:
              </span>
              <span className="font-mono font-medium">
                {money(totals.aging0_30)}
              </span>
            </div>
            <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                31-60 ngày:
              </span>
              <span className="font-mono font-medium">
                {money(totals.aging31_60)}
              </span>
            </div>
            <div className="flex justify-between items-center text-orange-700 dark:text-orange-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                61-90 ngày:
              </span>
              <span className="font-mono font-medium">
                {money(totals.aging61_90)}
              </span>
            </div>
            <div className="flex justify-between items-center text-rose-700 dark:text-rose-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                &gt;90 ngày:
              </span>
              <span className="font-mono font-bold">
                {money(totals.agingOver90)}
              </span>
            </div>
          </div>
        </div>
      </DrawerSection>
    </div>
  );

  // Left Panel Content
  const leftPanelContent = (
    <div className="space-y-3 pb-2 flex-1 min-w-0 w-full flex flex-col">
      {/* ─── 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS + QUICK ACTIONS ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2">
          <PillTabs
            size="sm"
            value={activeSubTab}
            onValueChange={setActiveSubTab}
            items={[
              {
                value: "cases",
                label: t(
                  "customers.drawer.tabCases",
                  "1. Danh sách phiếu dịch vụ",
                ),
                icon: FileSpreadsheet,
                badgeCount: cases.length > 0 ? cases.length : undefined,
              },
              {
                value: "analytics",
                label: t(
                  "customers.drawer.tabAnalytics",
                  "2. Biến động & Phân tích",
                ),
                icon: TrendingUp,
              },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          {activeSubTab === "cases" && (
            <>
              {tableState.activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => tableState.resetFilters()}
                  className="h-6 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded-md border border-destructive/20 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xóa bộ lọc ({tableState.activeFilterCount})</span>
                </Button>
              )}
              <span className="text-xs font-normal text-muted-foreground font-mono">
                {filteredCases.length} / {cases.length}{" "}
                {t("cases.summary.unit", "phiếu dịch vụ")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── 2. NỘI DUNG CHÍNH THEO SUB-TAB ─── */}
      {activeSubTab === "cases" ? (
        <DrawerSection
          title={
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
              <span>
                {t(
                  "customers.drawer.caseList",
                  "Danh sách phiếu dịch vụ chi tiết",
                )}
              </span>
              {cases.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground lowercase font-mono">
                  ({filteredCases.length} / {cases.length}{" "}
                  {t("cases.summary.unit", "phiếu dịch vụ")})
                </span>
              )}
            </div>
          }
          collapsible={true}
          defaultCollapsed={false}
          className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
          bodyClassName="p-0"
        >
          <div className="w-full overflow-hidden">
            <DataTable
              variant="spreadsheet"
              items={paginatedCases}
              columns={columns}
              tableId="garage-customer-cases-table"
              loading={isLoading}
              summaryRow={summaryRow}
              rowHoverActions={getRowActions}
              enableRowContextMenu={true}
              onRowClick={(row: any) => {
                setDrawerEditMode(false);
                setSelectedCaseCode(row.soChungTu);
              }}
              page={page}
              pageSize={pageSize}
              total={totalItems}
              totalPages={totalPages}
              onPage={setPage}
              onPageSize={(s) => {
                setPageSize(s);
                setPage(1);
              }}
              emptyLabel={t(
                "customers.empty",
                "Không có dữ liệu phiếu dịch vụ",
              )}
            />
          </div>
        </DrawerSection>
      ) : (
        <div className="space-y-4 pb-2">
          {/* HÀNG 1: GRID 3:1 (BIẾN ĐỘNG PHÁT SINH THEO THÁNG + CƠ CẤU TUỔI NỢ) */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3">
            {/* CỘT 1 (3/4): BIẾN ĐỘNG PHIẾU DỊCH VỤ THEO THÁNG */}
            <div className="xl:col-span-3">
              <DrawerSection
                title={t(
                  "customers.drawer.trendChartTitle",
                  "Biến động phiếu dịch vụ theo tháng",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="relative h-[250px] w-full pt-1">
                  {monthlyBarData.labels.length > 0 ? (
                    <BarChart
                      labels={monthlyBarData.labels}
                      stacked={true}
                      showLegend={true}
                      yCallback={(v) => money(Number(v))}
                      datasets={monthlyBarData.datasets}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                      <FileSpreadsheet className="w-8 h-8 opacity-30" />
                      <span>Chưa có dữ liệu phát sinh theo tháng</span>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>

            {/* CỘT 2 (1/4): CƠ CẤU PHÂN BỔ TUỔI NỢ */}
            <div className="xl:col-span-1">
              <DrawerSection
                title={t(
                  "customers.drawer.agingDistribution",
                  "Cơ cấu phân bổ tuổi nợ",
                )}
                collapsible
                defaultCollapsed={false}
              >
                <div className="flex flex-col justify-center gap-2.5 h-[250px] w-full pt-1">
                  {totals.totalBalance > 0 ? (
                    <>
                      <div className="relative h-[135px]">
                        <DonutChart
                          items={agingDonutItems}
                          cutout="65%"
                          valueFormatter={(v) => money(Number(v))}
                        />
                      </div>
                      <div className="text-[11px]">
                        <DonutLegend
                          items={agingDonutItems}
                          valueFormatter={(v) => money(Number(v))}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-4 gap-2">
                      <CheckCircle2 className="w-9 h-9 text-emerald-500/80" />
                      <div className="text-xs font-semibold text-foreground">
                        Đã tất toán toàn bộ
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Không còn dư nợ quá hạn.
                      </div>
                    </div>
                  )}
                </div>
              </DrawerSection>
            </div>
          </div>

          {/* HÀNG 2: GRID 1:1 HOẶC 3:2 (DÒNG TIỀN LŨY KẾ & CƠ CẤU THEO PHƯƠNG TIỆN) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {/* CỘT 1: BIỂU ĐỒ LUÂN CHUYỂN & DÒNG TIỀN TÍCH LŨY */}
            <DrawerSection
              title={t(
                "customers.drawer.cumulativeTrendTitle",
                "Biểu đồ luân chuyển & Dòng tiền tích lũy",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="relative h-[250px] w-full pt-1">
                {cumulativeTrendData.labels.length > 0 ? (
                  <LineChart
                    labels={cumulativeTrendData.labels}
                    datasets={cumulativeTrendData.datasets}
                    showLegend={true}
                    yCallback={(v) => money(Number(v))}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                    <TrendingUp className="w-8 h-8 opacity-30" />
                    <span>Chưa có dữ liệu dòng tiền lũy kế</span>
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* CỘT 2: CƠ CẤU DOANH SỐ & DƯ NỢ THEO TỪNG XE */}
            <DrawerSection
              title={t(
                "customers.drawer.vehicleBreakdownTitle",
                "Cơ cấu phát sinh & Dư nợ theo phương tiện",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="relative h-[250px] w-full pt-1">
                {vehicleBarData.labels.length > 0 ? (
                  <BarChart
                    labels={vehicleBarData.labels}
                    stacked={true}
                    showLegend={true}
                    yCallback={(v) => money(Number(v))}
                    datasets={vehicleBarData.datasets}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1.5">
                    <Car className="w-8 h-8 opacity-30" />
                    <span>Chưa có dữ liệu phương tiện</span>
                  </div>
                )}
              </div>
            </DrawerSection>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode="view"
        title={resolvedName}
        subtitle={
          <span className="text-xs text-muted-foreground font-mono font-normal">
            {t("customers.columns.customerCode", "Mã KH")}:{" "}
            {customerCode || "NO_CODE"} • {cases.length}{" "}
            {t("cases.summary.unit", "phiếu dịch vụ")}
          </span>
        }
        icon={<Building2 className="w-5 h-5 text-primary shrink-0" />}
        size="xl"
        layout="2-columns"
        collapsibleRightPanel={true}
        leftPanel={leftPanelContent}
        rightPanel={rightPanelContent}
      />

      {/* Chi tiết vụ việc độc lập modal */}
      {selectedCaseCode && (
        <GarageCaseStandaloneDrawer
          isOpen={Boolean(selectedCaseCode)}
          caseCode={selectedCaseCode}
          initialEditMode={drawerEditMode}
          onClose={() => {
            setSelectedCaseCode(null);
            setDrawerEditMode(false);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["garage-cases-by-customer", branchId, customerCode],
            });
            queryClient.invalidateQueries({
              queryKey: ["garage-customers-debt"],
            });
          }}
        />
      )}

      {/* Cấn trừ sao kê modal */}
      {settlementCase && (
        <GarageCaseSettlementDrawerModal
          open={Boolean(settlementCase)}
          onClose={() => setSettlementCase(null)}
          caseId={settlementCase.id}
          caseCode={settlementCase.soChungTu || settlementCase.hdPhieuDichVuId}
          defaultType="RECEIPT"
          suggestedAmount={Number(
            settlementCase.tienConPhaiThanhToan ||
              settlementCase.tienCoThue ||
              0,
          )}
          onSubmit={async (items) => {
            try {
              for (const item of items) {
                await garageApi.addCaseSettlement(settlementCase.id, item);
              }
              toast.success(
                t(
                  "cases.settlementSuccess",
                  "Đã ghi nhận cấn trừ sao kê thành công",
                ),
              );
              setSettlementCase(null);
              queryClient.invalidateQueries({
                queryKey: ["garage-cases-by-customer", branchId, customerCode],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-customers-debt"],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-case-financial-summary", settlementCase.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-case-settlements", settlementCase.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-case-traceability-graph", settlementCase.id],
              });
            } catch (err: any) {
              toast.error(
                err.response?.data?.message ||
                  t("cases.settlementError", "Lỗi ghi nhận cấn trừ sao kê"),
              );
            }
          }}
        />
      )}

      {/* Liên kết hóa đơn modal */}
      {invoiceLinkingCase && (
        <InvoiceSelectionDrawer
          open={Boolean(invoiceLinkingCase)}
          onClose={() => setInvoiceLinkingCase(null)}
          caseId={invoiceLinkingCase.id}
          caseCode={
            invoiceLinkingCase.soChungTu || invoiceLinkingCase.hdPhieuDichVuId
          }
          defaultLinkType="OUT"
          onSubmit={async (payloads) => {
            const items = Array.isArray(payloads) ? payloads : [payloads];
            try {
              if (items.length === 1) {
                await garageApi.addCaseLinkedInvoice(
                  invoiceLinkingCase.id,
                  items[0].invoiceId,
                  items[0].linkType,
                  items[0].note,
                );
              } else if (items.length > 1) {
                await garageApi.addCaseLinkedInvoices(
                  invoiceLinkingCase.id,
                  items.map((i) => ({
                    invoiceId: i.invoiceId,
                    linkType: i.linkType,
                    note: i.note,
                  })),
                );
              }
              toast.success(
                items.length > 1
                  ? `Đã liên kết thành công ${items.length} hóa đơn`
                  : t(
                      "cases.linkInvoiceSuccess",
                      "Đã liên kết hóa đơn thành công",
                    ),
              );
              setInvoiceLinkingCase(null);
              queryClient.invalidateQueries({
                queryKey: ["garage-cases-by-customer", branchId, customerCode],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-customers-debt"],
              });
              queryClient.invalidateQueries({
                queryKey: [
                  "garage-case-financial-summary",
                  invoiceLinkingCase.id,
                ],
              });
              queryClient.invalidateQueries({
                queryKey: [
                  "garage-case-traceability-graph",
                  invoiceLinkingCase.id,
                ],
              });
            } catch (err: any) {
              toast.error(
                err?.response?.data?.message ||
                  t("cases.linkInvoiceError", "Lỗi liên kết hóa đơn"),
              );
            }
          }}
        />
      )}
    </>
  );
}

export default GarageCustomerDetailDrawer;
