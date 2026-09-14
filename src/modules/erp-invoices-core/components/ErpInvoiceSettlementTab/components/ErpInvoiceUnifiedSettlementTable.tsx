import React, { useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Landmark, Sparkles, Eye, Trash2, RotateCcw } from "lucide-react";
import { StandardTable } from "@/shared/components/StandardTable";
import { DrawerSection } from "@/shared/components/DrawerModal";
import {
  type DataTableColumn,
  createColumnHeaderFilter,
  TableColumnAlign,
} from "@/shared/components/DataTable";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { FilterButton } from "@/shared/components/FilterPanel";
import { money } from "@/shared/utils/format";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { NetOffInput } from "../../VoucherNetoffSelectionModal/components/NetOffInput";
import { useErpInvoiceSettlement } from "../context/ErpInvoiceSettlementContext";

export function ErpInvoiceUnifiedSettlementTable() {
  const { t } = useTranslation(["erpInvoices", "common"]);
  const ctx = useErpInvoiceSettlement();

  // ── 1. Map danh sách dữ liệu theo View Preset ──
  const { displayItems, totalCount, totalPages, isCurrentPaginated } =
    useMemo(() => {
      if (ctx.viewPreset === "suggestions") {
        const items = ctx.filteredSuggestions.map((s) => ({
          ...s.txn,
          isSuggestion: true,
          matchScore: s.score?.badge || s.confidence || "PERFECT",
          matchedKeywords: s.matchedKeywords || [],
        }));
        return {
          displayItems: items,
          totalCount: items.length,
          totalPages: 1,
          isCurrentPaginated: false,
        };
      }

      if (ctx.viewPreset === "selected") {
        const items = ctx.selectedVouchersList.map((s) => ({
          ...s.txn,
          isSelectedRow: true,
        }));
        return {
          displayItems: items,
          totalCount: items.length,
          totalPages: 1,
          isCurrentPaginated: false,
        };
      }

      if (ctx.viewPreset === "linked") {
        const items = ctx.activeVouchers.map((v) => ({
          id: v.bankTransactionId || v.id,
          bankTransactionId: v.bankTransactionId,
          transDate: v.transDate,
          referenceNumber: v.refNo,
          partnerName: v.partnerName,
          description: v.description,
          bankName: v.bankName,
          creditAmount: ctx.direction === "OUT" ? v.amount : 0,
          debitAmount: ctx.direction === "IN" ? v.amount : 0,
          netOffAmount: v.amount,
          isLinked: true,
          isPending: v.isPending,
          voucherItem: v,
        }));
        return {
          displayItems: items,
          totalCount: items.length,
          totalPages: 1,
          isCurrentPaginated: false,
        };
      }

      // Default "all"
      return {
        displayItems: ctx.vouchers,
        totalCount: ctx.totalVouchers,
        totalPages: ctx.totalPages,
        isCurrentPaginated: true,
      };
    }, [
      ctx.viewPreset,
      ctx.filteredSuggestions,
      ctx.selectedVouchersList,
      ctx.activeVouchers,
      ctx.vouchers,
      ctx.totalVouchers,
      ctx.totalPages,
      ctx.direction,
    ]);

  // ── 2. Header Filter Handler ──
  const listHook = useMemo(
    () => ({
      ...ctx.tableState,
      dateFrom: ctx.dateFrom,
      dateTo: ctx.dateTo,
      setDateRange: (from?: string, to?: string) => {
        ctx.setDateFrom(from || "");
        ctx.setDateTo(to || "");
        ctx.setPage(1);
      },
      setSort: (key: string, state: any) => {
        ctx.tableState.setSort(key, state);
        ctx.setPage(1);
      },
      setColumnFilter: (key: string, vals: string[]) => {
        ctx.tableState.setColumnFilter(key, vals);
        ctx.setPage(1);
      },
      setColumnSearch: (key: string, val: string) => {
        ctx.tableState.setColumnSearch(key, val);
        ctx.setPage(1);
      },
    }),
    [ctx],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: "unified-settlement-bank-column-options",
        fetchOptions: ({
          columnKey,
          search,
          pageParam,
          pageSize: optPageSize,
          filtersStr,
        }) =>
          bankStatementApi.getColumnOptions(
            columnKey,
            search,
            pageParam,
            optPageSize || 20,
            filtersStr,
          ),
      }),
    [listHook],
  );

  // ── 3. Columns Definition ──
  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "selection",
        header: "",
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (row) => {
          const isLinked = ctx.activeVouchers.some(
            (v) => v.bankTransactionId === row.id,
          );
          if (isLinked) {
            return (
              <div className="flex items-center justify-center">
                <span
                  title={t("alreadyLinkedTooltip", "Đã cấn trừ vào hóa đơn")}
                  className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                />
              </div>
            );
          }
          return (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={ctx.selectedIds.includes(row.id)}
                onCheckedChange={() => {
                  if (!ctx.editMode && ctx.onStartEdit) {
                    ctx.onStartEdit();
                  }
                  ctx.handleToggleRow(row);
                }}
              />
            </div>
          );
        },
      },
      {
        key: "stt",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (_, idx) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {idx}
          </span>
        ),
      },
      {
        key: "statusTag",
        header: t("colStatusTag", "Trạng thái / Gợi ý"),
        size: 155,
        enableResizing: true,
        cell: (row) => {
          const linkedVoucher = ctx.activeVouchers.find(
            (v) => v.bankTransactionId === row.id,
          );
          if (linkedVoucher || row.isLinked) {
            return linkedVoucher?.isPending || row.isPending ? (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300"
              >
                {t("pendingSaveBadge", "Chờ lưu")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300"
              >
                {t("linkedBadge", "✓ Đã cấn trừ")}
              </Badge>
            );
          }

          const suggestion = ctx.filteredSuggestions.find(
            (s) => s.txn.id === row.id,
          );
          if (suggestion || row.isSuggestion) {
            const keywords =
              suggestion?.matchedKeywords || row.matchedKeywords || [];
            const hint =
              keywords.length > 0 ? keywords.join(", ") : "Khớp số liệu";
            return (
              <Tooltip
                content={t("matchReason", "Lý do gợi ý: {{hint}}", { hint })}
              >
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 cursor-help"
                >
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-slate-600 dark:text-slate-400" />
                  {t("suggestedBadge", "Gợi ý khớp")}
                </Badge>
              </Tooltip>
            );
          }

          if (ctx.selectedIds.includes(row.id)) {
            return (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
              >
                {t("selectedBadge", "Đang chọn")}
              </Badge>
            );
          }

          return (
            <span className="text-muted-foreground text-xs font-mono">—</span>
          );
        },
      },
      {
        key: "source",
        header: headerFilter("source", t("colSource", "Nguồn / Tài khoản"), {
          align: TableColumnAlign.LEFT,
        }),
        size: 140,
        enableResizing: true,
        cell: (row) => (
          <div className="flex flex-col text-xs leading-tight">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.bankName ||
                  row.bankName ||
                  t("sourceBank", "Ngân hàng")
                : row.cashBook?.name || t("sourceCash", "Sổ quỹ")}
            </span>
            <span className="text-[10.5px] text-muted-foreground font-mono truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.accountNumber || row.accountNumber || ""
                : t("cash", "Tiền mặt")}
            </span>
          </div>
        ),
      },
      {
        key: "transDate",
        header: headerFilter.date("transDate", t("colTransDate", "Ngày GD"), {
          align: "center",
          className: "w-full justify-center",
        }),
        size: 100,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-center font-mono text-xs text-slate-600 dark:text-slate-400",
        cell: (row) =>
          row.transDate ? format(new Date(row.transDate), "dd/MM/yyyy") : "—",
      },
      {
        key: "referenceNumber",
        header: headerFilter("referenceNumber", t("colRef", "Tham chiếu"), {
          align: TableColumnAlign.LEFT,
          showBlankOption: true,
        }),
        size: 170,
        enableResizing: true,
        cell: (row) =>
          row.referenceNumber ? (
            <Tooltip
              content={t("tooltipRef", {
                ref: row.referenceNumber,
                defaultValue: `Số tham chiếu: ${row.referenceNumber}`,
              })}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  ctx.setDetailTxnId(row.id);
                }}
                className="font-mono font-semibold text-primary hover:underline cursor-pointer text-xs truncate max-w-full block text-left"
              >
                {row.referenceNumber}
              </button>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          ),
      },
      {
        key: "partnerName",
        header: headerFilter("partnerName", t("colPartner", "Đối tác"), {
          align: TableColumnAlign.LEFT,
          showBlankOption: true,
        }),
        size: 180,
        enableResizing: true,
        cell: (row) => {
          const name = row.partnerName || row.correspondentName;
          return name ? (
            <Tooltip content={name}>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-full">
                {name}
              </div>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
        },
      },
      {
        key: "description",
        header: headerFilter("description", t("colDescription", "Nội dung"), {
          align: TableColumnAlign.LEFT,
          showBlankOption: true,
        }),
        size: 260,
        enableResizing: true,
        cell: (row) => (
          <Tooltip content={row.description || "—"}>
            <div className="text-xs text-slate-600 dark:text-slate-300 truncate cursor-default max-w-full">
              {row.description || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "originalAmount",
        header: headerFilter.amount(
          "creditAmount",
          t("colOriginalAmount", "Số tiền gốc"),
          {
            align: TableColumnAlign.RIGHT,
          },
        ),
        size: 135,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const debit = parseFloat(row.debitAmount) || 0;
          const credit = parseFloat(row.creditAmount) || 0;
          const isDebit = debit > 0;
          const amount = isDebit ? debit : credit;

          return (
            <div className="flex flex-col items-end leading-tight gap-0.5">
              <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                {isDebit ? "-" : "+"}
                {money(amount)}
              </span>
              <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                {isDebit ? t("natureDebit", "Chi") : t("natureCredit", "Thu")}
              </span>
            </div>
          );
        },
      },
      {
        key: "thisNetOff",
        header: t("colThisNetOff", "Cấn trừ đợt này"),
        size: 155,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const isSelected = ctx.selectedIds.includes(row.id);
          const linkedVoucher = ctx.activeVouchers.find(
            (v) => v.bankTransactionId === row.id,
          );

          if (isSelected) {
            const netOffVal =
              ctx.netOffAmounts[row.id] !== undefined
                ? ctx.netOffAmounts[row.id]
                : 0;
            const maxVal = ctx.maxAmounts[row.id] || 0;

            if (!ctx.editMode) {
              return (
                <span className="font-mono font-bold text-xs text-primary">
                  {money(netOffVal)}
                </span>
              );
            }

            return (
              <div className="w-full">
                <NetOffInput
                  initialValue={netOffVal}
                  maxAmount={maxVal}
                  onChange={(val) => ctx.handleAmountChange(row, val)}
                />
              </div>
            );
          }

          if (linkedVoucher || row.isLinked) {
            const val = linkedVoucher?.amount || row.netOffAmount || 0;
            return (
              <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                {money(val)}
              </span>
            );
          }

          return (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          );
        },
      },
      {
        key: "actions",
        header: "",
        size: 65,
        headerClassName: "text-center",
        className: "text-center",
        enableResizing: false,
        cell: (row) => {
          const linkedVoucher = ctx.activeVouchers.find(
            (v) => v.bankTransactionId === row.id,
          );
          const isSelected = ctx.selectedIds.includes(row.id);

          return (
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  ctx.setDetailTxnId(row.id);
                }}
                title={t("tooltipDetail", "Xem chi tiết giao dịch")}
                className="p-1 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {(linkedVoucher || row.isLinked) && ctx.editMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const itemToUnlink = linkedVoucher || row.voucherItem;
                    if (itemToUnlink) {
                      void ctx.handleUnlinkVoucher(itemToUnlink);
                    }
                  }}
                  title={t("tooltipUnlink", "Gỡ cấn trừ giao dịch này")}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {isSelected && !linkedVoucher && ctx.editMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    ctx.handleUnselectItem(row.id);
                  }}
                  title={t("tooltipRemoveSelect", "Bỏ chọn giao dịch này")}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [ctx, headerFilter, t],
  );

  return (
    <DrawerSection
      title={
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          <Landmark className="w-4 h-4 text-muted-foreground" />
          <span>{t("vouchersList", "Danh sách giao dịch sao kê")}</span>
          {totalCount !== undefined && (
            <span className="text-xs font-normal text-muted-foreground lowercase">
              ({totalCount} {t("records", "giao dịch")})
            </span>
          )}
        </div>
      }
      titleExtra={
        <div className="flex items-center gap-2">
          {ctx.viewPreset === "suggestions" &&
            ctx.filteredSuggestions.length >= 2 &&
            ctx.editMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={ctx.handleSelectAllFilteredSuggestions}
                className="h-6 text-[11px] px-2 gap-1 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              >
                <Sparkles className="w-2.5 h-2.5 text-slate-600 dark:text-slate-400" />
                {t("selectAllSuggestions", "Chọn tất cả gợi ý ({{count}})", {
                  count: ctx.filteredSuggestions.length,
                })}
              </Button>
            )}

          {ctx.tableState.activeFilterCount +
            (ctx.dateFrom || ctx.dateTo ? 1 : 0) >
            0 && (
            <FilterButton
              activeCount={
                ctx.tableState.activeFilterCount +
                (ctx.dateFrom || ctx.dateTo ? 1 : 0)
              }
              onClick={() => {}}
              onClear={() => {
                ctx.tableState.resetFilters();
                ctx.setDateFrom("");
                ctx.setDateTo("");
                ctx.setPage(1);
              }}
            />
          )}
        </div>
      }
      collapsible={true}
      defaultCollapsed={false}
      className="p-3 mb-0 border border-slate-200/80 dark:border-slate-800"
      bodyClassName="p-0"
    >
      <div className="h-[calc(100vh-310px)] min-h-[360px] flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        <StandardTable
          tableId="invoice-unified-settlement-table"
          items={displayItems}
          columns={columns}
          getRowKey={(row: any) => row.id}
          variant="spreadsheet"
          enableColumnResizing={true}
          loading={ctx.isLoadingVouchers && ctx.viewPreset === "all"}
          page={isCurrentPaginated ? ctx.page : 1}
          pageSize={
            isCurrentPaginated ? ctx.pageSize : displayItems.length || 50
          }
          total={totalCount}
          totalPages={totalPages}
          onPage={isCurrentPaginated ? ctx.setPage : undefined}
          onPageSize={isCurrentPaginated ? ctx.setPageSize : undefined}
          minWidth={1200}
          containerClassName="flex-1 min-h-0"
        />
      </div>
    </DrawerSection>
  );
}
