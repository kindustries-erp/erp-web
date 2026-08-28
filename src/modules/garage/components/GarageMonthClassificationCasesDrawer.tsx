import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { toast } from "react-hot-toast";
import {
  Eye,
  Pencil,
  Scale,
  Link2,
  RefreshCw,
  Car,
  Users,
  Wallet,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileX,
} from "lucide-react";
import { garageApi } from "../api/garageApi";
import { useGarageBranches, useSyncGarageCaseDetail } from "../hooks/useGarage";
import { useGarageStore } from "../store/garageStore";
import {
  GARAGE_CASE_CLASSIFICATIONS,
  GarageCaseClassificationBadge,
} from "./GarageCaseClassificationBadge";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import { GarageCaseStandaloneDrawer } from "./GarageCaseStandaloneDrawer";
import { GarageCaseSettlementDrawerModal } from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionDrawer } from "./InvoiceSelectionDrawer";

export interface GarageMonthClassificationCasesDrawerProps {
  open: boolean;
  month?: string; // e.g. "2026-07" or "07/2026"
  monthLabel?: string; // e.g. "Tháng 07/2026"
  filterType: "CLASSIFICATION" | "INVOICE";
  filterKey: string; // "SUA_CHUA_CHUNG" | "KY_GUI_NOI_BO" | "OJ_NGOAI" | "OTHER" | "WITH_INVOICE" | "NO_INVOICE"
  filterLabel: string;
  activeTab?: "RECEIPT" | "PAYMENT";
  branchId?: string;
  onClose: () => void;
}

