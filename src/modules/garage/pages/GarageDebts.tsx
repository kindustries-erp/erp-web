import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import {
  TableColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { SubtotalSummaryCell } from "@/shared/components/DataTable/SubtotalSummaryCell";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useGarageStore } from "../store/garageStore";
import {
  useGarageCustomersList,
  type CustomerDebtItem,
} from "../hooks/useGarageCustomersList";
import { useGarageBranches } from "../hooks/useGarage";
import { GarageCustomerDetailDrawer } from "../components/GarageCustomerDetailDrawer";
import { garageApi } from "../api/garageApi";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Users, Eye, FileText, Download } from "lucide-react";
import toast from "react-hot-toast";
import type { TabItem } from "@/shared/components/PageLayout";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

export function GarageDebts() {
  const { t } = useTranslation(["garage", "common"]);
  const { selectedBranchId } = useGarageStore();
  const { data: branches } = useGarageBranches();

  const [activeTab, setActiveTab] = useState<string>("customers");

  const pageTabs: TabItem[] = useMemo(
    () => [
      {
        value: "customers",
        label: t("partners.tabCustomers", "Khách hàng"),
      },
    ],
    [t],
  );

  const listHook = useGarageCustomersList(selectedBranchId || undefined);

  const [selectedCustomer, setSelectedCustomer] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (listHook.sorts.includes(key)) return "asc";
    if (listHook.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const handleQuickExport = useCallback(async () => {
    try {
      toast.loading(
        t("garage:cases.exportDrawer.downloading", "Đang xuất dữ liệu..."),
        { id: "quick-export-garage-debt" },
      );
      const items = listHook.data;
      if (!items || items.length === 0) {
        toast.error(t("garage:customers.empty", "Không có dữ liệu để xuất"), {
          id: "quick-export-garage-debt",
        });
        return;
      }

      const headers = [
        "Mã khách hàng",
        "Tên khách hàng",
        "Số phiếu DV",
        "Tổng phải thu",
        "Đã thu",
        "Còn phải thu",
        "Nợ 0-30 ngày",
        "Nợ 31-60 ngày",
        "Nợ 61-90 ngày",
        "Nợ >90 ngày",
        "Tuổi nợ (ngày)",
        "Ngày gần nhất",
        "Chi nhánh",
      ];

      const csvRows = [headers.join(",")];
      for (const row of items) {
        const branchObj = branches?.find(
          (b: any) => b.externalId === row.branchExternalId,
        );
        const branchLabel = branchObj?.name || row.branchExternalId || "";
        csvRows.push(
          [
            `"${(row.customerCode || "").replace(/"/g, '""')}"`,
            `"${(row.customerName || "").replace(/"/g, '""')}"`,
            row.caseCount,
            row.totalAmount,
            row.paidAmount,
            row.balanceAmount,
            row.aging0_30,
            row.aging31_60,
            row.aging61_90,
            row.agingOver90,
            row.maxAgingDays,
            `"${row.latestDate ? row.latestDate.slice(0, 10) : ""}"`,
            `"${branchLabel.replace(/"/g, '""')}"`,
          ].join(","),
        );
      }

      const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = `Bao_cao_cong_no_garage_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 2000);

      toast.success(
        t("common:exportSuccess", "Đã tải xuống bảng kê công nợ."),
        { id: "quick-export-garage-debt" },
      );
    } catch (e: any) {
      toast.error(
        e?.message ||
          t("garage:cases.exportDrawer.downloadFailed", "Xuất file thất bại."),
        { id: "quick-export-garage-debt" },
      );
    }
  }, [branches, listHook.data, t]);

  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("common:search", "Tra cứu"),
        items: [
          {
            label: t(
              "partners.exportCurrentView",
              "Xuất nhanh dữ liệu hiện tại",
            ),
            icon: <Download className="w-4 h-4 text-primary" />,
            onClick: handleQuickExport,
          },
        ],
      },
    ],
    [handleQuickExport, t],
  );

  const columns: DataTableColumn<CustomerDebtItem>[] = useMemo(
    () => [
      // 1. STT (#)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_: CustomerDebtItem, idx: number) => <span>{idx}</span>,
      },

      // 2. Tên Khách Hàng (TableText bật icon mắt mở Drawer khi click)
      {
        key: "customerName",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.customerName", "Tên khách hàng")}
            columnKey="customerName"
            queryKeyPrefix="garage-customer-name-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getCustomersDebtColumnOptions(
                selectedBranchId || undefined,
                "customerName",
                search,
                pageParam,
                20,
                filtersStr,
              );
              return {
                items: res.items.map((it: string) => ({
                  label: it,
                  value: it,
                })),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            sortState={getSortState("customerName")}
            onSortChange={(s) => listHook.setSort("customerName", s)}
            searchValue={listHook.columnSearch["customerName"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("customerName", v)}
            selectedFilters={listHook.columnFilters["customerName"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("customerName", v)}
            isActive={Boolean(
              listHook.columnFilters["customerName"]?.length ||
              listHook.columnSearch["customerName"],
            )}
            enableSelectAllMatching={true}
            showBlankOption={true}
            align="center"
          />
        ),
        size: 260,
        minSize: 220,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <TableText
            text={row.customerName || "—"}
            tooltip={true}
            enableCopy={true}
            textClassName="truncate text-foreground font-medium text-xs leading-tight select-text"
            onDetailClick={(e) => {
              e?.stopPropagation();
              setSelectedCustomer({
                code: row.customerCode,
                name: row.customerName,
              });
            }}
          />
        ),
      },

      // 3. Mã Khách Hàng (Tắt icon mắt, giữ copy mã)
      {
        key: "customerCode",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.customerCode", "Mã KH")}
            columnKey="customerCode"
            queryKeyPrefix="garage-customer-code-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getCustomersDebtColumnOptions(
                selectedBranchId || undefined,
                "customerCode",
                search,
                pageParam,
                20,
                filtersStr,
              );
              return {
                items: res.items.map((it: string) => ({
                  label: it,
                  value: it,
                })),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            sortState={getSortState("customerCode")}
            onSortChange={(s) => listHook.setSort("customerCode", s)}
            searchValue={listHook.columnSearch["customerCode"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("customerCode", v)}
            selectedFilters={listHook.columnFilters["customerCode"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("customerCode", v)}
            isActive={Boolean(
              listHook.columnFilters["customerCode"]?.length ||
              listHook.columnSearch["customerCode"],
            )}
            enableSelectAllMatching={true}
            showBlankOption={true}
            align="center"
          />
        ),
        size: 160,
        minSize: 130,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <TableText
            text={row.customerCode || "— (Chưa có mã)"}
            enableCopy={Boolean(row.customerCode)}
            tooltip={true}
            className="font-mono text-muted-foreground font-normal text-xs"
          />
        ),
      },

      // 4. SL Phiếu DV (Pill Button Clickable Mở Drawer)
      {
        key: "caseCount",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.caseCount", "SL Phiếu DV")}
            columnKey="caseCount"
            queryKeyPrefix="garage-customer-casecount-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getCustomersDebtColumnOptions(
                selectedBranchId || undefined,
                "caseCount",
                search,
                pageParam,
                20,
                filtersStr,
              );
              return {
                items: res.items.map((it: string) => ({
                  label: `${it} phiếu`,
                  value: it,
                })),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            sortState={getSortState("caseCount")}
            onSortChange={(s) => listHook.setSort("caseCount", s)}
            searchValue={listHook.columnSearch["caseCount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("caseCount", v)}
            selectedFilters={listHook.columnFilters["caseCount"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("caseCount", v)}
            isActive={Boolean(
              listHook.columnFilters["caseCount"]?.length ||
              listHook.columnSearch["caseCount"],
            )}
            enableSelectAllMatching={true}
            align="center"
          />
        ),
        size: 120,
        minSize: 105,
        enableResizing: true,
        className: "text-center",
        cell: (row: CustomerDebtItem) => {
          if (!row.caseCount || row.caseCount <= 0) {
            return (
              <span className="text-muted-foreground/30 font-mono text-xs select-none">
                0
              </span>
            );
          }
          return (
            <Tooltip
              content={`${row.caseCount} phiếu dịch vụ phát sinh • Click xem chi tiết`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCustomer({
                    code: row.customerCode,
                    name: row.customerName,
                  });
                }}
                className="inline-flex items-center justify-center gap-1 px-2 py-0 h-[20px] rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-foreground transition-all duration-150 cursor-pointer group shadow-xs hover:scale-105"
              >
                <FileText className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
                  {row.caseCount.toLocaleString("vi-VN")}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  phiếu
                </span>
              </button>
            </Tooltip>
          );
        },
      },

      // 5. Tổng phải thu (Progress bar + Tooltip như /invoice-debts & /garage-cases)
      {
        key: "paymentProgress",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.totalReceivable", "Tổng phải thu")}
            columnKey="paymentProgress"
            sortState={getSortState("totalAmount")}
            onSortChange={(s) => listHook.setSort("totalAmount", s)}
            searchValue={listHook.columnSearch["paymentProgress"] || ""}
            onSearchChange={(v) =>
              listHook.setColumnSearch("paymentProgress", v)
            }
            selectedFilters={listHook.columnFilters["paymentProgress"] || []}
            onFilterChange={(v) =>
              listHook.setColumnFilter("paymentProgress", v)
            }
            isActive={Boolean(
              listHook.columnFilters["paymentProgress"]?.length ||
              listHook.columnSearch["paymentProgress"],
            )}
            align="right"
            enableSelectAllMatching={true}
            formatOptionLabel={(val: string) => {
              if (val === "PAID")
                return t("customers.filter.paid", "Đã thu đủ");
              if (val === "PARTIAL")
                return t("customers.filter.partial", "Thu một phần");
              if (val === "UNPAID")
                return t("customers.filter.unpaid", "Chưa thu");
              return val;
            }}
            fetchOptions={async ({ search }) => {
              const allItems = [
                {
                  label: t("customers.filter.paid", "Đã thu đủ"),
                  value: "PAID",
                },
                {
                  label: t("customers.filter.partial", "Thu một phần"),
                  value: "PARTIAL",
                },
                {
                  label: t("customers.filter.unpaid", "Chưa thu"),
                  value: "UNPAID",
                },
              ];
              const filtered = search
                ? allItems.filter((i) =>
                    i.label.toLowerCase().includes(search.toLowerCase()),
                  )
                : allItems;
              return {
                items: filtered,
                total: filtered.length,
                next: null,
              };
            }}
          />
        ),
        size: 190,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const total = Number(row.totalAmount) || 0;
          const paid = Number(row.paidAmount) || 0;
          const bal = Number(row.balanceAmount) || 0;

          if (total <= 0 && bal <= 0 && paid <= 0) {
            return (
              <span className="text-muted-foreground/40 font-normal select-none">
                —
              </span>
            );
          }

          const isAllPaid = bal <= 0 && paid > 0;
          const isUnpaid = paid <= 0 && bal > 0;
          const rate =
            total > 0
              ? Math.min(100, Math.round((paid / total) * 100))
              : isAllPaid
                ? 100
                : 0;

          const tooltipText = isAllPaid
            ? `Đã thu đủ 100%: ${money(paid)}`
            : isUnpaid
              ? `Chưa thu (0%): Còn phải thu ${money(bal)} / Tổng ${money(total)}`
              : `Đã thu: ${money(paid)} / ${money(total)} (${rate}%) • Còn phải thu: ${money(bal)}`;

          return (
            <Tooltip content={tooltipText}>
              <div className="flex flex-col gap-0.5 w-full py-0 justify-center cursor-default">
                <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
                  <span className="font-semibold text-foreground font-mono">
                    {money(total)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isAllPaid
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : isUnpaid
                          ? "bg-transparent"
                          : "bg-emerald-600 dark:bg-emerald-500",
                    )}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            </Tooltip>
          );
        },
      },

      // 6. Còn phải thu (Highlight màu sắc như /invoice-debts)
      {
        key: "balanceAmount",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.remainingReceivable", "Còn phải thu")}
            columnKey="balanceAmount"
            sortState={getSortState("balanceAmount")}
            onSortChange={(s) => listHook.setSort("balanceAmount", s)}
            searchValue={listHook.columnSearch["balanceAmount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("balanceAmount", v)}
            selectedFilters={listHook.columnFilters["balanceAmount"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("balanceAmount", v)}
            isActive={Boolean(
              listHook.columnFilters["balanceAmount"]?.length ||
              listHook.columnSearch["balanceAmount"],
            )}
            enableSelectAllMatching={true}
            align="right"
          />
        ),
        size: 170,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const bal = Number(row.balanceAmount) || 0;
          return (
            <span
              className={cn(
                "font-semibold tabular-nums font-mono text-xs",
                bal === 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive font-bold",
              )}
            >
              {money(bal)}
            </span>
          );
        },
      },

      // 7. Nợ 0-30 ngày - Xanh lá Emerald
      {
        key: "aging0_30",
        className:
          "text-right bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-xs",
        headerClassName:
          "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold text-right justify-end",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.aging0_30", "0-30 ngày")}
            columnKey="aging0_30"
            sortState={getSortState("aging0_30")}
            onSortChange={(s) => listHook.setSort("aging0_30", s)}
            searchValue={listHook.columnSearch["aging0_30"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("aging0_30", v)}
            selectedFilters={listHook.columnFilters["aging0_30"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("aging0_30", v)}
            isActive={Boolean(
              listHook.columnFilters["aging0_30"]?.length ||
              listHook.columnSearch["aging0_30"],
            )}
            align="right"
          />
        ),
        size: 150,
        minSize: 135,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const val = Number(row.aging0_30) || 0;
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

      // 8. Nợ 31-60 ngày - Vàng Amber
      {
        key: "aging31_60",
        className:
          "text-right bg-amber-50/40 dark:bg-amber-950/20 font-mono text-xs",
        headerClassName:
          "bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-right justify-end",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.aging31_60", "31-60 ngày")}
            columnKey="aging31_60"
            sortState={getSortState("aging31_60")}
            onSortChange={(s) => listHook.setSort("aging31_60", s)}
            searchValue={listHook.columnSearch["aging31_60"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("aging31_60", v)}
            selectedFilters={listHook.columnFilters["aging31_60"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("aging31_60", v)}
            isActive={Boolean(
              listHook.columnFilters["aging31_60"]?.length ||
              listHook.columnSearch["aging31_60"],
            )}
            align="right"
          />
        ),
        size: 150,
        minSize: 135,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const val = Number(row.aging31_60) || 0;
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

      // 9. Nợ 61-90 ngày - Cam Orange
      {
        key: "aging61_90",
        className:
          "text-right bg-orange-50/40 dark:bg-orange-950/20 font-mono text-xs",
        headerClassName:
          "bg-orange-50/80 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-semibold text-right justify-end",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.aging61_90", "61-90 ngày")}
            columnKey="aging61_90"
            sortState={getSortState("aging61_90")}
            onSortChange={(s) => listHook.setSort("aging61_90", s)}
            searchValue={listHook.columnSearch["aging61_90"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("aging61_90", v)}
            selectedFilters={listHook.columnFilters["aging61_90"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("aging61_90", v)}
            isActive={Boolean(
              listHook.columnFilters["aging61_90"]?.length ||
              listHook.columnSearch["aging61_90"],
            )}
            align="right"
          />
        ),
        size: 150,
        minSize: 135,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const val = Number(row.aging61_90) || 0;
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

      // 10. Nợ >90 ngày - Đỏ Rose
      {
        key: "agingOver90",
        className:
          "text-right bg-rose-50/40 dark:bg-rose-950/20 font-mono text-xs",
        headerClassName:
          "bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold text-right justify-end",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.agingOver90", ">90 ngày")}
            columnKey="agingOver90"
            sortState={getSortState("agingOver90")}
            onSortChange={(s) => listHook.setSort("agingOver90", s)}
            searchValue={listHook.columnSearch["agingOver90"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("agingOver90", v)}
            selectedFilters={listHook.columnFilters["agingOver90"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("agingOver90", v)}
            isActive={Boolean(
              listHook.columnFilters["agingOver90"]?.length ||
              listHook.columnSearch["agingOver90"],
            )}
            align="right"
          />
        ),
        size: 155,
        minSize: 140,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const val = Number(row.agingOver90) || 0;
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

      // 11. Tuổi Nợ & Rủi Ro (Multi-Segment Stacked Progress Bar & Rich Tooltip)
      {
        key: "maxAgingDays",
        className: "text-left",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.maxAgingDays", "Tuổi nợ & Rủi ro")}
            columnKey="maxAgingDays"
            sortState={getSortState("maxAgingDays")}
            onSortChange={(s) => listHook.setSort("maxAgingDays", s)}
            searchValue={listHook.columnSearch["maxAgingDays"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("maxAgingDays", v)}
            selectedFilters={listHook.columnFilters["maxAgingDays"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("maxAgingDays", v)}
            isActive={Boolean(
              listHook.columnFilters["maxAgingDays"]?.length ||
              listHook.columnSearch["maxAgingDays"],
            )}
            enableSelectAllMatching={true}
            align="center"
            formatOptionLabel={(val: string) => {
              if (val === "0-30")
                return t("customers.filter.aging0_30", "0-30 ngày (Trong hạn)");
              if (val === "31-60")
                return t(
                  "customers.filter.aging31_60",
                  "31-60 ngày (Cần theo dõi)",
                );
              if (val === "61-90")
                return t("customers.filter.aging61_90", "61-90 ngày (Quá hạn)");
              if (val === ">90")
                return t("customers.filter.agingOver90", ">90 ngày (Quá hạn)");
              return val;
            }}
            fetchOptions={async ({ search }) => {
              const allItems = [
                {
                  label: t(
                    "customers.filter.aging0_30",
                    "0-30 ngày (Trong hạn)",
                  ),
                  value: "0-30",
                },
                {
                  label: t(
                    "customers.filter.aging31_60",
                    "31-60 ngày (Cần theo dõi)",
                  ),
                  value: "31-60",
                },
                {
                  label: t(
                    "customers.filter.aging61_90",
                    "61-90 ngày (Quá hạn)",
                  ),
                  value: "61-90",
                },
                {
                  label: t(
                    "customers.filter.agingOver90",
                    ">90 ngày (Quá hạn)",
                  ),
                  value: ">90",
                },
              ];
              const filtered = search
                ? allItems.filter((i) =>
                    i.label.toLowerCase().includes(search.toLowerCase()),
                  )
                : allItems;
              return {
                items: filtered,
                total: filtered.length,
                next: null,
              };
            }}
          />
        ),
        size: 210,
        minSize: 180,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const bal = Number(row.balanceAmount) || 0;
          const aging = row.maxAgingDays || 0;
          const a0_30 = Number(row.aging0_30) || 0;
          const a31_60 = Number(row.aging31_60) || 0;
          const a61_90 = Number(row.aging61_90) || 0;
          const aOver90 = Number(row.agingOver90) || 0;

          if (bal <= 0) {
            return (
              <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
                <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                  <span className="font-mono text-xs text-muted-foreground/60">
                    0 ngày
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-sans border font-normal bg-slate-50 dark:bg-slate-800/40 text-muted-foreground/70 border-slate-200/60 dark:border-slate-700/40">
                    {t("customers.filter.paid", "Đã tất toán")}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden" />
              </div>
            );
          }

          const p0_30 = bal > 0 ? (a0_30 / bal) * 100 : 0;
          const p31_60 = bal > 0 ? (a31_60 / bal) * 100 : 0;
          const p61_90 = bal > 0 ? (a61_90 / bal) * 100 : 0;
          const pOver90 = bal > 0 ? (aOver90 / bal) * 100 : 0;

          const activeBuckets = [a0_30, a31_60, a61_90, aOver90].filter(
            (v) => v > 0,
          ).length;

          let badgeLabel = "0-30 ngày";
          let badgeCls =
            "bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40";
          let mainText = `${aging} ngày`;
          let mainTextCls =
            "text-emerald-700 dark:text-emerald-400 font-medium";

          if (activeBuckets > 1) {
            mainText = `Max ${aging}d`;
            if (aOver90 > 0) {
              badgeLabel = "Đa tầng (>90d)";
              badgeCls =
                "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50";
              mainTextCls = "text-rose-700 dark:text-rose-400 font-bold";
            } else if (a61_90 > 0) {
              badgeLabel = "Đa tầng (61-90d)";
              badgeCls =
                "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50";
              mainTextCls =
                "text-orange-700 dark:text-orange-400 font-semibold";
            } else {
              badgeLabel = "Đa tầng (0-60d)";
              badgeCls =
                "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40";
              mainTextCls = "text-amber-800 dark:text-amber-300 font-semibold";
            }
          } else {
            if (aOver90 > 0 || aging > 90) {
              badgeLabel = ">90 ngày";
              badgeCls =
                "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50";
              mainTextCls = "text-rose-700 dark:text-rose-400 font-bold";
            } else if (a61_90 > 0 || (aging > 60 && aging <= 90)) {
              badgeLabel = "61-90 ngày";
              badgeCls =
                "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50";
              mainTextCls =
                "text-orange-700 dark:text-orange-400 font-semibold";
            } else if (a31_60 > 0 || (aging > 30 && aging <= 60)) {
              badgeLabel = "31-60 ngày";
              badgeCls =
                "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40";
              mainTextCls = "text-amber-800 dark:text-amber-300 font-semibold";
            }
          }

          const tooltipContent = (
            <div className="flex flex-col gap-2 p-1 text-xs min-w-[260px]">
              <div className="font-semibold text-foreground border-b border-border/50 pb-1 flex justify-between items-center">
                <span>Cơ cấu phân tầng tuổi nợ</span>
                <span className="text-[11px] font-mono font-normal text-muted-foreground">
                  Tổng nợ: {money(bal)}
                </span>
              </div>
              <div className="space-y-1.5 tabular-nums">
                {a0_30 > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                      0-30 ngày (Trong hạn):
                    </span>
                    <span className="font-mono font-medium">
                      {money(a0_30)} • {Math.round(p0_30)}%
                    </span>
                  </div>
                )}
                {a31_60 > 0 && (
                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
                      31-60 ngày (Cần theo dõi):
                    </span>
                    <span className="font-mono font-medium">
                      {money(a31_60)} • {Math.round(p31_60)}%
                    </span>
                  </div>
                )}
                {a61_90 > 0 && (
                  <div className="flex justify-between items-center text-orange-700 dark:text-orange-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shrink-0" />
                      61-90 ngày (Quá hạn):
                    </span>
                    <span className="font-mono font-medium">
                      {money(a61_90)} • {Math.round(p61_90)}%
                    </span>
                  </div>
                )}
                {aOver90 > 0 && (
                  <div className="flex justify-between items-center text-rose-700 dark:text-rose-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
                      &gt;90 ngày (Quá hạn nặng):
                    </span>
                    <span className="font-mono font-bold">
                      {money(aOver90)} • {Math.round(pOver90)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-1 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between">
                <span>
                  Tuổi nợ max: <b>{aging} ngày</b>
                </span>
              </div>
            </div>
          );

          return (
            <Tooltip content={tooltipContent}>
              <div className="flex flex-col gap-1.5 w-full py-1 justify-center cursor-pointer group">
                <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                  <span className={cn("font-mono text-xs", mainTextCls)}>
                    {mainText}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-sans shrink-0 border leading-none font-medium",
                      badgeCls,
                    )}
                  >
                    {badgeLabel}
                  </span>
                </div>
                {/* Multi-Segment Stacked Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                  {p0_30 > 0 && (
                    <div
                      className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                      style={{ width: `${p0_30}%` }}
                    />
                  )}
                  {p31_60 > 0 && (
                    <div
                      className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-300"
                      style={{ width: `${p31_60}%` }}
                    />
                  )}
                  {p61_90 > 0 && (
                    <div
                      className="h-full bg-orange-500 dark:bg-orange-400 transition-all duration-300"
                      style={{ width: `${p61_90}%` }}
                    />
                  )}
                  {pOver90 > 0 && (
                    <div
                      className="h-full bg-rose-500 dark:bg-rose-400 transition-all duration-300"
                      style={{ width: `${pOver90}%` }}
                    />
                  )}
                </div>
              </div>
            </Tooltip>
          );
        },
      },

      // 12. Ngày Phát Sinh Gần Nhất
      {
        key: "latestDate",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.latestDate", "Ngày gần nhất")}
            sortState={getSortState("latestDate")}
            onSortChange={(s) => listHook.setSort("latestDate", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(listHook.dateFrom || listHook.dateTo)}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={listHook.dateFrom || ""}
                dateTo={listHook.dateTo || ""}
                onChange={(from, to) => listHook.setDateRange(from, to)}
                onClose={close}
              />
            )}
          />
        ),
        size: 140,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <TableDateCell
            date={row.latestDate || ""}
            format="date"
            className="justify-end w-full"
          />
        ),
      },

      // 13. Chi Nhánh
      {
        key: "branchName",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.branchName", "Chi nhánh")}
            columnKey="branchName"
            queryKeyPrefix="garage-customer-branch-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getCustomersDebtColumnOptions(
                selectedBranchId || undefined,
                "branchName",
                search,
                pageParam,
                20,
                filtersStr,
              );
              return {
                items: res.items.map((it: string) => {
                  const b = branches?.find((br: any) => br.externalId === it);
                  return {
                    label: b?.name || it,
                    value: it,
                  };
                }),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            formatOptionLabel={(val: string) => {
              const b = branches?.find((br: any) => br.externalId === val);
              return b?.name || val;
            }}
            sortState={getSortState("branchName")}
            onSortChange={(s) => listHook.setSort("branchName", s)}
            searchValue={listHook.columnSearch["branchName"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("branchName", v)}
            selectedFilters={listHook.columnFilters["branchName"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("branchName", v)}
            isActive={Boolean(
              listHook.columnFilters["branchName"]?.length ||
              listHook.columnSearch["branchName"],
            )}
            enableSelectAllMatching={true}
            showBlankOption={true}
            align="center"
          />
        ),
        size: 180,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const b = branches?.find(
            (br: any) => br.externalId === row.branchExternalId,
          );
          return (
            <span className="truncate text-muted-foreground text-xs font-medium">
              {b?.name || row.branchExternalId || "—"}
            </span>
          );
        },
      },
    ],
    [
      listHook.sorts,
      listHook.columnFilters,
      listHook.columnSearch,
      listHook.dateFrom,
      listHook.dateTo,
      selectedBranchId,
      branches,
      t,
    ],
  );

  // Subtotal Summary Row With SubtotalSummaryCell Popovers
  const summaryRow = useMemo(() => {
    const items = listHook.data;
    if (!items || items.length === 0) return undefined;

    let subtotalCases = 0;
    let subtotalRev = 0;
    let subtotalBal = 0;
    let subtotalA0_30 = 0;
    let subtotalA31_60 = 0;
    let subtotalA61_90 = 0;
    let subtotalAOver90 = 0;

    for (const row of items) {
      subtotalCases += Number(row.caseCount) || 0;
      subtotalRev += Number(row.totalAmount) || 0;
      subtotalBal += Number(row.balanceAmount) || 0;
      subtotalA0_30 += Number(row.aging0_30) || 0;
      subtotalA31_60 += Number(row.aging31_60) || 0;
      subtotalA61_90 += Number(row.aging61_90) || 0;
      subtotalAOver90 += Number(row.agingOver90) || 0;
    }

    const cumCount = (listHook.page - 1) * listHook.pageSize + items.length;

    return {
      customerName: (
        <SubtotalSummaryCell
          variantType="label"
          label={`${t("common:total", "Tổng cộng")}:`}
          page={listHook.page}
          totalPages={listHook.totalPages}
          totalCount={listHook.total}
          currentPageCount={items.length}
          cumulativeCount={cumCount}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
        />
      ),
      caseCount: (
        <SubtotalSummaryCell
          variantType="qty"
          metricTitle={t("customers.columns.caseCount", "Số lượng phiếu DV")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalQty={subtotalCases}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="text-primary font-bold"
        />
      ),
      paymentProgress: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.columns.totalReceivable", "Tổng phải thu")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalAmount={subtotalRev}
          grandTotalAmount={listHook.summary.totalRevenue}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="text-foreground font-bold"
        />
      ),
      balanceAmount: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t(
            "customers.columns.remainingReceivable",
            "Còn phải thu",
          )}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalAmount={subtotalBal}
          grandTotalAmount={listHook.summary.totalBalance}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName={
            subtotalBal === 0
              ? "font-bold text-emerald-600 dark:text-emerald-400"
              : "font-bold text-destructive"
          }
        />
      ),
      aging0_30: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.columns.aging0_30", "0-30 ngày")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalAmount={subtotalA0_30}
          grandTotalAmount={listHook.summary.totalAging0_30}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-emerald-700 dark:text-emerald-400"
        />
      ),
      aging31_60: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.columns.aging31_60", "31-60 ngày")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalAmount={subtotalA31_60}
          grandTotalAmount={listHook.summary.totalAging31_60}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-amber-800 dark:text-amber-300"
        />
      ),
      aging61_90: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.columns.aging61_90", "61-90 ngày")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalAmount={subtotalA61_90}
          grandTotalAmount={listHook.summary.totalAging61_90}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-orange-700 dark:text-orange-400"
        />
      ),
      agingOver90: (
        <SubtotalSummaryCell
          variantType="amount"
          metricTitle={t("customers.columns.agingOver90", ">90 ngày")}
          itemTitle={t("partners.unitPartner", "Khách hàng")}
          itemUnit={t("partners.unitPartner", "khách hàng")}
          subtotalAmount={subtotalAOver90}
          grandTotalAmount={listHook.summary.totalAgingOver90}
          page={listHook.page}
          totalPages={listHook.totalPages}
          currentPageCount={items.length}
          totalCount={listHook.total}
          valueClassName="font-bold text-rose-700 dark:text-rose-400"
        />
      ),
    };
  }, [
    listHook.data,
    listHook.page,
    listHook.pageSize,
    listHook.total,
    listHook.totalPages,
    listHook.summary,
    t,
  ]);

  return (
    <>
      <SpreadsheetPageTemplate<CustomerDebtItem>
        title={t("partners.title", "Công nợ garage")}
        desc={t(
          "partners.desc",
          "Theo dõi, đối soát và phân tích tổng hợp công nợ phải thu, tuổi nợ và danh sách phiếu dịch vụ theo từng khách hàng Garage (Dữ liệu công nợ ghi nhận từ tháng 07/2026)",
        )}
        icon={<Users className="w-5 h-5 text-primary" />}
        tabs={pageTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tableId="garage-debts-table"
        createActions={createActions}
        items={listHook.data}
        columns={columns}
        getRowKey={(row) =>
          `${row.customerCode}_${row.branchExternalId || "all"}`
        }
        loading={listHook.isLoading}
        emptyLabel={t("customers.empty", "Không có dữ liệu khách hàng")}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p) => listHook.setPage(p)}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={() => listHook.refetch()}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        rowActions={(row: CustomerDebtItem) => [
          {
            groupLabel: "TRA CỨU",
            items: [
              {
                label: t("customers.viewDetail", "Xem chi tiết công nợ"),
                icon: <Eye className="w-4 h-4" />,
                onClick: () =>
                  setSelectedCustomer({
                    code: row.customerCode,
                    name: row.customerName,
                  }),
              },
            ],
          },
        ]}
        summaryRow={summaryRow}
      />

      {/* Customer Detail Drawer */}
      <GarageCustomerDetailDrawer
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customerCode={selectedCustomer?.code || null}
        customerName={selectedCustomer?.name}
        branchId={selectedBranchId || undefined}
      />
    </>
  );
}

export default GarageDebts;
