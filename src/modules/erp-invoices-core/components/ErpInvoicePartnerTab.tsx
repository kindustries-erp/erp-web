import React, { useMemo, useCallback, useState } from "react";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Copy,
  Check,
  FileText,
  TrendingUp,
  CreditCard,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { erpInvoiceDashboardApi } from "../api/erpInvoiceDashboardApi";
import { erpInvoicesCoreApi } from "../api/erpInvoicesCoreApi";
import { useErpInvoicesList } from "../hooks/useErpInvoicesList";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableText } from "@/shared/components/DataTable/TableText";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { VietnamInvoiceTemplate } from "./VietnamInvoiceTemplate";
import { DrawerModal } from "@/shared/components/DrawerModal";

export interface ErpInvoicePartnerTabProps {
  detailInvoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
}

export const ErpInvoicePartnerTab = React.memo(function ErpInvoicePartnerTab({
  detailInvoice,
  direction,
}: ErpInvoicePartnerTabProps) {
  const { t } = useTranslation("erpInvoices");
  const [copiedTax, setCopiedTax] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [previewSubInvoice, setPreviewSubInvoice] = useState<ErpInvoice | null>(
    null,
  );

  const isDirectionIn = (direction || detailInvoice?.direction) === "IN";
  const partnerName =
    (isDirectionIn
      ? detailInvoice?.sellerName
      : detailInvoice?.buyerName || detailInvoice?.buyerPersonalName
    )?.trim() || "";

  const taxCode =
    (isDirectionIn
      ? detailInvoice?.sellerTaxCode
      : detailInvoice?.buyerTaxCode || detailInvoice?.buyerCccd
    )?.trim() || "";

  const address =
    (isDirectionIn
      ? detailInvoice?.sellerAddress
      : detailInvoice?.buyerAddress
    )?.trim() || "";

  const bank = isDirectionIn ? detailInvoice?.sellerBank?.trim() : "";

  // Query stats data
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["partner-invoice-stats", taxCode],
    queryFn: () => erpInvoiceDashboardApi.getPartnerStats(taxCode),
    enabled: !!taxCode,
  });

  // Query invoice list for this partner
  const listHook = useErpInvoicesList("ALL", taxCode);

  React.useEffect(() => {
    if (taxCode) {
      listHook.setPage(1);
      void listHook.loadInvoices();
    }
  }, [taxCode]);

  const copyToClipboard = (
    text: string,
    isTax: boolean,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    if (isTax) {
      setCopiedTax(true);
      toast.success(t("copiedTax", "Đã copy MST"), { id: "partner-tax-copy" });
      setTimeout(() => setCopiedTax(false), 1500);
    } else {
      setCopiedName(true);
      toast.success(t("copiedName", "Đã copy tên đối tác"), {
        id: "partner-name-copy",
      });
      setTimeout(() => setCopiedName(false), 1500);
    }
  };

  const barIn = "#ea580c"; // Orange 600 (Đầu vào - Chi phí)
  const barOut = "#059669"; // Emerald 600 (Đầu ra - Doanh thu)

  const cashTrendLabels = statsData?.cashTrend?.map((t) => t.label) || [];
  const cashTrendIn = statsData?.cashTrend?.map((t) => t.cashOut) || [];
  const cashTrendOut = statsData?.cashTrend?.map((t) => t.cashIn) || [];

  const getSortState = (key: string) => {
    if (listHook.tableState.sorts.includes(key)) return "asc";
    if (listHook.tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    listHook.tableState.setSort(key, state);
    listHook.setPage(1);
  };
  const handleSearchChange = (key: string, val: string) => {
    listHook.tableState.setColumnSearch(key, val);
    listHook.setPage(1);
  };
  const handleFilterChange = (key: string, vals: string[]) => {
    listHook.tableState.setColumnFilter(key, vals);
    listHook.setPage(1);
  };

  const fetchInvoiceOptions = useCallback(
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
      let currentFilters: Record<string, string[]> = {};
      if (filtersStr) {
        try {
          currentFilters = JSON.parse(filtersStr);
        } catch {
          // ignore parse error
        }
      }
      if (taxCode) {
        currentFilters["taxCode"] = [taxCode];
      }
      const newFiltersStr = JSON.stringify(currentFilters);

      const res = await erpInvoicesCoreApi.getInvoiceColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        newFiltersStr,
        undefined,
      );
      return {
        items: res.items.map((i: any) => {
          const valStr =
            typeof i === "object" ? String(i.value || i.id || i) : String(i);
          const labelStr =
            typeof i === "object"
              ? String(i.label || i.name || valStr)
              : String(i);
          if (columnKey === "invoiceDate" && valStr) {
            const dateVal = valStr.substring(0, 10);
            try {
              const parsed = new Date(dateVal);
              const label = isValid(parsed)
                ? format(parsed, "dd-MM-yyyy")
                : dateVal;
              return { label, value: dateVal };
            } catch {
              return { label: valStr, value: valStr };
            }
          }
          return { label: labelStr, value: valStr };
        }),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [taxCode],
  );

  const columns = useMemo(() => {
    return [
      {
        key: "direction",
        header: t("type", "Loại HĐ"),
        size: 85,
        className: "text-center",
        cell: (inv: ErpInvoice) => (
          <span
            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
              inv.direction === "IN"
                ? "bg-orange-100/80 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300"
                : "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
            }`}
          >
            {inv.direction === "IN"
              ? t("dirIn", "Đầu vào")
              : t("dirOut", "Đầu ra")}
          </span>
        ),
      },
      {
        key: "invoiceDate",
        header: (
          <TableColumnHeaderFilter
            title={t("invoiceDate", "Ngày HĐ")}
            sortState={getSortState("invoiceDate")}
            onSortChange={(state) => handleSortChange("invoiceDate", state)}
            searchValue={listHook.tableState.columnSearch["invoiceDate"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceDate", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceDate"] || []
            }
            onFilterChange={(vals) => handleFilterChange("invoiceDate", vals)}
            align="center"
            columnKey="invoiceDate"
            hideFilter={true}
            hideFooter={true}
            dateRangeSlot={({ close }) => {
              const val = listHook.tableState.columnSearch["invoiceDate"] || "";
              const [from = "", to = ""] = val.split("|");
              return (
                <DateRangeColumnSlot
                  dateFrom={from}
                  dateTo={to}
                  onChange={(f, t) => {
                    const next = f || t ? `${f}|${t}` : "";
                    handleSearchChange("invoiceDate", next);
                  }}
                  onClose={close}
                />
              );
            }}
          />
        ),
        size: 105,
        className: "text-right font-medium",
        cell: (inv: ErpInvoice) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd/MM/yyyy")
            : "—",
      },
      {
        key: "serialNo",
        header: (
          <TableColumnHeaderFilter
            title={t("serialNo", "Ký hiệu")}
            sortState={getSortState("serialNo")}
            onSortChange={(state) => handleSortChange("serialNo", state)}
            searchValue={listHook.tableState.columnSearch["serialNo"] || ""}
            onSearchChange={(val) => handleSearchChange("serialNo", val)}
            selectedFilters={
              listHook.tableState.columnFilters["serialNo"] || []
            }
            onFilterChange={(vals) => handleFilterChange("serialNo", vals)}
            align="center"
            columnKey="serialNo"
            queryKeyPrefix={`partner-invoice-options-serial-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 100,
        className: "text-left text-muted-foreground",
        cell: (inv: ErpInvoice) => inv.serialNo || "—",
      },
      {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title={t("invoiceNo", "Số HĐ")}
            sortState={getSortState("invoiceNo")}
            onSortChange={(state) => handleSortChange("invoiceNo", state)}
            searchValue={listHook.tableState.columnSearch["invoiceNo"] || ""}
            onSearchChange={(val) => handleSearchChange("invoiceNo", val)}
            selectedFilters={
              listHook.tableState.columnFilters["invoiceNo"] || []
            }
            onFilterChange={(vals) => handleFilterChange("invoiceNo", vals)}
            align="center"
            columnKey="invoiceNo"
            queryKeyPrefix={`partner-invoice-options-invno-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 140,
        cell: (inv: ErpInvoice) => (
          <TableText
            text={inv.invoiceNo || "—"}
            enableCopy={Boolean(inv.invoiceNo)}
            onDetailClick={() => setPreviewSubInvoice(inv)}
          />
        ),
      },
      {
        key: "totalAmount",
        header: (
          <TableColumnHeaderFilter
            title={t("totalAmount", "Tổng tiền")}
            sortState={getSortState("totalAmount")}
            onSortChange={(state) => handleSortChange("totalAmount", state)}
            searchValue={listHook.tableState.columnSearch["totalAmount"] || ""}
            onSearchChange={(val) => handleSearchChange("totalAmount", val)}
            selectedFilters={
              listHook.tableState.columnFilters["totalAmount"] || []
            }
            onFilterChange={(vals) => handleFilterChange("totalAmount", vals)}
            align="center"
            columnKey="totalAmount"
            queryKeyPrefix={`partner-invoice-options-amt-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 130,
        className: "text-right font-semibold tabular-nums",
        cell: (inv: ErpInvoice) => money(inv.totalAmount || 0),
      },
      {
        key: "status",
        header: (
          <TableColumnHeaderFilter
            title={t("status", "Trạng thái")}
            sortState={getSortState("status")}
            onSortChange={(state) => handleSortChange("status", state)}
            searchValue={listHook.tableState.columnSearch["status"] || ""}
            onSearchChange={(val) => handleSearchChange("status", val)}
            selectedFilters={listHook.tableState.columnFilters["status"] || []}
            onFilterChange={(vals) => handleFilterChange("status", vals)}
            align="center"
            columnKey="status"
            queryKeyPrefix={`partner-invoice-options-status-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={async () => ({
              items: [
                { value: "DRAFT", label: t("statusDraft", "Nháp") },
                {
                  value: "CONFIRMED",
                  label: t("statusConfirmed", "Đã xác nhận"),
                },
                { value: "CANCELLED", label: t("statusCancelled", "Đã hủy") },
              ],
              total: 3,
              next: null,
            })}
          />
        ),
        size: 110,
        className: "text-center",
        cell: (inv: ErpInvoice) => (
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium leading-tight ${
              inv.status === "CANCELLED"
                ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                : inv.status === "DRAFT"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
            }`}
          >
            {inv.status === "CANCELLED"
              ? t("statusCancelled", "Đã hủy")
              : inv.status === "DRAFT"
                ? t("statusDraft", "Nháp")
                : t("statusConfirmed", "Đã xác nhận")}
          </span>
        ),
      },
      {
        key: "description",
        header: (
          <TableColumnHeaderFilter
            title={t("description", "Diễn giải")}
            sortState={getSortState("description")}
            onSortChange={(state) => handleSortChange("description", state)}
            searchValue={listHook.tableState.columnSearch["description"] || ""}
            onSearchChange={(val) => handleSearchChange("description", val)}
            selectedFilters={
              listHook.tableState.columnFilters["description"] || []
            }
            onFilterChange={(vals) => handleFilterChange("description", vals)}
            align="center"
            columnKey="description"
            queryKeyPrefix={`partner-invoice-options-desc-${taxCode}`}
            allFilters={listHook.tableState.columnFilters}
            fetchOptions={fetchInvoiceOptions}
          />
        ),
        size: 260,
        cell: (inv: ErpInvoice) => (
          <Tooltip content={inv.description || ""}>
            <div className="truncate max-w-[260px] text-xs text-muted-foreground">
              {inv.description || "—"}
            </div>
          </Tooltip>
        ),
      },
    ];
  }, [taxCode, listHook.tableState, fetchInvoiceOptions, t]);

  if (!taxCode && !partnerName) {
    return (
      <div className="p-8 text-center bg-surface/50 rounded-xl border border-border/70 flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-8 h-8 text-muted-foreground/60" />
        <div className="text-sm font-medium text-foreground">
          {t("noPartnerInfo", "Không có thông tin đối tác")}
        </div>
        <p className="text-xs text-muted-foreground max-w-sm">
          {t(
            "noPartnerInfoDesc",
            "Hóa đơn này chưa có tên hoặc Mã số thuế đối tác để tra cứu lịch sử giao dịch liên quan.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Header Card: Partner Summary Profile */}
      <div className="p-4 bg-surface rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
            <h3 className="text-base font-bold text-foreground truncate">
              {partnerName || t("unnamedPartner", "Đối tác chưa đặt tên")}
            </h3>
            {partnerName && (
              <button
                type="button"
                onClick={(e) => copyToClipboard(partnerName, false, e)}
                className="p-0.5 text-muted-foreground hover:text-primary transition-colors"
                title={t("copyName", "Copy tên")}
              >
                {copiedName ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
            <Badge
              variant="outline"
              className="text-[11px] font-semibold bg-primary/5 text-primary border-primary/20"
            >
              {isDirectionIn
                ? t("roleSeller", "Bên bán (Nhà cung cấp)")
                : t("roleBuyer", "Bên mua (Khách hàng)")}
            </Badge>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            {taxCode && (
              <div className="flex items-center gap-1.5 font-mono">
                <span className="font-semibold text-foreground/80">MST:</span>
                <span>{taxCode}</span>
                <button
                  type="button"
                  onClick={(e) => copyToClipboard(taxCode, true, e)}
                  className="p-0.5 text-muted-foreground hover:text-primary transition-colors"
                  title={t("copyTax", "Copy MST")}
                >
                  {copiedTax ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {address && (
              <div
                className="flex items-center gap-1 max-w-[450px] truncate"
                title={address}
              >
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/70" />
                <span className="truncate">{address}</span>
              </div>
            )}

            {bank && (
              <div
                className="flex items-center gap-1 max-w-[300px] truncate"
                title={bank}
              >
                <CreditCard className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/70" />
                <span className="truncate">{bank}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stats & Cash Trend Overview */}
      {taxCode && (
        <div className="p-4 bg-surface rounded-xl border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              {t("cashTrendOverview", "Tổng quan Dòng tiền & Giao dịch")}
            </h4>

            {cashTrendLabels.length > 0 && (
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-muted-foreground">
                    {t("totalIn", "Đầu vào:")}
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {money(
                      cashTrendIn.reduce((sum, v) => sum + (Number(v) || 0), 0),
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">
                    {t("totalOut", "Đầu ra:")}
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {money(
                      cashTrendOut.reduce(
                        (sum, v) => sum + (Number(v) || 0),
                        0,
                      ),
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative h-[190px] pt-1">
            {!isLoadingStats && cashTrendLabels.length > 0 ? (
              <BarChart
                labels={cashTrendLabels}
                yCallback={(v) => money(Number(v))}
                datasets={[
                  {
                    data: cashTrendIn,
                    color: barIn,
                    label: t("invoicesIn", "HĐ Đầu vào"),
                  },
                  {
                    data: cashTrendOut,
                    color: barOut,
                    label: t("invoicesOut", "HĐ Đầu ra"),
                  },
                ]}
              />
            ) : isLoadingStats ? (
              <ChartSkeleton type="bar" />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                {t("noChartData", "Chưa có dữ liệu giao dịch đối soát")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Related Invoices Table */}
      <div className="p-4 bg-surface rounded-xl border border-border shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            {t("partnerInvoicesList", "Danh sách Hóa đơn liên quan")}
            {listHook.total > 0 && (
              <span className="text-[11px] font-normal normal-case text-muted-foreground">
                ({listHook.total} {t("invoicesCount", "hóa đơn")})
              </span>
            )}
          </h4>
        </div>

        <div className="min-h-[280px]">
          <StandardTable
            items={listHook.invoices}
            columns={columns}
            getRowKey={(r) => r.id}
            loading={listHook.loading}
            variant="spreadsheet"
            minWidth={800}
            enableColumnResizing={true}
            page={listHook.page}
            pageSize={listHook.pageSize}
            total={listHook.total}
            totalPages={listHook.totalPages}
            onPage={listHook.setPage}
            onPageSize={listHook.setPageSize}
          />
        </div>
      </div>

      {/* Sub-drawer for previewing another invoice from partner's list */}
      {previewSubInvoice && (
        <DrawerModal
          open={Boolean(previewSubInvoice)}
          onClose={() => setPreviewSubInvoice(null)}
          title={`Hóa đơn ${previewSubInvoice.invoiceNo || ""} (Ký hiệu: ${previewSubInvoice.serialNo || "—"})`}
          panelClassName="min-[1024px]:w-[calc(100vw-350px)] w-full max-w-[85vw]"
        >
          <div className="p-4">
            <VietnamInvoiceTemplate invoice={previewSubInvoice} />
          </div>
        </DrawerModal>
      )}
    </div>
  );
});
