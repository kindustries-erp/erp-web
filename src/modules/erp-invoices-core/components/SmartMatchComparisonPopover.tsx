import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Sparkles,
  Eye,
  Search,
  FileText,
  Calendar,
  Building2,
  Wallet,
  Receipt,
} from "lucide-react";
import { money, formatGMT7 } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type {
  ErpInvoice,
  SmartNetOffSuggestionItem,
} from "../api/erpInvoicesCoreApi";
import { BADGE_CONFIG_MAP, highlightText } from "./SmartSuggestionCard";

export interface SmartMatchComparisonPopoverProps {
  invoice: ErpInvoice;
  suggestion: SmartNetOffSuggestionItem;
  invoiceRemaining: number;
  direction?: "IN" | "OUT";
  onApply: () => void;
  onViewTxnDetail?: (txnId: string) => void;
  onManualSelect?: () => void;
  children: React.ReactNode;
}

export function SmartMatchComparisonPopover({
  invoice,
  suggestion,
  invoiceRemaining,
  direction = "IN",
  onApply,
  onViewTxnDetail,
  onManualSelect,
  children,
}: SmartMatchComparisonPopoverProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);
  const [open, setOpen] = useState(false);

  const { txn, score, matchedKeywords = [] } = suggestion;
  const badgeConfig = BADGE_CONFIG_MAP[score.badge] || BADGE_CONFIG_MAP.NOTICE;

  const partnerName =
    direction === "IN" ? invoice.sellerName : invoice.buyerName;
  const partnerTaxCode =
    direction === "IN" ? invoice.sellerTaxCode : invoice.buyerTaxCode;

  const invoiceTotal = Number(invoice.totalAmount) || 0;
  const txnAmount =
    Number(direction === "IN" ? txn.debitAmount : txn.creditAmount) || 0;
  const txnRemaining = Number(txn.remainingAmount) || 0;
  const amtToApply = Math.min(invoiceRemaining, txnRemaining);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply();
    setOpen(false);
  };

  const handleViewDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewTxnDetail) {
      onViewTxnDetail(txn.id);
    }
  };

  const handleManualSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onManualSelect) {
      onManualSelect();
    }
    setOpen(false);
  };

  const popoverContent = (
    <div className="w-[680px] max-w-[92vw] p-4 flex flex-col gap-3.5 text-xs text-slate-800 dark:text-slate-200">
      {/* ─── HEADER: TIÊU ĐỀ & CONFIDENCE SCORE ─── */}
      <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              {t(
                "smartMatchComparisonTitle",
                "Bảng Đối Chiếu & Đánh Giá Khớp Tự Động",
              )}
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Phân tích chi tiết mức độ tương đồng giữa Hóa đơn và Giao dịch sao
            kê ngân hàng.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-0.5 text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs",
              badgeConfig.badgeClasses,
            )}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full", badgeConfig.dotClasses)}
            />
            <span>{t(badgeConfig.key, badgeConfig.label)}</span>
          </Badge>
          {score.score !== undefined && (
            <span className="text-[10px] font-mono text-muted-foreground">
              Điểm tin cậy:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {score.score}
              </strong>
              /100
            </span>
          )}
        </div>
      </div>

      {/* ─── TABLE: SO SÁNH 5 CHIỀU CHUẨN STANDARDIZE-TABLE ─── */}
      <div className="rounded-lg border border-border/70 overflow-hidden bg-surface/50">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted/70 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/70">
            <tr>
              <th className="py-2 px-2.5 w-[140px]">Tiêu chí đối soát</th>
              <th className="py-2 px-2.5 w-[190px]">Hóa đơn đang xét</th>
              <th className="py-2 px-2.5 w-[210px]">Giao dịch sao kê</th>
              <th className="py-2 px-2.5 w-[140px] text-center">Đánh giá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-[11px]">
            {/* 1. Số HĐ / Số Tham Chiếu */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Số HĐ / Tham chiếu</span>
              </td>
              <td className="py-2 px-2.5 font-mono">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {invoice.invoiceNo}
                </div>
                {invoice.serialNo && (
                  <div className="text-[10px] text-muted-foreground">
                    Mẫu: {invoice.serialNo}
                  </div>
                )}
              </td>
              <td className="py-2 px-2.5 font-mono">
                <div
                  className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[190px]"
                  title={txn.referenceNumber || txn.seqNo || "—"}
                >
                  Ref: {txn.referenceNumber || txn.seqNo || "—"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Số HĐ trong nội dung:{" "}
                  {score.invoiceNoMatch ? (
                    <span className="text-emerald-600 font-bold">
                      Có ({invoice.invoiceNo})
                    </span>
                  ) : (
                    "Không"
                  )}
                </div>
              </td>
              <td className="py-2 px-2.5 text-center">
                {score.invoiceNoMatch ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] py-0 px-1.5"
                  >
                    ✓ Khớp số HĐ
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-[10.5px]">—</span>
                )}
              </td>
            </tr>

            {/* 2. Đối tác & MST */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Đối tác & MST</span>
              </td>
              <td className="py-2 px-2.5">
                <div
                  className="font-medium line-clamp-2"
                  title={partnerName || ""}
                >
                  {partnerName || "—"}
                </div>
                {partnerTaxCode && (
                  <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                    MST: {partnerTaxCode}
                  </div>
                )}
              </td>
              <td className="py-2 px-2.5">
                <div
                  className="font-medium line-clamp-2"
                  title={txn.correspondentName || "—"}
                >
                  {txn.correspondentName ? (
                    highlightText(txn.correspondentName, matchedKeywords)
                  ) : (
                    <span className="text-muted-foreground font-mono">—</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {txn.bankAccount?.bankName || "Ngân hàng"}:{" "}
                  {txn.bankAccount?.accountNumber || "—"}
                </div>
              </td>
              <td className="py-2 px-2.5 text-center">
                {score.correspondentMatch ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] py-0 px-1.5"
                  >
                    ✓ Khớp đối tác
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-[10.5px]">—</span>
                )}
              </td>
            </tr>

            {/* 3. Số tiền & Cấn trừ */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Số tiền & Công nợ</span>
              </td>
              <td className="py-2 px-2.5 font-mono">
                <div>
                  Tổng:{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {money(invoiceTotal)}
                  </strong>
                </div>
                <div className="text-rose-600 dark:text-rose-400 text-[10.5px]">
                  Còn nợ: {money(invoiceRemaining)}
                </div>
              </td>
              <td className="py-2 px-2.5 font-mono">
                <div>
                  GD:{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {money(txnAmount)}
                  </strong>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 text-[10.5px]">
                  Khả dụng: {money(txnRemaining)}
                </div>
              </td>
              <td className="py-2 px-2.5 text-center">
                {score.amountMatch ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] py-0 px-1.5"
                  >
                    ✓ Khớp 100% tiền
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] py-0 px-1.5"
                  >
                    Cấn {money(amtToApply)}
                  </Badge>
                )}
              </td>
            </tr>

            {/* 4. Ngày phát sinh */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Ngày phát sinh</span>
              </td>
              <td className="py-2 px-2.5 font-mono">
                {invoice.invoiceDate?.substring(0, 10) || "—"}
              </td>
              <td className="py-2 px-2.5 font-mono">
                {formatGMT7(txn.transDate, "date")}
              </td>
              <td className="py-2 px-2.5 text-center">
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 text-[10px] py-0 px-1.5"
                >
                  Cùng chu kỳ
                </Badge>
              </td>
            </tr>

            {/* 5. Nội dung giao dịch & Highlight từ khóa */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Nội dung GD</span>
              </td>
              <td className="py-2 px-2.5 text-muted-foreground italic line-clamp-2">
                {invoice.description || "—"}
              </td>
              <td className="py-2 px-2.5">
                <div className="line-clamp-3 text-[10.5px] leading-relaxed">
                  {highlightText(txn.description, matchedKeywords)}
                </div>
              </td>
              <td className="py-2 px-2.5 text-center">
                {matchedKeywords.length > 0 ? (
                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block">
                    Trùng {matchedKeywords.length} từ khóa
                  </span>
                ) : (
                  <span className="text-muted-foreground text-[10.5px]">—</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── FOOTER ACTIONS ─── */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/70">
        <div className="flex items-center gap-2">
          {onManualSelect && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleManualSelectClick}
              className="h-7 text-xs px-2 text-slate-600 dark:text-slate-400 hover:text-primary cursor-pointer flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Bỏ qua & Chọn thủ công</span>
            </Button>
          )}

          {onViewTxnDetail && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewDetailClick}
              className="h-7 text-xs px-2 text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem chi tiết GD sao kê</span>
            </Button>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleApplyClick}
          className="h-7 text-xs px-3 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Áp dụng cấn trừ ({money(amtToApply)})</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={popoverContent}
      side="left"
      align="center"
      sideOffset={12}
    >
      {children}
    </Popover>
  );
}
