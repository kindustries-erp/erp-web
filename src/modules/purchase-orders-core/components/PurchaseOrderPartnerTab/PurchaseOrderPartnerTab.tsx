import React, { useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { FileText, Boxes, Eye } from "lucide-react";
import {
  type ErpPurchaseOrder,
  type ErpPoItemRow,
  purchaseOrdersCoreApi,
} from "../../api/purchaseOrdersCoreApi";
import { StandardTable } from "@/shared/components/StandardTable";
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { PillTabs } from "@/shared/components/PillTabs";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import type { PurchaseOrderPartnerTabProps } from "./types";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

function formatPoStatus(status?: string | null) {
  switch (status) {
    case "DRAFT":
      return {
        label: "Nháp",
        variant: "secondary" as const,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "APPROVED":
    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        variant: "default" as const,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "PARTIAL_RECEIVED":
      return {
        label: "Nhập một phần",
        variant: "default" as const,
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
    case "RECEIVED":
    case "FULLY_RECEIVED":
      return {
        label: "Đã nhập đủ",
        variant: "default" as const,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        variant: "destructive" as const,
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    default:
      return {
        label: status || "—",
        variant: "outline" as const,
        className: "",
      };
  }
}

export const PurchaseOrderPartnerTab = React.memo(
  function PurchaseOrderPartnerTab({
    purchaseOrder,
    supplierId: propSupplierId,
    defaultViewMode = "orders",
    onOpenPoDetail,
  }: PurchaseOrderPartnerTabProps) {
    const { t } = useTranslation("purchaseOrders");

    const effectiveSupplierId =
      propSupplierId ||
      (purchaseOrder as any)?.supplierId ||
      (purchaseOrder as any)?.supplier_id ||
      null;

    const [viewMode, setViewMode] = useState<"orders" | "lines">(
      defaultViewMode,
    );

    // ═════════════════════════════════════════════════════════════════════════
    // 1. STATE & HOOKS CHO BẢNG DANH SÁCH ĐƠN MUA HÀNG (PO ORDERS LIST)
    // ═════════════════════════════════════════════════════════════════════════
    const [orderPage, setOrderPage] = useState(1);
    const [orderPageSize, setOrderPageSize] =
      useState<number>(getDefaultPageSize);
    const [orderSorts, setOrderSorts] = useState<string[]>([]);
    const [orderDateFrom, setOrderDateFrom] = useState<string>("");
    const [orderDateTo, setOrderDateTo] = useState<string>("");
    const [orderColumnFilters, setOrderColumnFilters] = useState<
      Record<string, string[]>
    >({});
    const [orderColumnSearch, setOrderColumnSearchState] = useState<
      Record<string, string>
    >({});

    const setOrderSort = useCallback(
      (key: string, state: "asc" | "desc" | "none") => {
        setOrderSorts((prev) => {
          const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
          if (state === "asc") return [...filtered, key];
          if (state === "desc") return [...filtered, `-${key}`];
          return filtered;
        });
        setOrderPage(1);
      },
      [],
    );

    const setOrderColumnFilter = useCallback((key: string, vals: string[]) => {
      setOrderColumnFilters((prev) => {
        if (!vals || vals.length === 0) {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        }
        return { ...prev, [key]: vals };
      });
      setOrderPage(1);
    }, []);

    const setOrderColumnSearch = useCallback((key: string, val: string) => {
      setOrderColumnSearchState((prev) => {
        if (!val || val.trim().length === 0) {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        }
        return { ...prev, [key]: val };
      });
      setOrderPage(1);
    }, []);

    const setOrderDateRange = useCallback((from?: string, to?: string) => {
      setOrderDateFrom(from || "");
      setOrderDateTo(to || "");
      setOrderPage(1);
    }, []);

    const toggleOrderSort = useCallback((key: string) => {
      setOrderSorts((prev) => {
        const isAsc = prev.includes(key);
        const isDesc = prev.includes(`-${key}`);
        const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
        if (!isAsc && !isDesc) return [...filtered, key];
        if (isAsc) return [...filtered, `-${key}`];
        return filtered;
      });
      setOrderPage(1);
    }, []);

    const toggleItemSort = useCallback((key: string) => {
      setItemSorts((prev) => {
        const isAsc = prev.includes(key);
        const isDesc = prev.includes(`-${key}`);
        const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
        if (!isAsc && !isDesc) return [...filtered, key];
        if (isAsc) return [...filtered, `-${key}`];
        return filtered;
      });
      setItemPage(1);
    }, []);

    const { data: ordersResponse, isLoading: isLoadingOrders } = useQuery({
      queryKey: [
        "supplier-purchase-orders-list",
        effectiveSupplierId,
        orderPage,
        orderPageSize,
        orderSorts,
        orderDateFrom,
        orderDateTo,
        orderColumnFilters,
        orderColumnSearch,
      ],
      queryFn: () =>
        purchaseOrdersCoreApi.list({
          supplier_id: effectiveSupplierId || undefined,
          page: orderPage,
          pageSize: orderPageSize,
          sort: orderSorts.length > 0 ? orderSorts : undefined,
          date_from: orderDateFrom || undefined,
          date_to: orderDateTo || undefined,
          column_search: Object.keys(orderColumnSearch).length
            ? JSON.stringify(orderColumnSearch)
            : undefined,
          column_filters: Object.keys(orderColumnFilters).length
            ? JSON.stringify(orderColumnFilters)
            : undefined,
        }),
      enabled: !!effectiveSupplierId && viewMode === "orders",
    });

    const orders = useMemo(() => ordersResponse?.items || [], [ordersResponse]);
    const ordersTotal = ordersResponse?.total || 0;
    const ordersTotalPages = ordersResponse?.totalPages || 0;

    const orderListHookLike = useMemo(
      () => ({
        sorts: orderSorts,
        setSort: setOrderSort,
        columnFilters: orderColumnFilters,
        setColumnFilter: setOrderColumnFilter,
        columnSearch: orderColumnSearch,
        setColumnSearch: setOrderColumnSearch,
        dateFrom: orderDateFrom,
        dateTo: orderDateTo,
        setDateRange: setOrderDateRange,
      }),
      [
        orderSorts,
        setOrderSort,
        orderColumnFilters,
        setOrderColumnFilter,
        orderColumnSearch,
        setOrderColumnSearch,
        orderDateFrom,
        orderDateTo,
        setOrderDateRange,
      ],
    );

    const fetchOrderColumnOptions = useCallback(
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
        let effectiveFiltersStr = filtersStr;
        if (effectiveSupplierId) {
          try {
            const parsed = filtersStr ? JSON.parse(filtersStr) : {};
            parsed.supplierId = [effectiveSupplierId];
            effectiveFiltersStr = JSON.stringify(parsed);
          } catch {
            effectiveFiltersStr = JSON.stringify({
              supplierId: [effectiveSupplierId],
            });
          }
        }
        const res = await purchaseOrdersCoreApi.getColumnOptions(
          columnKey,
          search,
          pageParam,
          20,
          effectiveFiltersStr,
        );
        return {
          items: res.items.map((i) => ({ label: i, value: i })),
          total: res.total,
          next: res.page < res.totalPages ? res.page + 1 : null,
        };
      },
      [effectiveSupplierId],
    );

    const orderHeaderFilter = useMemo(
      () =>
        createColumnHeaderFilter({
          listHook: orderListHookLike,
          queryKeyPrefix: `supplier-po-options-${effectiveSupplierId}`,
          fetchOptions: fetchOrderColumnOptions,
        }),
      [orderListHookLike, effectiveSupplierId, fetchOrderColumnOptions],
    );

    const orderColumns: DataTableColumn<ErpPurchaseOrder>[] = useMemo(() => {
      return [
        // 1. Cột STT: 40px, căn giữa tuyệt đối
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          size: 40,
          enableResizing: false,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className: "text-center w-[40px] min-w-[40px]",
          cell: (_: any, idx: number) => (
            <span className="w-full block text-center text-muted-foreground font-medium">
              {idx}
            </span>
          ),
        },
        // 2. Cột Số Đơn PO
        {
          key: "poNo",
          size: 150,
          enableResizing: true,
          header: orderHeaderFilter("poNo", t("Số đơn PO")),
          cell: (row: ErpPurchaseOrder) => (
            <button
              type="button"
              onClick={() => onOpenPoDetail?.(row)}
              className="font-mono font-semibold text-primary hover:underline flex items-center gap-1.5"
            >
              <span>{row.poNo}</span>
              <Eye className="w-3 h-3 text-muted-foreground opacity-60 hover:opacity-100" />
            </button>
          ),
        },
        // 3. Cột Ngày Đặt
        {
          key: "orderDate",
          size: 120,
          enableResizing: true,
          header: orderHeaderFilter.date("orderDate", t("Ngày đặt")),
          className: "text-right",
          cell: (row: ErpPurchaseOrder) => (
            <TableDateCell
              date={row.orderDate}
              className="justify-end w-full"
            />
          ),
        },
        // 4. Cột Ngày Hẹn Giao
        {
          key: "expectedDate",
          size: 120,
          enableResizing: true,
          header: orderHeaderFilter.date("expectedDate", t("Ngày hẹn giao")),
          className: "text-right",
          cell: (row: ErpPurchaseOrder) => (
            <TableDateCell
              date={row.expectedDate}
              className="justify-end w-full"
            />
          ),
        },
        // 5. Cột Trạng Thái
        {
          key: "status",
          size: 140,
          enableResizing: true,
          header: orderHeaderFilter("status", t("Trạng thái")),
          cell: (row: ErpPurchaseOrder) => {
            const badgeMeta = formatPoStatus(row.status);
            return (
              <Badge
                variant={badgeMeta.variant}
                className={`border ${badgeMeta.className} text-[11px]`}
              >
                {badgeMeta.label}
              </Badge>
            );
          },
        },
        // 6. Cột Tổng Tiền
        {
          key: "totalAmount",
          size: 150,
          enableResizing: true,
          header: orderHeaderFilter.amount("totalAmount", t("Tổng tiền")),
          className: "text-right",
          cell: (row: any) => {
            const total =
              row.totalAmount != null
                ? Number(row.totalAmount)
                : row.lines?.reduce(
                    (s: number, l: any) => s + Number(l.amount || 0),
                    0,
                  ) || 0;
            return (
              <span className="font-mono tabular-nums font-semibold text-foreground">
                {money(total)}
              </span>
            );
          },
        },
        // 7. Cột Ghi Chú
        {
          key: "remarks",
          size: 200,
          enableResizing: true,
          header: orderHeaderFilter("remarks", t("Ghi chú")),
          cell: (row: ErpPurchaseOrder) => (
            <span
              className="text-muted-foreground truncate max-w-[220px]"
              title={row.remarks || ""}
            >
              {row.remarks || "—"}
            </span>
          ),
        },
      ];
    }, [orderHeaderFilter, t, onOpenPoDetail]);

    // ═════════════════════════════════════════════════════════════════════════
    // 2. STATE & HOOKS CHO BẢNG CHI TIẾT DÒNG HÀNG (PO ITEM LINES LIST)
    // ═════════════════════════════════════════════════════════════════════════
    const [itemPage, setItemPage] = useState(1);
    const [itemPageSize, setItemPageSize] =
      useState<number>(getDefaultPageSize);
    const [itemSorts, setItemSorts] = useState<string[]>([]);
    const [itemDateFrom, setItemDateFrom] = useState<string>("");
    const [itemDateTo, setItemDateTo] = useState<string>("");
    const [itemColumnFilters, setItemColumnFilters] = useState<
      Record<string, string[]>
    >({});
    const [itemColumnSearch, setItemColumnSearchState] = useState<
      Record<string, string>
    >({});

    const setItemSort = useCallback(
      (key: string, state: "asc" | "desc" | "none") => {
        setItemSorts((prev) => {
          const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
          if (state === "asc") return [...filtered, key];
          if (state === "desc") return [...filtered, `-${key}`];
          return filtered;
        });
        setItemPage(1);
      },
      [],
    );

    const setItemColumnFilter = useCallback((key: string, vals: string[]) => {
      setItemColumnFilters((prev) => {
        if (!vals || vals.length === 0) {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        }
        return { ...prev, [key]: vals };
      });
      setItemPage(1);
    }, []);

    const setItemColumnSearch = useCallback((key: string, val: string) => {
      setItemColumnSearchState((prev) => {
        if (!val || val.trim().length === 0) {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        }
        return { ...prev, [key]: val };
      });
      setItemPage(1);
    }, []);

    const setItemDateRange = useCallback((from?: string, to?: string) => {
      setItemDateFrom(from || "");
      setItemDateTo(to || "");
      setItemPage(1);
    }, []);

    const activeItemSort = itemSorts[0] || "";
    let itemSortBy = "";
    let itemSortOrder: "asc" | "desc" = "desc";
    if (activeItemSort.startsWith("-")) {
      itemSortBy = activeItemSort.substring(1);
      itemSortOrder = "desc";
    } else if (activeItemSort) {
      itemSortBy = activeItemSort;
      itemSortOrder = "asc";
    }

    const { data: itemLinesResponse, isLoading: isLoadingItems } = useQuery({
      queryKey: [
        "supplier-po-items-list",
        effectiveSupplierId,
        itemPage,
        itemPageSize,
        itemSortBy,
        itemSortOrder,
        itemDateFrom,
        itemDateTo,
        itemColumnFilters,
        itemColumnSearch,
      ],
      queryFn: () =>
        purchaseOrdersCoreApi.getItemsList({
          supplier_id: effectiveSupplierId || undefined,
          page: itemPage,
          pageSize: itemPageSize,
          sort_by: itemSortBy || undefined,
          sort_order: itemSortOrder || undefined,
          date_from: itemDateFrom || undefined,
          date_to: itemDateTo || undefined,
          column_search: Object.keys(itemColumnSearch).length
            ? JSON.stringify(itemColumnSearch)
            : undefined,
          column_filters: Object.keys(itemColumnFilters).length
            ? JSON.stringify(itemColumnFilters)
            : undefined,
        }),
      enabled: !!effectiveSupplierId && viewMode === "lines",
    });

    const itemLines = useMemo(
      () => itemLinesResponse?.items || [],
      [itemLinesResponse],
    );
    const itemLinesTotal = itemLinesResponse?.total || 0;
    const itemLinesTotalPages = itemLinesResponse?.totalPages || 0;

    const itemListHookLike = useMemo(
      () => ({
        sorts: itemSorts,
        setSort: setItemSort,
        columnFilters: itemColumnFilters,
        setColumnFilter: setItemColumnFilter,
        columnSearch: itemColumnSearch,
        setColumnSearch: setItemColumnSearch,
        dateFrom: itemDateFrom,
        dateTo: itemDateTo,
        setDateRange: setItemDateRange,
      }),
      [
        itemSorts,
        setItemSort,
        itemColumnFilters,
        setItemColumnFilter,
        itemColumnSearch,
        setItemColumnSearch,
        itemDateFrom,
        itemDateTo,
        setItemDateRange,
      ],
    );

    const fetchItemColumnOptions = useCallback(
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
        const res = await purchaseOrdersCoreApi.getItemsColumnOptions(
          columnKey,
          search,
          pageParam,
          20,
          filtersStr,
          effectiveSupplierId || undefined,
        );
        return {
          items: res.items.map((i) => ({ label: i, value: i })),
          total: res.total,
          next: res.page < res.totalPages ? res.page + 1 : null,
        };
      },
      [effectiveSupplierId],
    );

    const itemHeaderFilter = useMemo(
      () =>
        createColumnHeaderFilter({
          listHook: itemListHookLike,
          queryKeyPrefix: `supplier-po-items-options-${effectiveSupplierId}`,
          fetchOptions: fetchItemColumnOptions,
        }),
      [itemListHookLike, effectiveSupplierId, fetchItemColumnOptions],
    );

    const itemColumns: DataTableColumn<ErpPoItemRow>[] = useMemo(() => {
      return [
        // 1. Cột STT
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          size: 40,
          enableResizing: false,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className: "text-center w-[40px] min-w-[40px]",
          cell: (_: any, idx: number) => (
            <span className="w-full block text-center text-muted-foreground font-medium">
              {idx}
            </span>
          ),
        },
        // 2. Cột Ngày Đặt
        {
          key: "orderDate",
          size: 110,
          enableResizing: true,
          header: itemHeaderFilter.date("orderDate", t("Ngày đặt")),
          className: "text-right",
          cell: (row: ErpPoItemRow) => (
            <TableDateCell
              date={row.orderDate}
              className="justify-end w-full"
            />
          ),
        },
        // 3. Cột Số Đơn PO
        {
          key: "poNo",
          size: 130,
          enableResizing: true,
          header: itemHeaderFilter("poNo", t("Số đơn PO")),
          cell: (row: ErpPoItemRow) => (
            <span className="font-mono font-semibold text-primary">
              {row.poNo}
            </span>
          ),
        },
        // 4. Cột Mã Mặt Hàng
        {
          key: "itemCode",
          size: 140,
          enableResizing: true,
          header: itemHeaderFilter("itemCode", t("Mã mặt hàng")),
          cell: (row: ErpPoItemRow) => (
            <span className="font-mono font-medium text-foreground">
              {row.itemCode || "—"}
            </span>
          ),
        },
        // 5. Cột Tên Mặt Hàng
        {
          key: "itemName",
          size: 240,
          enableResizing: true,
          header: itemHeaderFilter("itemName", t("Tên mặt hàng")),
          cell: (row: ErpPoItemRow) => (
            <div className="truncate max-w-[240px]" title={row.itemName}>
              <span className="font-medium text-foreground">
                {row.itemName}
              </span>
              {row.description && (
                <div className="text-[11px] text-muted-foreground truncate">
                  {row.description}
                </div>
              )}
            </div>
          ),
        },
        // 6. Cột Số Lượng Đặt
        {
          key: "qtyOrdered",
          size: 100,
          enableResizing: true,
          header: itemHeaderFilter.qty("qtyOrdered", t("SL đặt")),
          className: "text-right",
          cell: (row: ErpPoItemRow) => (
            <span className="font-mono tabular-nums font-semibold text-foreground">
              {Number(row.qtyOrdered || 0).toLocaleString("vi-VN")}
            </span>
          ),
        },
        // 7. Cột Số Lượng Đã Nhận
        {
          key: "qtyReceived",
          size: 100,
          enableResizing: true,
          header: itemHeaderFilter.qty("qtyReceived", t("SL đã nhận")),
          className: "text-right",
          cell: (row: ErpPoItemRow) => {
            const ord = Number(row.qtyOrdered || 0);
            const rec = Number(row.qtyReceived || 0);
            const isFull = rec >= ord && ord > 0;
            return (
              <span
                className={`font-mono tabular-nums font-bold ${
                  isFull
                    ? "text-emerald-600 dark:text-emerald-400"
                    : rec > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground"
                }`}
              >
                {rec.toLocaleString("vi-VN")}
              </span>
            );
          },
        },
        // 8. Cột Đơn Giá
        {
          key: "unitPrice",
          size: 120,
          enableResizing: true,
          header: itemHeaderFilter.amount("unitPrice", t("Đơn giá")),
          className: "text-right",
          cell: (row: ErpPoItemRow) => (
            <span className="font-mono tabular-nums text-foreground">
              {row.unitPrice ? money(Number(row.unitPrice)) : "—"}
            </span>
          ),
        },
        // 9. Cột Thành Tiền
        {
          key: "amount",
          size: 140,
          enableResizing: true,
          header: itemHeaderFilter.amount("amount", t("Thành tiền")),
          className: "text-right",
          cell: (row: ErpPoItemRow) => (
            <span className="font-mono tabular-nums font-bold text-foreground">
              {row.amount ? money(Number(row.amount)) : "—"}
            </span>
          ),
        },
        // 10. Cột Trạng Thái
        {
          key: "status",
          size: 120,
          enableResizing: true,
          header: itemHeaderFilter("status", t("Trạng thái")),
          cell: (row: ErpPoItemRow) => {
            const badgeMeta = formatPoStatus(row.status);
            return (
              <Badge
                variant={badgeMeta.variant}
                className={`border ${badgeMeta.className} text-[10.5px]`}
              >
                {badgeMeta.label}
              </Badge>
            );
          },
        },
      ];
    }, [itemHeaderFilter, t]);

    return (
      <div className="flex flex-col h-full space-y-3">
        {/* ── 1. Header Page Tabs (Chuẩn /standardize-table-page) ───────────── */}
        <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2.5">
          <PillTabs<"orders" | "lines">
            value={viewMode}
            onValueChange={setViewMode}
            className="w-full sm:w-auto shrink-0"
            listClassName="h-9 p-1 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm gap-1.5"
            triggerClassName="h-7 px-3.5 text-xs font-semibold rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
            hideBorder
            items={[
              {
                value: "orders",
                label: t("Danh sách Đơn mua hàng"),
                icon: FileText,
                badge: (
                  <Badge
                    variant="secondary"
                    className="ml-1 text-[10px] px-1.5 py-0 font-mono font-normal"
                  >
                    {ordersTotal}
                  </Badge>
                ),
              },
              {
                value: "lines",
                label: t("Chi tiết Dòng hàng đã mua"),
                icon: Boxes,
                badge: (
                  <Badge
                    variant="secondary"
                    className="ml-1 text-[10px] px-1.5 py-0 font-mono font-normal"
                  >
                    {itemLinesTotal}
                  </Badge>
                ),
              },
            ]}
          />

          <div className="hidden sm:block text-xs text-muted-foreground">
            {viewMode === "orders"
              ? t("Toàn bộ các đơn PO đặt từ nhà cung cấp này")
              : t("Bảng kê chi tiết từng mặt hàng và số lượng đã nhập")}
          </div>
        </div>

        {/* ── 2. Main Content DrawerSection ─────────────────────────────────── */}
        <DrawerSection
          title={
            viewMode === "orders"
              ? t("Danh sách Đơn mua hàng")
              : t("Chi tiết Dòng hàng đã mua")
          }
          titleExtra={
            <span className="text-xs font-mono font-normal text-muted-foreground">
              {viewMode === "orders"
                ? `${ordersTotal} ${t("đơn hàng")}`
                : `${itemLinesTotal} ${t("dòng hàng")}`}
            </span>
          }
          collapsible={true}
          defaultCollapsed={false}
          className="flex-1 flex flex-col mb-0"
          bodyClassName="flex-1 flex flex-col min-h-0"
        >
          {viewMode === "orders" ? (
            <StandardTable<ErpPurchaseOrder>
              variant="spreadsheet"
              items={orders}
              columns={orderColumns}
              loading={isLoadingOrders}
              total={ordersTotal}
              totalPages={ordersTotalPages}
              page={orderPage}
              pageSize={orderPageSize}
              onPage={setOrderPage}
              onPageSize={setOrderPageSize}
              sortArray={orderSorts}
              onSort={toggleOrderSort}
              getRowKey={(row) => row.id}
            />
          ) : (
            <StandardTable<ErpPoItemRow>
              variant="spreadsheet"
              items={itemLines}
              columns={itemColumns}
              loading={isLoadingItems}
              total={itemLinesTotal}
              totalPages={itemLinesTotalPages}
              page={itemPage}
              pageSize={itemPageSize}
              onPage={setItemPage}
              onPageSize={setItemPageSize}
              sortArray={itemSorts}
              onSort={toggleItemSort}
              getRowKey={(row) => row.id}
            />
          )}
        </DrawerSection>
      </div>
    );
  },
);
