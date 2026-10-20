import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { CopyButton } from "@/shared/components/CopyButton";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { TimeHorizonInvoiceItem, TimeHorizonKey } from "../types";

export interface CreateInvoiceColumnsParams {
  headerFilter: any;
  isReceivable: boolean;
  horizon: TimeHorizonKey | null;
  onOpenInternal: (invoice: any) => void;
  onOpenPartnerDetail?: (taxCode: string, partnerName?: string) => void;
  t: (key: string, fallback?: any) => string;
}

export function createTimeHorizonInvoiceColumns({
  headerFilter,
  isReceivable,
  horizon,
  onOpenInternal,
  onOpenPartnerDetail,
  t,
}: CreateInvoiceColumnsParams): DataTableColumn<TimeHorizonInvoiceItem>[] {
  const isForecast =
    horizon === "forecastNext7Days" || horizon === "forecastNext30Days";
  const isExpected = horizon === "expectedCashflow";
  const isRisk = horizon === "defaultRiskProvision";
  const todayStr = new Date().toISOString().slice(0, 10);

  return [
    // 1. STT (#) - 40px, Center aligned, 1-based index via {idx}
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      minSize: 40,
      enableResizing: false,
      className:
        "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
      headerClassName: "text-center w-[40px] min-w-[40px]",
      cell: (_, idx) => <span>{idx}</span>,
    },

    // 2. Số / Ký hiệu HĐ (invoiceNo + serialNo) - Gom 2 dòng chuẩn erp-invoice
    {
      key: "invoiceNo",
      header: headerFilter(
        "invoiceNo",
        t("debts:horizonDrawer.invoiceNoAndSerial", "Số / Ký hiệu HĐ"),
      ),
      size: 150,
      minSize: 130,
      enableResizing: true,
      cell: (row) => {
        const invNo = row.invoiceNo?.trim() || "";
        const sNo = row.serialNo?.trim() || "";
        if (!invNo && !sNo)
          return <span className="text-muted-foreground">—</span>;

        const handleOpenDetail = (e: React.MouseEvent) => {
          e.stopPropagation();
          onOpenInternal(row);
        };

        return (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <Tooltip
              content={t("debts:viewInvoiceDetail", "Xem chi tiết hóa đơn")}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-muted/60 hover:text-primary rounded-xs transition-all focus:ring-0 focus-visible:ring-0 focus:outline-none"
                onClick={handleOpenDetail}
                aria-label="Xem chi tiết"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </Tooltip>

            <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
              {/* Dòng 1: Số HĐ bold primary */}
              <div className="flex items-center gap-1 min-w-0 group/invno">
                <Tooltip content={`Số HĐ: ${invNo || "—"}`}>
                  <span
                    className="truncate text-xs font-semibold text-primary leading-tight select-text cursor-pointer hover:underline"
                    onClick={handleOpenDetail}
                  >
                    {invNo || "—"}
                  </span>
                </Tooltip>
                {invNo && (
                  <CopyButton
                    value={invNo}
                    tooltip="Copy Số HĐ"
                    copiedTooltip="Đã copy"
                    toastMessage="Đã copy Số HĐ"
                    toastId={`inv-no-${row.id}`}
                    iconClassName="w-2.5 h-2.5"
                    className="h-3.5 w-3.5 p-0 opacity-0 group-hover/invno:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                  />
                )}
              </div>

              {/* Dòng 2: Ký hiệu HĐ mono muted */}
              {sNo && (
                <div className="flex items-center gap-1 min-w-0 group/serial">
                  <Tooltip content={`Ký hiệu: ${sNo}`}>
                    <span className="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text">
                      {sNo}
                    </span>
                  </Tooltip>
                  <CopyButton
                    value={sNo}
                    tooltip="Copy Ký hiệu"
                    copiedTooltip="Đã copy"
                    toastMessage="Đã copy Ký hiệu HĐ"
                    toastId={`inv-sno-${row.id}`}
                    iconClassName="w-2.5 h-2.5"
                    className="h-3 w-3 p-0 opacity-0 group-hover/serial:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    // 3. Đối tác / MST (partnerName + taxCode) - Gom 2 dòng chuẩn erp-invoice
    {
      key: "partnerName",
      header: headerFilter(
        "partnerName",
        !isReceivable
          ? t("debts:horizonDrawer.partnerSellerAndTax", "Bên bán / MST")
          : t("debts:horizonDrawer.partnerBuyerAndTax", "Bên mua / MST"),
      ),
      size: 240,
      minSize: 190,
      enableResizing: true,
      cell: (row) => {
        const pName =
          (isReceivable ? row.buyerName : row.sellerName) ||
          row.partnerName?.trim() ||
          "";
        const rawTax =
          (isReceivable ? row.buyerTaxCode : row.sellerTaxCode) ||
          row.taxCode?.trim() ||
          "";
        const hasTax = Boolean(rawTax && rawTax !== "KHONG_MST");
        const taxText = rawTax === "KHONG_MST" ? "Không có MST" : rawTax;

        const handleOpenPartner = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (rawTax) {
            onOpenPartnerDetail?.(rawTax, pName);
          }
        };

        return (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
              {/* Dòng 1: Tên đối tác */}
              <div className="flex items-center gap-1 min-w-0 group/pname">
                <Tooltip content={pName || "—"}>
                  <span
                    className={cn(
                      "truncate text-xs font-semibold leading-tight select-text",
                      hasTax
                        ? "text-slate-800 dark:text-slate-200 cursor-pointer hover:text-primary hover:underline"
                        : "text-foreground",
                    )}
                    onClick={hasTax ? handleOpenPartner : undefined}
                  >
                    {pName || "—"}
                  </span>
                </Tooltip>
                {pName && pName !== "—" && (
                  <CopyButton
                    value={pName}
                    tooltip="Copy tên"
                    copiedTooltip="Đã copy"
                    toastMessage="Đã copy tên đối tác"
                    toastId={`partner-name-${row.id}`}
                    iconClassName="w-2.5 h-2.5"
                    className="h-3.5 w-3.5 p-0 opacity-0 group-hover/pname:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                  />
                )}
              </div>

              {/* Dòng 2: MST */}
              {rawTax && (
                <div className="flex items-center gap-1 min-w-0 group/tax">
                  <Tooltip content={`MST: ${taxText}`}>
                    <span className="truncate text-[11px] font-normal font-mono text-muted-foreground leading-tight select-text">
                      <span className="text-slate-400 font-sans mr-0.5">
                        MST:
                      </span>
                      {taxText}
                    </span>
                  </Tooltip>
                  {hasTax && (
                    <CopyButton
                      value={rawTax}
                      tooltip="Copy MST"
                      copiedTooltip="Đã copy"
                      toastMessage="Đã copy MST"
                      toastId={`partner-tax-${row.id}`}
                      iconClassName="w-2.5 h-2.5"
                      className="h-3 w-3 p-0 opacity-0 group-hover/tax:opacity-100 transition-opacity flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      },
    },

    // 4. Ngày HĐ (invoiceDate) - TableDateCell right aligned
    {
      key: "invoiceDate",
      className: "text-right",
      header: (headerFilter.date || headerFilter)(
        "invoiceDate",
        t("debts:drawer.invoiceDate", "Ngày HĐ"),
      ),
      size: 110,
      minSize: 100,
      enableResizing: true,
      cell: (row) => (
        <TableDateCell
          date={row.invoiceDate}
          format="date"
          className="justify-end w-full"
        />
      ),
    },

    // 5. Cột Dự báo: Độ trễ TB & Ngày dự kiến thu/trả (nếu là forecast)
    ...(isForecast
      ? [
          // Độ trễ TB đối tác (partnerAvgLagDays)
          {
            key: "partnerAvgLagDays" as const,
            className: "text-center",
            header: (headerFilter.numeric || headerFilter)(
              "partnerAvgLagDays",
              t("debts:horizonDrawer.partnerAvgLag", "Độ trễ TB"),
            ),
            size: 100,
            minSize: 90,
            enableResizing: true,
            cell: (row: TimeHorizonInvoiceItem) => {
              const lag = row.partnerAvgLagDays ?? 30;
              return (
                <span className="font-mono text-xs text-muted-foreground">
                  {lag} ngày
                </span>
              );
            },
          },
          // Ngày dự kiến thu/trả (estimatedSettlementDate)
          {
            key: "estimatedSettlementDate" as const,
            className: "text-right",
            header: (headerFilter.date || headerFilter)(
              "estimatedSettlementDate",
              t(
                "debts:horizonDrawer.estimatedSettlementDate",
                "Dự kiến thu/trả",
              ),
            ),
            size: 130,
            minSize: 115,
            enableResizing: true,
            cell: (row: TimeHorizonInvoiceItem) => {
              const isOverdue =
                row.estimatedSettlementDate &&
                row.estimatedSettlementDate < todayStr;
              return (
                <div className="flex flex-col items-end gap-0.5 w-full">
                  <TableDateCell
                    date={row.estimatedSettlementDate}
                    format="date"
                    className={cn(
                      "justify-end w-full font-medium font-mono text-xs",
                      isOverdue
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-primary",
                    )}
                  />
                  {row.estimatedSettlementDate && (
                    <span
                      className={cn(
                        "text-[9px] px-1 py-0 rounded font-medium inline-block",
                        isOverdue
                          ? "bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                      )}
                    >
                      {isOverdue
                        ? t("debts:horizonDrawer.overdueCarried", "Trôi sang")
                        : t("debts:horizonDrawer.normalLagBadge", "Trong kỳ")}
                    </span>
                  )}
                </div>
              );
            },
          },
        ]
      : []),

    // 6. Tổng tiền (totalAmount)
    {
      key: "totalAmount",
      className: "text-right",
      header: (headerFilter.amount || headerFilter)(
        "totalAmount",
        t("debts:drawer.totalAmount", "Tổng tiền"),
      ),
      size: 130,
      minSize: 115,
      enableResizing: true,
      cell: (row) => (
        <span className="tabular-nums font-mono font-semibold text-xs text-foreground">
          {money(row.totalAmount || 0)}
        </span>
      ),
    },

    // 7. Đã cấn trừ (paidAmount)
    {
      key: "paidAmount",
      className: "text-right",
      header: (headerFilter.amount || headerFilter)(
        "paidAmount",
        t("debts:drawer.paidAmount", "Đã cấn trừ"),
      ),
      size: 120,
      minSize: 105,
      enableResizing: true,
      cell: (row) => (
        <span className="tabular-nums font-mono font-medium text-xs text-emerald-700 dark:text-emerald-400">
          {money(row.paidAmount || 0)}
        </span>
      ),
    },

    // 8. Tiền dự thu / Tiền dự chi / Còn nợ (balanceAmount)
    {
      key: "balanceAmount",
      className: "text-right",
      header: (headerFilter.amount || headerFilter)(
        "balanceAmount",
        isReceivable
          ? isForecast
            ? t("debts:horizonDrawer.expectedAmountCol", "Tiền dự thu")
            : t("debts:drawer.balanceAmount", "Còn nợ")
          : isForecast
            ? t("debts:horizonDrawer.expectedPayableCol", "Tiền dự chi")
            : t("debts:drawer.balanceAmount", "Còn nợ"),
      ),
      size: 135,
      minSize: 120,
      enableResizing: true,
      cell: (row) => (
        <span
          className={cn(
            "tabular-nums font-mono font-bold text-xs",
            isReceivable
              ? "text-rose-600 dark:text-rose-400"
              : "text-amber-700 dark:text-amber-400",
          )}
        >
          {money(row.balanceAmount || 0)}
        </span>
      ),
    },

    // 9. Cột theo dõi mô hình IFRS 9 (nếu chọn mốc Expected hoặc Risk)
    ...(isExpected
      ? [
          // Xác suất thu hồi (%)
          {
            key: "recoveryProbability" as const,
            className: "text-center",
            header: (headerFilter.numeric || headerFilter)(
              "recoveryProbability",
              t("debts:horizonDrawer.recoveryProbability", "Xác suất thu hồi"),
            ),
            size: 145,
            minSize: 130,
            enableResizing: true,
            cell: (row: TimeHorizonInvoiceItem) => {
              const prob = row.recoveryProbability ?? 0;
              const colorCls =
                prob >= 85
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : prob >= 60
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
                    : prob >= 30
                      ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0 font-semibold",
                    colorCls,
                  )}
                >
                  {prob}%
                </Badge>
              );
            },
          },
          // Tiền kỳ vọng
          {
            key: "expectedAmount" as const,
            className: "text-right",
            header: (headerFilter.amount || headerFilter)(
              "expectedAmount",
              t("debts:horizonDrawer.expectedAmount", "Tiền kỳ vọng"),
            ),
            size: 135,
            minSize: 120,
            enableResizing: true,
            cell: (row: TimeHorizonInvoiceItem) => (
              <span className="tabular-nums font-mono font-bold text-xs text-primary">
                {money(row.expectedAmount ?? 0)}
              </span>
            ),
          },
        ]
      : isRisk
        ? [
            // Tỷ lệ trích lập (%)
            {
              key: "riskProbability" as const,
              className: "text-center",
              header: (headerFilter.numeric || headerFilter)(
                "riskProbability",
                t("debts:horizonDrawer.riskProbability", "Tỷ lệ trích lập"),
              ),
              size: 140,
              minSize: 125,
              enableResizing: true,
              cell: (row: TimeHorizonInvoiceItem) => {
                const prob = row.riskProbability ?? 0;
                const colorCls =
                  prob <= 15
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : prob <= 40
                      ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                      : prob <= 70
                        ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300"
                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
                return (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0 font-semibold",
                      colorCls,
                    )}
                  >
                    {prob}%
                  </Badge>
                );
              },
            },
            // Dự phòng rủi ro
            {
              key: "riskAmount" as const,
              className: "text-right",
              header: (headerFilter.amount || headerFilter)(
                "riskAmount",
                t("debts:horizonDrawer.riskAmount", "Dự phòng rủi ro"),
              ),
              size: 135,
              minSize: 120,
              enableResizing: true,
              cell: (row: TimeHorizonInvoiceItem) => (
                <span className="tabular-nums font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                  {money(row.riskAmount ?? 0)}
                </span>
              ),
            },
          ]
        : []),

    // 10. Tuổi nợ (agingDays)
    {
      key: "agingDays",
      className: "text-center",
      header: (headerFilter.numeric || headerFilter)(
        "agingDays",
        t("debts:drawer.agingDays", "Tuổi nợ"),
      ),
      size: 100,
      minSize: 90,
      enableResizing: true,
      cell: (row) => {
        const aging = row.agingDays || 0;
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
  ];
}
