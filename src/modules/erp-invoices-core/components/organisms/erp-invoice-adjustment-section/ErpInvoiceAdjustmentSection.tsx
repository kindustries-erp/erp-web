import React from "react";
import { FileText } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import { AdjustmentTypeBadge } from "../../atoms/adjustment-type-badge";
import { AdjustmentOriginalInvoiceCard } from "../../molecules/adjustment-original-invoice-card";
import { AdjustmentFinancialSummary } from "../../molecules/adjustment-financial-summary";
import { AdjustmentInfoDiffCard } from "../../molecules/adjustment-info-diff-card";
import { AdjustmentItemsTable } from "../../molecules/adjustment-items-table";
import type { ErpInvoiceAdjustmentSectionProps } from "./ErpInvoiceAdjustmentSection.type";
import { useErpInvoiceAdjustmentSection } from "./ErpInvoiceAdjustmentSection.hook";

export const ErpInvoiceAdjustmentSection: React.FC<
  ErpInvoiceAdjustmentSectionProps
> = ({ invoice, direction = "IN", className }) => {
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
    relatedSerNo,
    taxStatus,
  } = useErpInvoiceAdjustmentSection({ invoice, direction });

  if (!isAdjustmentOrReplacement && !isOriginalAdjustedOrReplaced) {
    return null;
  }

  const role =
    reconciliation?.role ||
    (isAdjustmentOrReplacement ? "ADJUSTING" : "ORIGINAL");

  const titleText = isAdjustmentOrReplacement
    ? taxStatus === 2
      ? t("Hóa đơn gốc bị thay thế & Đối soát")
      : t("Hóa đơn gốc bị điều chỉnh & Đối soát")
    : t("Đối soát hóa đơn điều chỉnh / thay thế liên quan");

  return (
    <DrawerSection
      title={
        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wide">
          <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          {titleText}
        </span>
      }
      titleExtra={
        <AdjustmentTypeBadge role={role} taxInvoiceStatus={taxStatus} />
      }
      collapsible={true}
      defaultCollapsed={false}
      className={className}
    >
      <div className="space-y-3">
        {/* HÀNG TRÊN: Grid 2 cột responsive (Thẻ HĐ gốc / Danh sách HĐ ĐC + Cân đối tài chính & Dư nợ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
          {/* CỘT 1: Thông tin HĐ liên quan */}
          {isAdjustmentOrReplacement ? (
            <AdjustmentOriginalInvoiceCard
              relatedInvNo={relatedInvNo}
              relatedSerNo={relatedSerNo}
              originalInvoice={
                originalInvoiceRes ||
                reconciliation?.relatedInvoices?.find(
                  (r) => r.relationType === "ORIGINAL_OF_THIS",
                )
              }
              loading={loadingOriginal}
              onOpenInvoice={handleOpenInvoice}
              taxInvoiceStatus={taxStatus}
            />
          ) : (
            <div className="p-3 rounded-xl border border-border/80 bg-surface/70 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                {t("Danh sách HĐ điều chỉnh / thay thế")}
              </span>
              {loadingAdjusting ? (
                <div className="text-[11px] text-muted-foreground italic animate-pulse">
                  {t("Đang tìm hóa đơn liên quan...")}
                </div>
              ) : adjustingInvoicesRes && adjustingInvoicesRes.length > 0 ? (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {adjustingInvoicesRes.map((adj) => (
                    <div
                      key={adj.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenInvoice(adj.id, adj.invoiceNo)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleOpenInvoice(adj.id, adj.invoiceNo);
                        }
                      }}
                      className="p-2 rounded-lg border border-border/60 bg-muted/30 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 hover:border-orange-300 transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="font-mono font-bold text-foreground">
                        #{adj.invoiceNo}{" "}
                        {adj.serialNo ? `(${adj.serialNo})` : ""}
                      </span>
                      <span className="font-mono font-semibold text-orange-700 dark:text-orange-400">
                        {money(Number(adj.totalAmount || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground italic">
                  {t("Chưa có hóa đơn điều chỉnh nào trong hệ thống.")}
                </div>
              )}
            </div>
          )}

          {/* CỘT 2: Cân đối tài chính & Dư nợ */}
          {reconciliation?.financial && (
            <AdjustmentFinancialSummary
              financial={reconciliation.financial}
              role={role}
              onExecuteNetoff={handleExecuteNetoff}
              isExecuting={isExecutingNetoff}
            />
          )}
        </div>

        {/* HÀNG GIỮA: Thông tin thay đổi (nếu có) */}
        {reconciliation?.infoDiff?.hasInfoAdjustment && (
          <AdjustmentInfoDiffCard diffs={reconciliation.infoDiff.diffs} />
        )}

        {/* HÀNG DƯỚI: Bảng đối soát số lượng mặt hàng (Full width) */}
        {reconciliation?.itemReconciliations &&
          reconciliation.itemReconciliations.length > 0 && (
            <AdjustmentItemsTable items={reconciliation.itemReconciliations} />
          )}
      </div>
    </DrawerSection>
  );
};

export default ErpInvoiceAdjustmentSection;