export function GarageMonthClassificationCasesDrawer({
  open,
  month,
  monthLabel,
  filterType,
  filterKey,
  filterLabel,
  activeTab = "RECEIPT",
  branchId,
  onClose,
}: GarageMonthClassificationCasesDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const storeBranchId = useGarageStore((s) => s.selectedBranchId);
  const effectiveBranchId = branchId || storeBranchId;

  const { data: branches = [] } = useGarageBranches();
  const branchName = useMemo(() => {
    const found = branches.find(
      (b: any) =>
        b.externalId === effectiveBranchId || b.id === effectiveBranchId,
    );
    return found?.name || "Tất cả chi nhánh";
  }, [branches, effectiveBranchId]);

  const isReceipt = activeTab === "RECEIPT";

  // Pagination & Server State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [sorts, setSorts] = useState<string[]>([]);
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [dateRanges, setDateRanges] = useState<
    Record<string, { from: string; to: string }>
  >({});

  // Reset page when drawer opens or classification changes
  useEffect(() => {
    if (open) {
      setPage(1);
      setColumnFilters({});
      setColumnSearch({});
      setDateRanges({});
      setSorts([]);
    }
  }, [open, filterType, filterKey, month]);

  // Standalone case drawer state
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [caseDrawerEditMode, setCaseDrawerEditMode] = useState(false);
  const [caseDrawerInitialTab, setCaseDrawerInitialTab] =
    useState<string>("quote_details");

  // Secondary settlement/invoice modal states
  const [settlementCase, setSettlementCase] = useState<any | null>(null);
  const [invoiceLinkingCase, setInvoiceLinkingCase] = useState<any | null>(
    null,
  );

  const { mutate: syncCaseDetail } = useSyncGarageCaseDetail();

  // Parse Month into date range (dateFrom, dateTo)
  const { dateFrom, dateTo } = useMemo(() => {
    if (!month) return { dateFrom: undefined, dateTo: undefined };
    let y = "";
    let m = "";
    if (month.includes("-")) {
      const p = month.split("-");
      y = p[0];
      m = p[1].padStart(2, "0");
    } else if (month.includes("/")) {
      const p = month.split("/");
      m = p[0].padStart(2, "0");
      y = p[1];
    }
    if (!y || !m) return { dateFrom: undefined, dateTo: undefined };
    const lastDay = new Date(Number(y), Number(m), 0).getDate();
    return {
      dateFrom: `${y}-${m}-01`,
      dateTo: `${y}-${m}-${String(lastDay).padStart(2, "0")}`,
    };
  }, [month]);

  // Server Filters Builder: strictly completed cases + month completion date range + classification/invoice
  const serverFiltersObject = useMemo(() => {
    const combined: Record<string, string[]> = { ...columnFilters };

    // 1. Chỉ lấy các phiếu trạng thái KẾT THÚC
    combined["statusTab"] = ["completed"];

    // 2. Lọc theo ngày hoàn thành công việc của kỳ đang xem
    if (dateFrom && dateTo) {
      combined["ngayHoanThanhCongViec"] = [`${dateFrom}..${dateTo}`];
    }

    // 3. Lọc theo Phân loại Nghiệp vụ
    if (filterType === "CLASSIFICATION") {
      if (filterKey === "SUA_CHUA_CHUNG") {
        combined["classification"] = ["SUA_CHUA_CHUNG"];
      } else if (filterKey === "KY_GUI_NOI_BO") {
        combined["classification"] = ["KY_GUI_NOI_BO", "KY_GUI", "NOI_BO"];
      } else if (filterKey === "OJ_NGOAI") {
        combined["classification"] = ["OJ", "OJ_NGOAI"];
      } else if (filterKey === "OTHER") {
        combined["classification"] = ["__BLANK__", "KHAC", "OTHER"];
      }
    } else if (filterType === "INVOICE") {
      // 4. Lọc theo Hóa đơn VAT
      if (filterKey === "WITH_INVOICE") {
        combined["hasInvoice"] = ["YES"];
      } else if (filterKey === "NO_INVOICE") {
        combined["hasInvoice"] = ["NO"];
      }
    }

    // 5. Kết hợp các date ranges do user lọc thêm
    Object.entries(dateRanges).forEach(([key, range]) => {
      if (range?.from || range?.to) {
        combined[key] = [`${range.from || ""}..${range.to || ""}`];
      }
    });

    return combined;
  }, [columnFilters, dateFrom, dateTo, filterType, filterKey, dateRanges]);

  const serverFiltersStr = useMemo(() => {
    return Object.keys(serverFiltersObject).length > 0
      ? JSON.stringify(serverFiltersObject)
      : undefined;
  }, [serverFiltersObject]);

  // Fetch Server-side Cases Data
  const { data: casesResponse, isLoading } = useQuery({
    queryKey: [
      "garage-month-classification-cases",
      effectiveBranchId,
      page,
      pageSize,
      serverFiltersStr,
      sorts,
      open,
    ],
    queryFn: async () => {
      if (!open)
        return { data: [], pagination: { total: 0, page: 1, pageSize: 20 } };
      return garageApi.getCases(
        effectiveBranchId,
        page,
        pageSize,
        "",
        undefined,
        undefined,
        serverFiltersStr,
        undefined,
        sorts.length > 0 ? sorts : undefined,
      );
    },
    enabled: open && !!dateFrom && !!dateTo,
  });

  const casesList: any[] = useMemo(() => {
    if (!casesResponse) return [];
    if (Array.isArray(casesResponse)) return casesResponse;
    if (Array.isArray(casesResponse.data)) return casesResponse.data;
    return [];
  }, [casesResponse]);

  const totalCases = useMemo(() => {
    return (
      casesResponse?.pagination?.total ??
      casesResponse?.total ??
      casesList.length
    );
  }, [casesResponse, casesList]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalCases / pageSize) || 1;
  }, [totalCases, pageSize]);

  // Column options fetcher for server-side filter popover
  const fetchCaseColumnOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
      filtersStr?: string;
    }) => {
      const res = await garageApi.getCaseColumnOptions(
        effectiveBranchId || "",
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((item: string) => {
          if (columnKey === "classification") {
            return {
              label:
                GARAGE_CASE_CLASSIFICATIONS[item]?.label ||
                item ||
                t("cases.classification.unclassified", "Chưa phân loại"),
              value: item,
            };
          }
          if (columnKey === "hasLinkedInvoice" || columnKey === "hasInvoice") {
            return {
              label: item === "YES" ? "Có hóa đơn (HĐ)" : "Không hóa đơn",
              value: item,
            };
          }
          return { label: item, value: item };
        }),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [effectiveBranchId, t],
  );

  // Sorting & Filtering Handlers
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
    setPage(1);
  };

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (sorts.includes(key)) return "asc";
    if (sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const handleFilterChange = (key: string, values: string[]) => {
    setColumnFilters((prev) => {
      if (!values || values.length === 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: values };
    });
    setPage(1);
  };

  const handleSearchChange = (key: string, val: string) => {
    setColumnSearch((prev) => {
      if (!val) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: val };
    });
    setPage(1);
  };

  const getDateRange = (key: string) => dateRanges[key] || { from: "", to: "" };

  const handleDateRangeChange = (key: string, from?: string, to?: string) => {
    setDateRanges((prev) => ({
      ...prev,
      [key]: { from: from || "", to: to || "" },
    }));
    setPage(1);
  };

  const createHeaderProps = (
    key: string,
    title: string,
    align: "left" | "center" | "right" = "center",
    hideFilter = false,
  ) => ({
    title,
    columnKey: key,
    sortState: getSortState(key),
    onSortChange: (state: "asc" | "desc" | "none") =>
      handleSortChange(key, state),
    searchValue: columnSearch[key] || "",
    onSearchChange: (val: string) => handleSearchChange(key, val),
    selectedFilters: columnFilters[key] || [],
    onFilterChange: (vals: string[]) => handleFilterChange(key, vals),
    fetchOptions: fetchCaseColumnOptions,
    allFilters: serverFiltersObject,
    enableSelectAllMatching: true,
    align,
    hideFilter,
    queryKeyPrefix: `garage-month-cases-${key}`,
  });

  // Aggregate Metrics for Right Panel
  const metrics = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let settledCount = 0;
    let debtCount = 0;
    let withInvoiceCount = 0;

    const customerMap = new Map<
      string,
      { name: string; code: string; amount: number; count: number }
    >();

    casesList.forEach((c: any) => {
      const billed = Number(c.tienCoThue) || 0;
      const paid = Number(c.tienDaThanhToan) || 0;
      const bal = Number(c.tienConPhaiThanhToan) || 0;
      const rev =
        Number(
          c.doanhThu ||
            c.grossProfit?.revenue ||
            c.grossProfit?.DoanhThu ||
            billed,
        ) || 0;
      const cost =
        Number(c.chiPhi || c.grossProfit?.cost || c.grossProfit?.ChiPhi || 0) ||
        0;
      const profit =
        Number(
          c.loiNhuan ||
            c.grossProfit?.profit ||
            c.grossProfit?.LoiNhuan ||
            rev - cost,
        ) || 0;

      totalBilled += billed;
      totalPaid += paid;
      totalBalance += bal;
      totalRevenue += rev;
      totalCost += cost;
      totalProfit += profit;

      if (bal <= 0) settledCount++;
      else debtCount++;

      const hasVat = Boolean(
        (c.rawData?.TienThueKH && Number(c.rawData.TienThueKH) > 0) ||
        (c.tienThueKh && Number(c.tienThueKh) > 0),
      );
      if (hasVat) withInvoiceCount++;

      const custKey = c.khachHangCode || c.khachHangName || "Khách lẻ";
      const custName = c.khachHangName || c.khachHangCode || "Khách lẻ";
      const existing = customerMap.get(custKey) || {
        name: custName,
        code: c.khachHangCode || "",
        amount: 0,
        count: 0,
      };
      existing.amount += billed;
      existing.count += 1;
      customerMap.set(custKey, existing);
    });

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((cust) => ({
        ...cust,
        shareRate: totalBilled > 0 ? (cust.amount / totalBilled) * 100 : 0,
      }));

    const recoveryRate =
      totalBilled > 0
        ? Math.min(100, Math.round((totalPaid / totalBilled) * 1000) / 10)
        : totalBalance === 0
          ? 100
          : 0;

    const marginRate =
      totalRevenue > 0
        ? Math.round((totalProfit / totalRevenue) * 1000) / 10
        : 0;

    return {
      totalCases,
      totalBilled,
      totalPaid,
      totalBalance,
      totalRevenue,
      totalCost,
      totalProfit,
      recoveryRate,
      marginRate,
      settledCount,
      debtCount,
      withInvoiceCount,
      topCustomers,
    };
  }, [casesList, totalCases]);

  // DataTable Columns with Server-side Filter Popovers
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
        cell: (_, idx) => (
          <span className="text-muted-foreground font-medium">
            {(page - 1) * pageSize + idx + 1}
          </span>
        ),
      },
      {
        key: "soChungTu",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "soChungTu",
              t("cases.columns.code", "Số chứng từ"),
              "center",
            )}
          />
        ),
        size: 175,
        minSize: 155,
        enableResizing: true,
        cell: (row: any) => (
          <TableText
            text={row.soChungTu || "N/A"}
            enableCopy={true}
            tooltip={true}
            className="font-medium text-foreground hover:text-primary cursor-pointer"
            onDetailClick={() => {
              setCaseDrawerEditMode(false);
              setCaseDrawerInitialTab("quote_details");
              setSelectedCaseCode(row.soChungTu || row.id);
            }}
          />
        ),
      },
      {
        key: "bienSoXe",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "bienSoXe",
              t("cases.columns.licensePlate", "Biển số xe"),
              "center",
            )}
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
        key: "khachHangName",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "khachHangName",
              t("cases.columns.customer", "Khách hàng"),
              "center",
            )}
          />
        ),
        size: 200,
        minSize: 170,
        enableResizing: true,
        cell: (row: any) => (
          <div className="flex flex-col min-w-0">
            <TableText
              text={row.khachHangName || row.khachHangCode || "Khách lẻ"}
              enableCopy={true}
              tooltip={true}
            />
            {row.khachHangCode && (
              <span className="text-[10px] text-muted-foreground font-mono truncate">
                {row.khachHangCode}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "ngayPhatSinh",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "ngayPhatSinh",
              t("cases.columns.caseDate", "Ngày tiếp nhận"),
              "center",
              true,
            )}
            isActive={
              !!(
                getDateRange("ngayPhatSinh").from ||
                getDateRange("ngayPhatSinh").to
              )
            }
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={getDateRange("ngayPhatSinh").from}
                dateTo={getDateRange("ngayPhatSinh").to}
                onChange={(from, to) => {
                  handleDateRangeChange("ngayPhatSinh", from, to);
                  close();
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 140,
        minSize: 130,
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
            {...createHeaderProps(
              "tienCoThue",
              t("cases.columns.totalAmount", "Tổng tiền"),
              "center",
              true,
            )}
          />
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="tabular-nums font-bold text-foreground">
            {money(row.tienCoThue)}
          </span>
        ),
      },
      {
        key: "tienDaThanhToan",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "tienDaThanhToan",
              isReceipt
                ? t("cases.columns.paidAmount", "Đã thu")
                : t("cases.columns.paidCost", "Đã chi"),
              "center",
              true,
            )}
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
            {...createHeaderProps(
              "tienConPhaiThanhToan",
              isReceipt
                ? t("cases.columns.balanceAmount", "Còn nợ")
                : t("cases.columns.payableCost", "Còn phải trả"),
              "center",
              true,
            )}
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
        key: "loiNhuan",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "loiNhuan",
              t("cases.columns.grossProfit", "Lãi gộp"),
              "center",
              true,
            )}
          />
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => {
          const profit = Number(
            row.loiNhuan ||
              row.grossProfit?.profit ||
              row.grossProfit?.LoiNhuan ||
              0,
          );
          return (
            <span
              className={cn(
                "tabular-nums font-semibold",
                profit > 0
                  ? "text-teal-600 dark:text-teal-400"
                  : profit < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground",
              )}
            >
              {money(profit)}
            </span>
          );
        },
      },
      {
        key: "hasInvoice",
        className: "text-center",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "hasInvoice",
              t("cases.columns.vatInvoice", "Hóa đơn VAT"),
              "center",
            )}
            fetchOptions={async () => ({
              items: [
                { label: "Có hóa đơn (HĐ)", value: "YES" },
                { label: "Không hóa đơn", value: "NO" },
              ],
              total: 2,
              next: null,
            })}
          />
        ),
        size: 125,
        minSize: 115,
        enableResizing: true,
        cell: (row: any) => {
          const hasVat = Boolean(
            (row.rawData?.TienThueKH && Number(row.rawData.TienThueKH) > 0) ||
            (row.tienThueKh && Number(row.tienThueKh) > 0),
          );
          return (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 font-medium",
                hasVat
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800",
              )}
            >
              {hasVat ? (
                <FileCheck className="w-3 h-3 mr-1 text-emerald-600" />
              ) : (
                <FileX className="w-3 h-3 mr-1 text-slate-400" />
              )}
              {hasVat ? "Có HĐ" : "Chưa HĐ"}
            </Badge>
          );
        },
      },
      {
        key: "tenTinhTrangDichVu",
        className: "text-center",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "statusName",
              t("cases.columns.status", "Trạng thái"),
              "center",
            )}
          />
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <KgaraCaseStatusBadge status={row.tenTinhTrangDichVu} />
        ),
      },
      {
        key: "classification",
        className: "text-center",
        header: (
          <TableColumnHeaderFilter
            {...createHeaderProps(
              "classification",
              t("cases.columns.classification", "Phân loại"),
              "center",
            )}
          />
        ),
        size: 140,
        minSize: 130,
        enableResizing: true,
        cell: (row: any) => (
          <GarageCaseClassificationBadge classification={row.classification} />
        ),
      },
    ];
  }, [
    page,
    pageSize,
    isReceipt,
    t,
    serverFiltersStr,
    serverFiltersObject,
    sorts,
    columnSearch,
    columnFilters,
    dateRanges,
    fetchCaseColumnOptions,
  ]);

  const summaryRow = useMemo(() => {
    if (!casesList || casesList.length === 0) return undefined;
    let billed = 0;
    let paid = 0;
    let bal = 0;
    let profit = 0;

    casesList.forEach((c: any) => {
      billed += Number(c.tienCoThue) || 0;
      paid += Number(c.tienDaThanhToan) || 0;
      bal += Number(c.tienConPhaiThanhToan) || 0;
      profit += Number(
        c.loiNhuan || c.grossProfit?.profit || c.grossProfit?.LoiNhuan || 0,
      );
    });

    return {
      ngayPhatSinh: (
        <div className="text-right w-full font-bold text-xs uppercase text-muted-foreground pr-2">
          {t("cases.drawer.total", "Tổng")}:
        </div>
      ),
      tienCoThue: (
        <div className="text-right font-bold tabular-nums text-foreground">
          {money(billed)}
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
      loiNhuan: (
        <div className="text-right font-bold tabular-nums text-teal-600 dark:text-teal-400">
          {money(profit)}
        </div>
      ),
    };
  }, [casesList, t]);

  const invalidateData = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["garage-month-classification-cases"],
    });
    queryClient.invalidateQueries({
      queryKey: ["garage-dashboard-stats"],
    });
    queryClient.invalidateQueries({
      queryKey: ["garage", "cases"],
    });
  }, [queryClient]);

  // ── LEFT PANEL: Filtered Cases Table with Full Pagination ────────
  const leftPanel = (
    <div className="flex flex-col gap-4">
      <DrawerSection
        title={`${t("cases.monthCasesDrawer.title", "Danh sách vụ việc")} – ${filterLabel}`}
        collapsible={false}
        titleExtra={
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-mono bg-primary/5 text-primary border-primary/20"
            >
              Trạng thái: Kết thúc
            </Badge>
            <span className="text-xs text-muted-foreground font-normal">
              {totalCases} {t("cases.title", "phiếu")}
            </span>
          </div>
        }
      >
        <div className="w-full">
          <DataTable
            tableId={`garage-month-cases-${filterType}-${filterKey}`}
            variant="spreadsheet"
            items={casesList}
            columns={columns}
            loading={isLoading}
            summaryRow={summaryRow}
            minWidth={1400}
            enableColumnResizing={true}
            page={page}
            pageSize={pageSize}
            pageSizeOptions={[20, 50, 100]}
            total={totalCases}
            totalPages={totalPages}
            onPage={(p) => setPage(p)}
            onPageSize={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            emptyLabel={t(
              "cases.monthCasesDrawer.noCases",
              "Không có vụ việc nào trạng thái Kết thúc trong phân loại và kỳ này",
            )}
            containerClassName="max-h-[calc(100vh-320px)] overflow-y-auto overflow-x-auto rounded-lg border border-border/80"
            getRowKey={(row) => row.id || row.soChungTu}
            rowHoverActions={(row: any) => [
              {
                groupLabel: "TRA CỨU",
                items: [
                  {
                    label: t("cases.actions.viewDetail", "Xem chi tiết"),
                    icon: <Eye className="w-3.5 h-3.5" />,
                    onClick: () => {
                      setCaseDrawerEditMode(false);
                      setCaseDrawerInitialTab("quote_details");
                      setSelectedCaseCode(row.soChungTu || row.id);
                    },
                    quickAction: true,
                  },
                  {
                    label: t(
                      "cases.actions.viewPartnerDetail",
                      "Chi tiết theo đối tượng",
                    ),
                    icon: <Users className="w-3.5 h-3.5" />,
                    onClick: () => {
                      setCaseDrawerEditMode(false);
                      setCaseDrawerInitialTab("partner_details");
                      setSelectedCaseCode(row.soChungTu || row.id);
                    },
                  },
                ],
              },
              {
                groupLabel: "THAO TÁC",
                items: [
                  {
                    label: t("cases.actions.editCase", "Chỉnh sửa"),
                    icon: <Pencil className="w-3.5 h-3.5" />,
                    onClick: () => {
                      setCaseDrawerEditMode(true);
                      setSelectedCaseCode(row.soChungTu || row.id);
                    },
                    quickAction: true,
                  },
                  {
                    label: t("cases.actions.syncDetails", "Đồng bộ từ KGara"),
                    icon: <RefreshCw className="w-3.5 h-3.5" />,
                    onClick: () => {
                      const targetBranch =
                        effectiveBranchId || row.branchExternalId;
                      if (targetBranch && row.hdPhieuDichVuId) {
                        syncCaseDetail({
                          branchId: targetBranch,
                          caseId: row.hdPhieuDichVuId,
                        });
                      } else {
                        toast.error(
                          t(
                            "cases.missingBranch",
                            "Không xác định được chi nhánh để đồng bộ",
                          ),
                        );
                      }
                    },
                  },
                  {
                    label: t(
                      "cases.actions.netOffSettlement",
                      "Cấn trừ sao kê",
                    ),
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
      </DrawerSection>
    </div>
  );

  // ── RIGHT PANEL: Category Breakdown & KPIs ───────────────────────
  const rightPanel = (
    <div className="flex flex-col gap-3.5 w-full">
      {/* 1. Tổng quan Tài chính phân loại */}
      <DrawerSection
        title={t(
          "cases.monthCasesDrawer.financialOverview",
          "Tổng quan Tài chính phân loại",
        )}
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="flex flex-col gap-2.5">
          {/* Rate Bar */}
          <div className="flex items-center gap-2.5 w-full">
            <Badge
              variant="outline"
              className={cn(
                "font-bold px-2 py-0.5 text-xs border tabular-nums w-fit shrink-0",
                metrics.recoveryRate >= 100
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80",
              )}
            >
              {metrics.recoveryRate.toFixed(1)}%
            </Badge>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-emerald-500"
                style={{ width: `${metrics.recoveryRate}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-border/60 overflow-hidden bg-background/50 divide-y divide-border/40">
            <div className="flex items-center justify-between py-2 px-3">
              <span className="text-[12px] text-muted-foreground font-medium">
                {isReceipt ? "Đã thanh toán" : "Đã chi trả"}
              </span>
              <span className="text-[12px] font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {money(metrics.totalPaid)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 px-3">
              <span className="text-[12px] text-muted-foreground font-medium">
                Tổng phát sinh
              </span>
              <span className="text-[12px] font-mono font-semibold tabular-nums text-foreground">
                {money(metrics.totalBilled)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 px-3">
              <span className="text-[12px] text-muted-foreground font-medium">
                {isReceipt ? "Còn phải thu" : "Còn phải trả"}
              </span>
              <span
                className={cn(
                  "text-[12px] font-mono font-bold tabular-nums",
                  metrics.totalBalance > 0
                    ? "text-destructive"
                    : "text-muted-foreground/60",
                )}
              >
                {money(metrics.totalBalance)}
              </span>
            </div>

            {metrics.totalProfit !== 0 && (
              <div className="flex items-center justify-between py-2 px-3 bg-muted/20">
                <span className="text-[12px] text-muted-foreground font-medium">
                  {t("cases.monthCasesDrawer.profitGross", "Lợi nhuận gộp")}
                </span>
                <div className="text-right">
                  <span
                    className={cn(
                      "text-[12px] font-mono font-bold tabular-nums block",
                      metrics.totalProfit >= 0
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {money(metrics.totalProfit)}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    Biên LN: {metrics.marginRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerSection>

      {/* 2. Cơ cấu Trạng thái & Vụ việc */}
      <DrawerSection
        title={t(
          "cases.monthCasesDrawer.statusOverview",
          "Cơ cấu Trạng thái & Vụ việc",
        )}
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100/60 dark:bg-slate-800/50 border border-border/50 p-2.5 gap-0.5">
            <span className="text-lg font-bold tabular-nums text-foreground">
              {metrics.totalCases}
            </span>
            <span className="text-[11px] text-muted-foreground text-center font-medium">
              Tổng vụ việc
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 p-2.5 gap-0.5">
            <span className="text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
              {metrics.settledCount}
            </span>
            <span className="text-[11px] text-muted-foreground text-center font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Đã tất toán
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-amber-50/40 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 p-2.5 gap-0.5">
            <span className="text-lg font-bold tabular-nums text-amber-700 dark:text-amber-300">
              {metrics.debtCount}
            </span>
            <span className="text-[11px] text-muted-foreground text-center font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              Còn nợ
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50/40 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 p-2.5 gap-0.5">
            <span className="text-lg font-bold tabular-nums text-blue-700 dark:text-blue-300">
              {metrics.withInvoiceCount}
            </span>
            <span className="text-[11px] text-muted-foreground text-center font-medium flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-blue-500" />
              Có HĐ VAT
            </span>
          </div>
        </div>
      </DrawerSection>

      {/* 3. Top 5 Khách hàng phát sinh cao nhất */}
      {metrics.topCustomers.length > 0 && (
        <DrawerSection
          title={t(
            "cases.monthCasesDrawer.topCustomers",
            "Top 5 Khách hàng phát sinh cao nhất",
          )}
          collapsible={true}
          defaultCollapsed={false}
        >
          <div className="flex flex-col divide-y divide-border/40 rounded-xl border border-border/60 bg-background/50 overflow-hidden">
            {metrics.topCustomers.map((cust, idx) => (
              <div
                key={cust.code || cust.name || idx}
                className="flex items-center justify-between p-2.5 text-xs hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate">
                      {cust.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {cust.count} phiếu ({cust.shareRate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold tabular-nums text-foreground shrink-0">
                  {money(cust.amount)}
                </span>
              </div>
            ))}
          </div>
        </DrawerSection>
      )}

      {/* 4. Thông tin Kỳ & Chi nhánh */}
      <DrawerSection
        title={t(
          "cases.monthCasesDrawer.periodInfo",
          "Thông tin Kỳ & Chi nhánh",
        )}
        collapsible={true}
        defaultCollapsed={false}
      >
        <DrawerRow label="Kỳ xem xét" value={monthLabel || month || "—"} />
        <DrawerRow
          label={
            filterType === "CLASSIFICATION" ? "Phân loại" : "Trạng thái HĐ"
          }
          value={<Badge variant="outline">{filterLabel}</Badge>}
        />
        <DrawerRow
          label="Trạng thái lọc"
          value={<Badge variant="success">Kết thúc</Badge>}
        />
        <DrawerRow label="Chi nhánh" value={branchName} />
      </DrawerSection>
    </div>
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={`${filterLabel} – ${monthLabel || month}`}
        subtitle={t(
          "cases.monthCasesDrawer.subtitle",
          "Chi tiết giao dịch & dòng tiền theo phân loại trong kỳ",
        )}
        titleExtra={
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 border",
              metrics.recoveryRate >= 100
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-foreground border-border",
            )}
          >
            {isReceipt ? (
              <Wallet className="w-3 h-3 inline mr-1" />
            ) : (
              <Truck className="w-3 h-3 inline mr-1" />
            )}
            {metrics.recoveryRate.toFixed(1)}% Hoàn tất • {totalCases} vụ việc
            (Kết thúc)
          </Badge>
        }
        size="xl"
        layout="2-columns"
        collapsibleRightPanel={true}
        rightPanelDefaultCollapsed={false}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        actions={[{ label: "Đóng", variant: "outline", onClick: onClose }]}
      />

      {/* Standalone Case Drawer */}
      <GarageCaseStandaloneDrawer
        isOpen={!!selectedCaseCode}
        caseCode={selectedCaseCode}
        initialEditMode={caseDrawerEditMode}
        initialTabKey={caseDrawerInitialTab}
        onClose={() => {
          setSelectedCaseCode(null);
          setCaseDrawerEditMode(false);
        }}
        onSuccess={() => {
          invalidateData();
        }}
      />

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
    </>
  );
}
