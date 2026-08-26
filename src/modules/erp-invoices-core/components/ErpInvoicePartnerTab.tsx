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
import { DrawerModal, DrawerSection } from "@/shared/components/DrawerModal";

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
    <div className="flex flex-col lg:flex-row items-start w-full gap-5">
      {/* ── Cột Trái (Main Content): Bảng danh sách hóa đơn liên quan ── */}
      <div className="flex-1 min-w-0 w-full order-2 lg:order-1">
        <DrawerSection
          title={
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>{t("partnerInvoicesList", "Danh sách hóa đơn")}</span>
            </div>
          }
          titleExtra={
            listHook.total > 0 ? (
              <span className="text-xs font-normal text-muted-foreground">
                {listHook.total} {t("invoicesCount", "hóa đơn")}
              </span>
            ) : undefined
          }
          collapsible={true}
          className="mb-0 max-h-[calc(100vh-210px)] flex flex-col"
          bodyClassName="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 min-h-[300px] overflow-y-auto pr-0.5">
            <StandardTable
              items={listHook.invoices}
              columns={columns}
              getRowKey={(r) => r.id}
              loading={listHook.loading}
              variant="spreadsheet"
              minWidth={750}
              enableColumnResizing={true}
              page={listHook.page}
              pageSize={listHook.pageSize}
              total={listHook.total}
              totalPages={listHook.totalPages}
              onPage={listHook.setPage}
              onPageSize={listHook.setPageSize}
            />
          </div>
        </DrawerSection>
      </div>

      {/* ── Cột Phải (Sidebar): Hồ sơ đối tác & Tổng quan dòng tiền ── */}
      <div className="w-full lg:w-[330px] xl:w-[350px] shrink-0 order-1 lg:order-2 space-y-4 lg:sticky lg:top-0">
        {/* 1. Hồ sơ đối tác */}
        <DrawerSection
          title={
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>{t("partnerProfile", "Hồ sơ đối tác")}</span>
            </div>
          }
          collapsible={true}
        >
          <div className="space-y-3">
            {/* Tên đối tác & Role Badge */}
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-foreground leading-snug break-words">
                  {partnerName || t("unnamedPartner", "Đối tác chưa đặt tên")}
                </span>
                {partnerName && (
                  <button
                    type="button"
                    onClick={(e) => copyToClipboard(partnerName, false, e)}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    title={t("copyName", "Copy tên")}
                  >
                    {copiedName ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20"
              >
                {isDirectionIn
                  ? t("roleSeller", "Bên bán (Nhà cung cấp)")
                  : t("roleBuyer", "Bên mua (Khách hàng)")}
              </Badge>
            </div>

            {/* Thông tin chi tiết: MST, Địa chỉ, Ngân hàng */}
            <div className="space-y-2 pt-2 border-t border-border/70 text-xs">
              {taxCode && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground shrink-0 font-medium">
                    MST:
                  </span>
                  <div className="flex items-center gap-1 min-w-0 font-mono">
                    <span className="font-semibold text-foreground truncate">
                      {taxCode}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => copyToClipboard(taxCode, true, e)}
                      className="p-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                      title={t("copyTax", "Copy MST")}
                    >
                      {copiedTax ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {address && (
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span
                    className="text-[11px] leading-relaxed line-clamp-2"
                    title={address}
                  >
                    {address}
                  </span>
                </div>
              )}

              {bank && (
                <div className="flex items-start gap-1.5 text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                  <span
                    className="text-[11px] leading-relaxed line-clamp-2"
                    title={bank}
                  >
                    {bank}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DrawerSection>

        {/* 2. Tổng quan Dòng tiền & Biểu đồ compact */}
        {taxCode && (
          <DrawerSection
            title={
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span>{t("cashTrendOverview", "Tổng quan Dòng tiền")}</span>
              </div>
            }
            collapsible={true}
          >
            <div className="space-y-3">
              {/* Compact KPI Badges */}
              {cashTrendLabels.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {t("totalIn", "Đầu vào")}
                    </div>
                    <div className="font-bold text-foreground tabular-nums truncate text-[11px]">
                      {money(
                        cashTrendIn.reduce(
                          (sum, v) => sum + (Number(v) || 0),
                          0,
                        ),
                      )}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t("totalOut", "Đầu ra")}
                    </div>
                    <div className="font-bold text-foreground tabular-nums truncate text-[11px]">
                      {money(
                        cashTrendOut.reduce(
                          (sum, v) => sum + (Number(v) || 0),
                          0,
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Compact BarChart */}
              <div className="relative h-[140px] pt-1">
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
          </DrawerSection>
        )}
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
