import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { garageApi } from "../api/garageApi";
import { GarageCaseStandaloneDrawer } from "./GarageCaseStandaloneDrawer";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import {
  User,
  Car,
  Clock,
  Receipt,
  CheckCircle2,
  AlertCircle,
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
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);

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
    enabled: open && !!customerCode,
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

  const resolvedName =
    customerName ||
    cases[0]?.khachHangName ||
    customerCode ||
    t("customers.drawer.title", "Hồ sơ khách hàng");

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

  // Columns definition following /standardize-table with proportional widths
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
        cell: (row: any) => (
          <TableText
            text={row.soChungTu || "N/A"}
            enableCopy={true}
            tooltip={true}
            onDrawerClick={() => setSelectedCaseCode(row.soChungTu)}
          />
        ),
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
        cell: (row: any) => (
          <span className="tabular-nums font-bold text-destructive">
            {money(row.tienConPhaiThanhToan)}
          </span>
        ),
      },
      {
        key: "agingDays",
        className: "text-left",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.drawer.agingDays", "Tuổi nợ")}
            sortState={getSortState("agingDays")}
            onSortChange={(s) => setSort("agingDays", s)}
            searchValue={columnSearch["agingDays"] || ""}
            onSearchChange={(val) => setColSearch("agingDays", val)}
            filterOptions={[
              { label: "0-30 ngày (Trong hạn)", value: "0-30" },
              { label: "31-60 ngày (Cần theo dõi)", value: "31-60" },
              { label: "61-90 ngày (Quá hạn)", value: "61-90" },
              { label: ">90 ngày (Quá hạn sâu)", value: ">90" },
              { label: "Đã tất toán", value: "PAID" },
            ]}
            selectedFilters={columnFilters["agingDays"] || []}
            onFilterChange={(vals) => setColumnFilter("agingDays", vals)}
            isActive={Boolean(
              columnFilters["agingDays"]?.length || columnSearch["agingDays"],
            )}
            align="center"
          />
        ),
        size: 210,
        minSize: 200,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          const aging = Number(row.agingDays) || 0;

          if (bal <= 0) {
            return (
              <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
                <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                  <span className="font-mono text-xs text-muted-foreground/60">
                    0 ngày
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-sans border font-normal bg-slate-50 dark:bg-slate-800/40 text-muted-foreground/70 border-slate-200/60 dark:border-slate-700/40">
                    Đã tất toán
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden" />
              </div>
            );
          }

          const agingPercent = Math.min(100, Math.round((aging / 90) * 100));
          const isOver90 = aging > 90;
          const is61to90 = aging > 60 && aging <= 90;
          const is31to60 = aging > 30 && aging <= 60;

          const bracketLabel = isOver90
            ? ">90 ngày"
            : is61to90
              ? "61-90 ngày"
              : is31to60
                ? "31-60 ngày"
                : "0-30 ngày";

          const tagCls = isOver90
            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50"
            : is61to90
              ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50"
              : is31to60
                ? "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40"
                : "bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40";

          const dayTextCls = isOver90
            ? "text-rose-700 dark:text-rose-400 font-bold"
            : is61to90
              ? "text-orange-700 dark:text-orange-400 font-semibold"
              : is31to60
                ? "text-amber-800 dark:text-amber-300 font-semibold"
                : "text-emerald-700 dark:text-emerald-400 font-medium";

          const barColorCls = isOver90
            ? "bg-rose-500 dark:bg-rose-400"
            : is61to90
              ? "bg-orange-500 dark:bg-orange-400"
              : is31to60
                ? "bg-amber-500 dark:bg-amber-400"
                : "bg-emerald-500 dark:bg-emerald-400";

          return (
            <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
              <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                <span className={cn("font-mono text-xs", dayTextCls)}>
                  {aging} ngày
                </span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-sans shrink-0 border leading-none font-medium",
                    tagCls,
                  )}
                >
                  {bracketLabel}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    barColorCls,
                  )}
                  style={{ width: `${agingPercent}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        key: "tenTinhTrangDichVu",
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
        size: 120,
        minSize: 110,
        enableResizing: true,
        className: "text-center",
        cell: (row: any) => (
          <div className="w-full flex justify-center">
            <KgaraCaseStatusBadge status={row.tenTinhTrangDichVu || ""} />
          </div>
        ),
      },
    ];
  }, [
    t,
    sorts,
    columnSearch,
    columnFilters,
    computedLicensePlates,
    computedStatuses,
  ]);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={`${t("customers.drawer.title", "Hồ sơ công nợ")}: ${resolvedName}`}
        subtitle={`${t("customers.columns.customerCode", "Mã KH")}: ${customerCode || "N/A"}`}
        titleExtra={
          <Badge
            variant={totals.totalBalance === 0 ? "success" : "destructive"}
            className="font-medium"
          >
            {totals.totalBalance === 0
              ? t("common.allPaid", "Đã tất toán")
              : `${t("customers.drawer.totalBalance", "Còn nợ")}: ${money(totals.totalBalance)}`}
          </Badge>
        }
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        actions={[{ label: t("common.close", "Đóng"), onClick: onClose }]}
        leftPanel={
          <div className="flex flex-col gap-4">
            {/* 1. Thông tin chung */}
            <DrawerSection
              title={t("customers.drawer.generalInfo", "Thông tin khách hàng")}
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t("customers.columns.customerCode", "Mã khách hàng")}
                >
                  <div className="flex items-center gap-2 font-mono font-medium text-primary">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{customerCode || "N/A"}</span>
                  </div>
                </DrawerField>
                <DrawerField
                  label={t("customers.columns.customerName", "Tên khách hàng")}
                >
                  <span className="font-semibold text-foreground">
                    {resolvedName}
                  </span>
                </DrawerField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t(
                    "customers.drawer.totalReceivable",
                    "Tổng doanh thu phát sinh",
                  )}
                >
                  <span className="font-semibold tabular-nums text-foreground">
                    {money(totals.totalRevenue)}
                  </span>
                </DrawerField>
                <DrawerField
                  label={t("customers.drawer.totalPaid", "Đã thanh toán")}
                >
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {money(totals.totalPaid)}
                  </span>
                </DrawerField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t("customers.drawer.totalBalance", "Dư nợ còn lại")}
                >
                  <span className="text-base font-bold tabular-nums text-destructive">
                    {money(totals.totalBalance)}
                  </span>
                </DrawerField>
                <DrawerField
                  label={t("customers.drawer.avgAging", "Tuổi nợ lớn nhất")}
                >
                  <Badge
                    variant={
                      totals.maxAging <= 30
                        ? "success"
                        : totals.maxAging <= 60
                          ? "warning"
                          : "destructive"
                    }
                    className="tabular-nums"
                  >
                    {totals.maxAging} {t("common.days", "ngày")}
                  </Badge>
                </DrawerField>
              </div>
            </DrawerSection>

            {/* 2. Danh sách Phiếu dịch vụ */}
            <DrawerSection
              title={t(
                "customers.drawer.caseList",
                "Danh sách Phiếu dịch vụ liên quan",
              )}
              titleExtra={
                <span className="text-xs text-muted-foreground font-normal">
                  {cases.length} {t("cases.title", "phiếu")}
                </span>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="w-full">
                <DataTable
                  tableId="garage-customer-cases-detail"
                  variant="spreadsheet"
                  items={filteredCases}
                  columns={columns}
                  loading={isLoading}
                  minWidth={1210}
                  enableColumnResizing={true}
                  emptyLabel={t(
                    "customers.empty",
                    "Không có phiếu dịch vụ nào",
                  )}
                  containerClassName="max-h-[380px] md:max-h-[440px] overflow-y-auto overflow-x-auto rounded-lg border border-border/80"
                  rowHoverActions={(row: any) => [
                    {
                      groupLabel: "TRA CỨU & THAO TÁC",
                      items: [
                        {
                          label: t(
                            "customers.drawer.openCaseDetail",
                            "Chi tiết / Cấn trừ",
                          ),
                          icon: <Receipt className="w-3.5 h-3.5" />,
                          onClick: () => setSelectedCaseCode(row.soChungTu),
                          quickAction: true,
                        },
                      ],
                    },
                  ]}
                  summaryRow={{
                    ngayPhatSinh: (
                      <div className="text-right w-full font-semibold text-xs">
                        {t("common.total", "Tổng cộng")}:
                      </div>
                    ),
                    tienCoThue: (
                      <div className="text-right font-bold text-xs tabular-nums text-foreground">
                        {money(totals.totalRevenue)}
                      </div>
                    ),
                    tienDaThanhToan: (
                      <div className="text-right font-bold text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                        {money(totals.totalPaid)}
                      </div>
                    ),
                    tienConPhaiThanhToan: (
                      <div className="text-right font-bold text-xs tabular-nums text-destructive">
                        {money(totals.totalBalance)}
                      </div>
                    ),
                  }}
                />
              </div>
            </DrawerSection>
          </div>
        }
        rightPanel={
          <div className="flex flex-col gap-4">
            {/* Aging Breakdown */}
            <DrawerSection
              title={t(
                "customers.drawer.debtSummary",
                "Phân tích tuổi nợ (Aging)",
              )}
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="flex flex-col gap-3">
                {/* 0 - 30 days */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />0 - 30{" "}
                      {t("common.days", "ngày")} (Trong hạn)
                    </span>
                    <span className="font-bold tabular-nums">
                      {money(totals.aging0_30)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging0_30 / totals.totalBalance) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 31 - 60 days */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      31 - 60 {t("common.days", "ngày")}
                    </span>
                    <span className="font-bold tabular-nums">
                      {money(totals.aging31_60)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging31_60 / totals.totalBalance) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 61 - 90 days */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-orange-600 dark:text-orange-400">
                      <Clock className="w-3.5 h-3.5" />
                      61 - 90 {t("common.days", "ngày")}
                    </span>
                    <span className="font-bold tabular-nums">
                      {money(totals.aging61_90)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging61_90 / totals.totalBalance) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* > 90 days */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      &gt; 90 {t("common.days", "ngày")} (Quá hạn sâu)
                    </span>
                    <span className="font-bold tabular-nums text-destructive">
                      {money(totals.agingOver90)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-destructive h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totals.totalBalance > 0 ? Math.min(100, (totals.agingOver90 / totals.totalBalance) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </DrawerSection>

            {/* Recovery Rate KPI */}
            <DrawerSection
              title={t("customers.drawer.recoveryRate", "Tỷ lệ thu hồi")}
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="flex flex-col gap-2 p-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>
                    {t("customers.drawer.progress", "Tiến độ thanh toán")}
                  </span>
                  <span className="text-primary">{totals.recoveryRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${totals.recoveryRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t(
                    "customers.drawer.recoveryNote",
                    "Tỷ lệ giữa tổng tiền đã thu thực tế và tổng giá trị đơn dịch vụ.",
                  )}
                </p>
              </div>
            </DrawerSection>
          </div>
        }
      />

      {/* Standalone Case Detail Drawer for Net-off & Traceability */}
      {selectedCaseCode && (
        <GarageCaseStandaloneDrawer
          isOpen={!!selectedCaseCode}
          caseCode={selectedCaseCode}
          onClose={() => setSelectedCaseCode(null)}
        />
      )}
    </>
  );
}
