import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { money, formatGMT7 } from "@/shared/utils/format";
import type { RelatedInvoiceSidebarSectionProps } from "./RelatedInvoiceSidebarSection.type";
import { useRelatedInvoiceSidebarSection } from "./RelatedInvoiceSidebarSection.hook";
import { AdjustmentTypeBadge } from "../../atoms/adjustment-type-badge";
import { AdjustmentFinancialSummary } from "../../molecules/adjustment-financial-summary";
import { AdjustmentInfoDiffCard } from "../../molecules/adjustment-info-diff-card";
import { AdjustmentItemsTable } from "../../molecules/adjustment-items-table";

export const RelatedInvoiceSidebarSection: React.FC<
  RelatedInvoiceSidebarSectionProps
> = ({ invoice, direction = "IN" }) => {
  const {
    t,
    isAdjustmentOrReplacement,
    isOriginalAdjustedOrReplaced,
    originalInvoiceRes,
    loadingOriginal,
    adjustingInvoicesRes,
    loadingAdjusting,
    handleOpenInvoice,
    handleExecuteNetoff,
    reconciliation,
    isExecutingNetoff,
    relatedInvNo,
    taxStatus,
  } = useRelatedInvoiceSidebarSection({ invoice, direction });

  if (!isAdjustmentOrReplacement && !isOriginalAdjustedOrReplaced) {
    return null;
  }

  const role =
    reconciliation?.role ||
    (isAdjustmentOrReplacement ? "ADJUSTING" : "ORIGINAL");
  const relatedSerNo = invoice?.relatedSerialNo;

  return (
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
      {/* ─── CASE 1: HĐ hiện tại là Điều chỉnh (3) hoặc Thay thế (2) ─── */}
      {isAdjustmentOrReplacement && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {taxStatus === 2
                ? t("Hóa đơn gốc bị thay thế")
                : t("Hóa đơn gốc bị điều chỉnh")}
            </span>
            <AdjustmentTypeBadge role={role} taxInvoiceStatus={taxStatus} />
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
              className="group p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer text-left shadow-2xs hover:shadow-sm"
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
                  <span className="text-[11px] font-sans">
                    {t("Mở chi tiết")}
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {loadingOriginal ? (
                <div className="text-[11px] text-slate-400 italic pt-1 animate-pulse">
                  {t("Đang tải thông tin...")}
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
                </div>
              ) : (
                <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 italic pt-1">
                  {t("Chưa có bản ghi số liệu chi tiết")}
                </div>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              {t("Chưa ghi nhận số hóa đơn gốc.")}
            </div>
          )}
        </div>
      )}

      {/* ─── CASE 2: HĐ hiện tại là HĐ Gốc có HĐ ĐC trỏ đến ─── */}
      {isOriginalAdjustedOrReplaced && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              {t("Danh sách HĐ điều chỉnh / thay thế")}
            </span>
            <AdjustmentTypeBadge role="ORIGINAL" taxInvoiceStatus={taxStatus} />
          </div>

          {loadingAdjusting ? (
            <div className="text-[11px] text-slate-400 italic animate-pulse">
              {t("Đang tìm hóa đơn liên quan...")}
            </div>
          ) : adjustingInvoicesRes && adjustingInvoicesRes.length > 0 ? (
            <div className="space-y-1.5">
              {adjustingInvoicesRes.map((adj) => (
                <div
                  key={adj.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenInvoice(adj.id, adj.invoiceNo)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleOpenInvoice(adj.id, adj.invoiceNo);
                  }}
                  className="group p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer text-left shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-100">
                      #{adj.invoiceNo} {adj.serialNo ? `(${adj.serialNo})` : ""}
                    </span>
                    <span className="font-mono font-semibold text-xs text-orange-700 dark:text-orange-400">
                      {money(Number(adj.totalAmount || 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              {t("Chưa có hóa đơn điều chỉnh nào trong hệ thống.")}
            </div>
          )}
        </div>
      )}

      {/* ─── HIỂN THỊ DỮ LIỆU ĐỐI SOÁT TOÀN DIỆN (Financial, Info Diff, Items) ─── */}
      {reconciliation && (
        <div className="space-y-2.5 pt-1">
          {reconciliation.financial && (
            <AdjustmentFinancialSummary
              financial={reconciliation.financial}
              role={role}
              onExecuteNetoff={handleExecuteNetoff}
              isExecuting={isExecutingNetoff}
            />
          )}

          {reconciliation.infoDiff?.hasInfoAdjustment && (
            <AdjustmentInfoDiffCard diffs={reconciliation.infoDiff.diffs} />
          )}

          {reconciliation.itemReconciliations &&
            reconciliation.itemReconciliations.length > 0 && (
              <AdjustmentItemsTable
                items={reconciliation.itemReconciliations}
              />
            )}
        </div>
      )}
    </div>
  );
};

export default RelatedInvoiceSidebarSection;
