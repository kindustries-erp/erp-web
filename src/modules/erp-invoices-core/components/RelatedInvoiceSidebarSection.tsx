import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ExternalLink, FileText, ArrowRight } from "lucide-react";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { openGlobalErpDocument } from "@/shared/components/drawer/DrawerDocumentTraceability/constants";
import { money, formatGMT7 } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import toast from "react-hot-toast";

interface Props {
  invoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
}

export function RelatedInvoiceSidebarSection({
  invoice,
  direction = "IN",
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const taxStatus = invoice?.taxInvoiceStatus;
  const relatedInvNo = invoice?.relatedInvoiceNo;
  const relatedSerNo = invoice?.relatedSerialNo;

  // 1. If this is an Adjustment (3) or Replacement (2) invoice: Query the Original Invoice
  const isAdjustmentOrReplacement =
    taxStatus === 2 || taxStatus === 3 || Boolean(relatedInvNo);

  const { data: originalInvoiceRes, isLoading: loadingOriginal } = useQuery({
    queryKey: [
      "erp-invoice-original-by-no",
      relatedInvNo,
      relatedSerNo,
      invoice?.direction || direction,
    ],
    queryFn: async () => {
      if (!relatedInvNo) return null;
      const res = await erpInvoicesCoreApi.list({
        invoice_no: relatedInvNo,
        serial_no: relatedSerNo || undefined,
        direction: invoice?.direction || direction,
        pageSize: 1,
      });
      return res.items?.[0] || null;
    },
    enabled: Boolean(isAdjustmentOrReplacement && relatedInvNo),
    staleTime: 30000,
  });

  // 2. If this is an Adjusted (5) or Replaced (4) Original Invoice: Query Downstream Adjusting Invoices
  const isOriginalAdjustedOrReplaced = taxStatus === 4 || taxStatus === 5;

  const { data: adjustingInvoicesRes, isLoading: loadingAdjusting } = useQuery({
    queryKey: [
      "erp-invoices-adjusting-by-no",
      invoice?.invoiceNo,
      invoice?.serialNo,
      invoice?.direction || direction,
    ],
    queryFn: async () => {
      if (!invoice?.invoiceNo) return [];
      const res = await erpInvoicesCoreApi.list({
        related_invoice_no: invoice.invoiceNo,
        related_serial_no: invoice.serialNo || undefined,
        direction: invoice?.direction || direction,
        pageSize: 10,
      });
      return res.items || [];
    },
    enabled: Boolean(isOriginalAdjustedOrReplaced && invoice?.invoiceNo),
    staleTime: 30000,
  });

  if (!isAdjustmentOrReplacement && !isOriginalAdjustedOrReplaced) {
    return null;
  }

  const handleOpenInvoice = (invId?: string, invNo?: string) => {
    if (invId) {
      openGlobalErpDocument("INVOICE", invId);
    } else {
      toast.error(
        t(
          "Không tìm thấy dữ liệu chi tiết của hóa đơn {{no}} trong hệ thống.",
          {
            no: invNo || "",
          },
        ),
      );
    }
  };

  return (
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
      {/* ─── CASE 1: HĐ hiện tại là Điều chỉnh (3) hoặc Thay thế (2) ─── */}
      {isAdjustmentOrReplacement && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {taxStatus === 2
                ? t("Hóa đơn gốc bị thay thế")
                : t("Hóa đơn gốc bị điều chỉnh")}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
              {taxStatus === 2 ? t("HĐ gốc") : t("HĐ gốc")}
            </span>
          </div>

          {relatedInvNo ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                handleOpenInvoice(originalInvoiceRes?.id, relatedInvNo)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleOpenInvoice(originalInvoiceRes?.id, relatedInvNo);
                }
              }}
              className={cn(
                "group p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer text-left shadow-2xs hover:shadow-sm",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    #{relatedInvNo}
                  </span>
                  {relatedSerNo && (
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      ({relatedSerNo})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-sans">Mở chi tiết</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {loadingOriginal ? (
                <div className="text-[11px] text-slate-400 italic pt-1 animate-pulse">
                  Đang tải thông tin...
                </div>
              ) : originalInvoiceRes ? (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">
                      {originalInvoiceRes.invoiceDate
                        ? formatGMT7(originalInvoiceRes.invoiceDate, "date")
                        : "—"}
                    </span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {money(Number(originalInvoiceRes.totalAmount || 0))}
                    </span>
                  </div>
                  {(originalInvoiceRes.sellerName ||
                    originalInvoiceRes.buyerName) && (
                    <div className="truncate text-slate-500 dark:text-slate-400 text-[10px]">
                      {invoice?.direction === "IN"
                        ? `NCC: ${originalInvoiceRes.sellerName}`
                        : `KH: ${originalInvoiceRes.buyerName || originalInvoiceRes.buyerPersonalName || ""}`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 italic pt-0.5">
                  (Bấm để tra cứu chi tiết trong hệ thống)
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              {t("Chưa có thông tin số HĐ gốc từ XML")}
            </div>
          )}
        </div>
      )}

      {/* ─── CASE 2: HĐ hiện tại là HĐ Gốc Bị điều chỉnh (5) hoặc Bị thay thế (4) ─── */}
      {isOriginalAdjustedOrReplaced && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              {taxStatus === 4
                ? t("Hóa đơn thay thế phát sinh")
                : t("Hóa đơn điều chỉnh phát sinh")}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800">
              {taxStatus === 4 ? t("Thay thế") : t("Điều chỉnh")}
            </span>
          </div>

          {loadingAdjusting ? (
            <div className="text-[11px] text-slate-400 italic p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse">
              Đang tìm hóa đơn điều chỉnh...
            </div>
          ) : adjustingInvoicesRes && adjustingInvoicesRes.length > 0 ? (
            <div className="space-y-1.5">
              {adjustingInvoicesRes.map((adjInv) => (
                <div
                  key={adjInv.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenInvoice(adjInv.id, adjInv.invoiceNo)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleOpenInvoice(adjInv.id, adjInv.invoiceNo);
                    }
                  }}
                  className={cn(
                    "group p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer text-left shadow-2xs hover:shadow-sm",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                        #{adjInv.invoiceNo}
                      </span>
                      {adjInv.serialNo && (
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          ({adjInv.serialNo})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] font-sans">Mở chi tiết</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span className="text-slate-400 font-sans">
                      {adjInv.invoiceDate
                        ? formatGMT7(adjInv.invoiceDate, "date")
                        : "—"}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        Number(adjInv.totalAmount || 0) < 0
                          ? "text-orange-600 dark:text-orange-400 font-bold"
                          : "text-slate-800 dark:text-slate-200",
                      )}
                    >
                      {money(Number(adjInv.totalAmount || 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              {t("Chưa có hóa đơn điều chỉnh/thay thế nào trong hệ thống")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
