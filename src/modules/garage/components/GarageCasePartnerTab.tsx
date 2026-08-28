import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { garageApi } from "../api/garageApi";
import { GarageCaseSettlementDrawerModal } from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionDrawer } from "./InvoiceSelectionDrawer";
import { useSyncGarageCaseDetail } from "../hooks/useGarage";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  User,
  Car,
  Eye,
  Scale,
  Link2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

export interface GarageCasePartnerTabProps {
  customerCode?: string | null;
  customerName?: string;
  currentCaseCode?: string;
  branchId?: string;
  onSelectCase?: (caseCode: string) => void;
}

export function GarageCasePartnerTab({
  customerCode,
  customerName,
  currentCaseCode,
  branchId,
  onSelectCase,
}: GarageCasePartnerTabProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const { mutate: syncCaseDetail } = useSyncGarageCaseDetail();

  const [settlementCase, setSettlementCase] = useState<any | null>(null);
  const [invoiceLinkingCase, setInvoiceLinkingCase] = useState<any | null>(
    null,
  );

  // Table client state
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [sorts, setSorts] = useState<string[]>([]);
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["garage-cases-by-customer", branchId, customerCode],
    queryFn: () => {
      if (!customerCode) return Promise.resolve([]);
      return garageApi.getCasesByCustomer(branchId || "", customerCode);
    },
    enabled: !!customerCode,
  });

  const totals = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let maxAging = 0;
    let aging0_30 = 0;
    let aging31_60 = 0;
    let aging61_90 = 0;
    let agingOver90 = 0;

    cases.forEach((c: any) => {
      const rev = Number(c.tienCoThue) || 0;
      const paid = Number(c.tienDaThanhToan) || 0;
      const bal = Number(c.tienConPhaiThanhToan) || 0;
      const aging = Number(c.agingDays) || 0;

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
      recoveryRate:
        totalRevenue > 0
          ? Math.round((totalPaid / totalRevenue) * 100)
          : totalBalance === 0
            ? 100
            : 0,
    };
  }, [cases]);

  // Client sort & filter handlers
  const setSort = (key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
  };

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (sorts.includes(key)) return "asc";
    if (sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const setColumnFilter = (key: string, values: string[]) => {
    setColumnFilters((prev) => {
      if (!values || values.length === 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: values };
    });
  };

  const setColSearch = (key: string, val: string) => {
    setColumnSearch((prev) => {
      if (!val) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: val };
    });
  };

  // Filtered & Sorted cases
  const filteredCases = useMemo(() => {
    let result = [...cases];

    // Column Search
    for (const [key, search] of Object.entries(columnSearch)) {
      if (!search || !search.trim()) continue;
      const term = search.toLowerCase().trim();
      result = result.filter((item: any) => {
        const val = String(item[key] || "").toLowerCase();
        return val.includes(term);
      });
    }

    // Column Filters
    for (const [key, filterVals] of Object.entries(columnFilters)) {
      if (!filterVals || filterVals.length === 0) continue;
      result = result.filter((item: any) => {
        if (key === "agingDays") {
          const bal = Number(item.tienConPhaiThanhToan) || 0;
          if (bal <= 0) return filterVals.includes("PAID");
          const aging = Number(item.agingDays) || 0;
          if (filterVals.includes("0-30") && aging <= 30) return true;
          if (filterVals.includes("31-60") && aging > 30 && aging <= 60)
            return true;
          if (filterVals.includes("61-90") && aging > 60 && aging <= 90)
            return true;
          if (filterVals.includes(">90") && aging > 90) return true;
          return false;
        }
        const val = String(item[key] || "");
        return filterVals.includes(val);
      });
    }

    // Sorts
    if (sorts.length > 0) {
      result.sort((a: any, b: any) => {
        for (const s of sorts) {
          const desc = s.startsWith("-");
          const field = desc ? s.slice(1) : s;
          let valA = a[field];
          let valB = b[field];

          if (typeof valA === "number" || typeof valB === "number") {
            valA = Number(valA) || 0;
            valB = Number(valB) || 0;
            if (valA !== valB) return desc ? valB - valA : valA - valB;
          } else {
            valA = String(valA || "");
            valB = String(valB || "");
            const cmp = valA.localeCompare(valB);
            if (cmp !== 0) return desc ? -cmp : cmp;
          }
        }
        return 0;
      });
    }

    return result;
  }, [cases, columnSearch, columnFilters, sorts]);

  // Computed filter options
  const computedLicensePlates = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c: any) => {
      if (c.bienSoXe) set.add(c.bienSoXe);
    });
    return Array.from(set).map((v) => ({ label: v, value: v }));
  }, [cases]);

  const computedStatuses = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c: any) => {
      if (c.tenTinhTrangDichVu) set.add(c.tenTinhTrangDichVu);
    });
    return Array.from(set).map((v) => ({ label: v, value: v }));
  }, [cases]);

  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
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
      {
        key: "soChungTu",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.caseCode", "Số chứng từ")}
            sortState={getSortState("soChungTu")}
            onSortChange={(s) => setSort("soChungTu", s)}
            searchValue={columnSearch["soChungTu"] || ""}
            onSearchChange={(val) => setColSearch("soChungTu", val)}
            selectedFilters={columnFilters["soChungTu"] || []}
            onFilterChange={(vals) => setColumnFilter("soChungTu", vals)}
            isActive={Boolean(
              columnFilters["soChungTu"]?.length || columnSearch["soChungTu"],
            )}
            align="center"
          />
        ),
        size: 190,
        minSize: 175,
        enableResizing: true,
        cell: (row: any) => {
          const isCurrent =
            currentCaseCode && row.soChungTu === currentCaseCode;
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <TableText
                text={row.soChungTu || "N/A"}
                enableCopy={true}
                tooltip={true}
                className={cn(isCurrent && "font-bold text-primary")}
                onDetailClick={
                  onSelectCase
                    ? (e) => {
                        e?.stopPropagation();
                        onSelectCase(row.soChungTu);
                      }
                    : undefined
                }
              />
              {isCurrent && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary bg-primary/10 font-sans"
                >
                  {t("cases.drawer.currentCaseBadge", "Phiếu hiện tại")}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        key: "bienSoXe",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.licensePlate", "Biển số xe")}
            sortState={getSortState("bienSoXe")}
            onSortChange={(s) => setSort("bienSoXe", s)}
            filterOptions={computedLicensePlates}
            selectedFilters={columnFilters["bienSoXe"] || []}
            onFilterChange={(vals) => setColumnFilter("bienSoXe", vals)}
            searchValue={columnSearch["bienSoXe"] || ""}
            onSearchChange={(val) => setColSearch("bienSoXe", val)}
            isActive={Boolean(
              columnFilters["bienSoXe"]?.length || columnSearch["bienSoXe"],
            )}
            align="center"
          />
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground bg-muted/50 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap">
            <Car className="w-3 h-3 text-muted-foreground shrink-0" />
            {row.bienSoXe || "—"}
          </span>
        ),
      },
      {
        key: "ngayPhatSinh",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.caseDate", "Ngày tiếp nhận")}
            sortState={getSortState("ngayPhatSinh")}
            onSortChange={(s) => setSort("ngayPhatSinh", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="center"
          />
        ),
        size: 140,
        minSize: 135,
        enableResizing: true,
        cell: (row: any) => (
          <TableDateCell
            date={row.ngayPhatSinh}
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "tienCoThue",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.totalAmount", "Tổng tiền")}
            sortState={getSortState("tienCoThue")}
            onSortChange={(s) => setSort("tienCoThue", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="center"
          />
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="tabular-nums font-semibold text-foreground">
            {money(row.tienCoThue)}
          </span>
        ),
      },
      {
        key: "tienDaThanhToan",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.paidAmount", "Đã thu")}
            sortState={getSortState("tienDaThanhToan")}
            onSortChange={(s) => setSort("tienDaThanhToan", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="center"
          />
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            {money(row.tienDaThanhToan)}
          </span>
        ),
      },
      {
        key: "tienConPhaiThanhToan",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.balanceAmount", "Còn nợ")}
            sortState={getSortState("tienConPhaiThanhToan")}
            onSortChange={(s) => setSort("tienConPhaiThanhToan", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="center"
          />
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          return (
            <span
              className={cn(
                "tabular-nums font-bold",
                bal > 0
                  ? "text-destructive"
                  : "text-slate-500 dark:text-slate-400 font-normal",
              )}
            >
              {money(bal)}
            </span>
          );
        },
      },
      {
        key: "agingDays",
        className: "text-center",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.aging", "Tuổi nợ")}
            sortState={getSortState("agingDays")}
            onSortChange={(s) => setSort("agingDays", s)}
            searchValue={columnSearch["agingDays"] || ""}
            onSearchChange={(val) => setColSearch("agingDays", val)}
            filterOptions={[
              { label: "0-30 ngày (Trong hạn)", value: "0-30" },
              { label: "31-60 ngày (Theo dõi)", value: "31-60" },
              { label: "61-90 ngày (Quá hạn)", value: "61-90" },
              { label: ">90 ngày (Quá hạn sâu)", value: ">90" },
              { label: "Đã tất toán (0đ)", value: "PAID" },
            ]}
            selectedFilters={columnFilters["agingDays"] || []}
            onFilterChange={(vals) => setColumnFilter("agingDays", vals)}
            isActive={Boolean(
              columnFilters["agingDays"]?.length || columnSearch["agingDays"],
            )}
            align="center"
          />
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          if (bal <= 0) {
            return (
              <Badge
                variant="outline"
                className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              >
                {t("customers.drawer.settled", "Đã tất toán")}
              </Badge>
            );
          }
          const aging = Number(row.agingDays) || 0;
          const isOver90 = aging > 90;
          const is61to90 = aging > 60 && aging <= 90;
          const is31to60 = aging > 30 && aging <= 60;

          return (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-mono",
                isOver90
                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800"
                  : is61to90
                    ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
                    : is31to60
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
              )}
            >
              {aging} {t("common.days", "ngày")}
            </Badge>
          );
        },
      },
      {
        key: "tenTinhTrangDichVu",
        className: "text-center",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.status", "Trạng thái")}
            sortState={getSortState("tenTinhTrangDichVu")}
            onSortChange={(s) => setSort("tenTinhTrangDichVu", s)}
            searchValue={columnSearch["tenTinhTrangDichVu"] || ""}
            onSearchChange={(val) => setColSearch("tenTinhTrangDichVu", val)}
            filterOptions={computedStatuses}
            selectedFilters={columnFilters["tenTinhTrangDichVu"] || []}
            onFilterChange={(vals) =>
              setColumnFilter("tenTinhTrangDichVu", vals)
            }
            isActive={Boolean(
              columnFilters["tenTinhTrangDichVu"]?.length ||
              columnSearch["tenTinhTrangDichVu"],
            )}
            align="center"
          />
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <KgaraCaseStatusBadge status={row.tenTinhTrangDichVu} />
        ),
      },
    ];
  }, [
    columnSearch,
    columnFilters,
    sorts,
    computedLicensePlates,
    computedStatuses,
    currentCaseCode,
    onSelectCase,
    t,
  ]);

  const summaryRow = useMemo(() => {
    if (!filteredCases || filteredCases.length === 0) return undefined;
    let rev = 0;
    let paid = 0;
    let bal = 0;

    filteredCases.forEach((c: any) => {
      rev += Number(c.tienCoThue) || 0;
      paid += Number(c.tienDaThanhToan) || 0;
      bal += Number(c.tienConPhaiThanhToan) || 0;
    });

    return {
      ngayPhatSinh: (
        <div className="text-right w-full font-bold text-xs uppercase text-muted-foreground pr-2">
          {t("customers.drawer.total", "Tổng")}:
        </div>
      ),
      tienCoThue: (
        <div className="text-right font-bold tabular-nums text-foreground">
          {money(rev)}
        </div>
      ),
      tienDaThanhToan: (
        <div className="text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          {money(paid)}
        </div>
      ),
      tienConPhaiThanhToan: (
        <div className="text-right font-bold tabular-nums text-destructive">
          {money(bal)}
        </div>
      ),
    };
  }, [filteredCases, t]);

  const invalidateData = () => {
    queryClient.invalidateQueries({
      queryKey: ["garage-cases-by-customer", branchId, customerCode],
    });
    queryClient.invalidateQueries({
      queryKey: ["garage-customers-debt"],
    });
    queryClient.invalidateQueries({
      queryKey: ["garage", "cases"],
    });
  };

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Header & KPI Overview Banner */}
      <div className="rounded-xl border border-border/80 bg-surface/50 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {customerName || customerCode || "Đối tác Garage"}
              </h4>
              <p className="text-xs text-muted-foreground font-mono">
                Mã KH: {customerCode || "NO_CODE"} • {cases.length} phiếu dịch
                vụ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs py-1 px-2.5">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-primary" />
              Thu hồi:{" "}
              <span className="font-bold ml-1 text-primary">
                {totals.recoveryRate}%
              </span>
            </Badge>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-border/60 bg-background/60">
            <span className="text-[11px] text-muted-foreground block font-medium">
              Tổng phát sinh
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {money(totals.totalRevenue)}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-background/60">
            <span className="text-[11px] text-muted-foreground block font-medium">
              Đã thu thực tế
            </span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {money(totals.totalPaid)}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-background/60">
            <span className="text-[11px] text-muted-foreground block font-medium">
              Dư nợ còn lại
            </span>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                totals.totalBalance > 0
                  ? "text-destructive"
                  : "text-slate-600 dark:text-slate-300",
              )}
            >
              {money(totals.totalBalance)}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border/60 bg-background/60">
            <span className="text-[11px] text-muted-foreground block font-medium">
              Tuổi nợ lớn nhất
            </span>
            <span
              className={cn(
                "text-sm font-bold tabular-nums font-mono",
                totals.maxAging > 90
                  ? "text-rose-600"
                  : totals.maxAging > 60
                    ? "text-orange-600"
                    : totals.maxAging > 30
                      ? "text-amber-600"
                      : "text-foreground",
              )}
            >
              {totals.maxAging} {t("common.days", "ngày")}
            </span>
          </div>
        </div>

        {/* 4 Aging Distribution Brackets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="p-2 rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                0-30 ngày
              </span>
              <span className="font-bold tabular-nums">
                {money(totals.aging0_30)}
              </span>
            </div>
            <div className="w-full bg-emerald-200/50 dark:bg-emerald-900/50 rounded-full h-1">
              <div
                className="bg-emerald-500 h-1 rounded-full"
                style={{
                  width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging0_30 / totals.totalBalance) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="p-2 rounded-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-medium text-amber-700 dark:text-amber-400">
                31-60 ngày
              </span>
              <span className="font-bold tabular-nums">
                {money(totals.aging31_60)}
              </span>
            </div>
            <div className="w-full bg-amber-200/50 dark:bg-amber-900/50 rounded-full h-1">
              <div
                className="bg-amber-500 h-1 rounded-full"
                style={{
                  width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging31_60 / totals.totalBalance) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="p-2 rounded-md bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-medium text-orange-700 dark:text-orange-400">
                61-90 ngày
              </span>
              <span className="font-bold tabular-nums">
                {money(totals.aging61_90)}
              </span>
            </div>
            <div className="w-full bg-orange-200/50 dark:bg-orange-900/50 rounded-full h-1">
              <div
                className="bg-orange-500 h-1 rounded-full"
                style={{
                  width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging61_90 / totals.totalBalance) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="p-2 rounded-md bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-medium text-rose-700 dark:text-rose-400">
                &gt;90 ngày
              </span>
              <span className="font-bold tabular-nums text-destructive">
                {money(totals.agingOver90)}
              </span>
            </div>
            <div className="w-full bg-rose-200/50 dark:bg-rose-900/50 rounded-full h-1">
              <div
                className="bg-rose-500 h-1 rounded-full"
                style={{
                  width: `${totals.totalBalance > 0 ? Math.min(100, (totals.agingOver90 / totals.totalBalance) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer Cases DataTable */}
      <div className="rounded-xl border border-border bg-surface p-4 card-shadow space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t(
              "cases.drawer.partnerCasesList",
              "Danh sách phiếu dịch vụ của đối tác",
            )}{" "}
            ({filteredCases.length})
          </h5>
        </div>

        <DataTable
          tableId="garage-case-partner-detail-table"
          variant="spreadsheet"
          items={filteredCases}
          columns={columns}
          loading={isLoading}
          summaryRow={summaryRow}
          minWidth={1100}
          enableColumnResizing={true}
          emptyLabel={t(
            "cases.drawer.noPartnerCases",
            "Chưa có phiếu dịch vụ nào của đối tác này.",
          )}
          getRowKey={(row) => row.id || row.soChungTu}
          getRowClassName={(row) =>
            currentCaseCode && row.soChungTu === currentCaseCode
              ? "bg-primary/[0.04] dark:bg-primary/[0.08] font-medium"
              : undefined
          }
          rowHoverActions={(row: any) => [
            {
              groupLabel: "TRA CỨU",
              items: [
                {
                  label: t("cases.actions.viewDetail", "Xem chi tiết"),
                  icon: <Eye className="w-3.5 h-3.5" />,
                  onClick: () => {
                    if (onSelectCase) onSelectCase(row.soChungTu);
                  },
                  quickAction: true,
                },
              ],
            },
            {
              groupLabel: "THAO TÁC",
              items: [
                {
                  label: t("cases.actions.syncDetails", "Đồng bộ từ KGara"),
                  icon: <RefreshCw className="w-3.5 h-3.5" />,
                  onClick: () => {
                    const targetBranch = branchId || row.branchExternalId;
                    if (targetBranch && row.hdPhieuDichVuId) {
                      syncCaseDetail({
                        branchId: targetBranch,
                        caseId: row.hdPhieuDichVuId,
                      });
                    }
                  },
                },
                {
                  label: t("cases.actions.netOffSettlement", "Cấn trừ sao kê"),
                  icon: <Scale className="w-3.5 h-3.5" />,
                  onClick: () => {
                    setSettlementCase(row);
                  },
                },
                {
                  label: t("cases.actions.linkInvoice", "Liên kết hóa đơn"),
                  icon: <Link2 className="w-3.5 h-3.5" />,
                  onClick: () => {
                    setInvoiceLinkingCase(row);
                  },
                },
              ],
            },
          ]}
        />
      </div>

      {/* Settlement Modal */}
      {settlementCase && (
        <GarageCaseSettlementDrawerModal
          open={!!settlementCase}
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
              invalidateData();
            } catch (err: any) {
              toast.error(
                err.response?.data?.message ||
                  t("cases.settlementError", "Lỗi ghi nhận cấn trừ sao kê"),
              );
            }
          }}
        />
      )}

      {/* Invoice Linking Drawer */}
      {invoiceLinkingCase && (
        <InvoiceSelectionDrawer
          open={!!invoiceLinkingCase}
          onClose={() => setInvoiceLinkingCase(null)}
          caseId={invoiceLinkingCase.id}
          caseCode={
            invoiceLinkingCase.soChungTu || invoiceLinkingCase.hdPhieuDichVuId
          }
          defaultLinkType="OUT"
          onSuccess={() => {
            setInvoiceLinkingCase(null);
            invalidateData();
          }}
        />
      )}
    </div>
  );
}
