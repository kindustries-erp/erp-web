import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/table";
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
import { SuggestionBadgePill, highlightText } from "./SmartSuggestionCard";

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

  const partnerName =
    direction === "IN" ? invoice.sellerName : invoice.buyerName;
  const partnerTaxCode =
    direction === "IN" ? invoice.sellerTaxCode : invoice.buyerTaxCode;

  const invoiceTotal = Number(invoice.totalAmount) || 0;
  const txnAmount =
    Number(direction === "IN" ? txn.debitAmount : txn.creditAmount) || 0;
  const txnRemaining = Number(txn.remainingAmount) || 0;
  const amtToApply = Math.min(invoiceRemaining, txnRemaining);

  // Dynamic Date Comparison
  const dateComparison = (() => {
    if (!invoice.invoiceDate || !txn.transDate) {
      return {
        label: "—",
        badgeClass: "bg-muted text-muted-foreground border-border",
      };
    }
    const dInv = new Date(invoice.invoiceDate);
    const dTxn = new Date(txn.transDate);
    const diffMs = Math.abs(dTxn.getTime() - dInv.getTime());
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const invYear = dInv.getFullYear();
    const invMonth = dInv.getMonth();
    const txnYear = dTxn.getFullYear();
    const txnMonth = dTxn.getMonth();
    const monthDiff = Math.abs(
      (txnYear - invYear) * 12 + (txnMonth - invMonth),
    );

    if (diffDays === 0) {
      return {
        label: "✓ Cùng ngày",
        badgeClass:
          "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold",
      };
    }
    if (monthDiff === 0) {
      const mStr = `${(invMonth + 1).toString().padStart(2, "0")}/${invYear}`;
      return {
        label: `✓ Cùng tháng (${mStr})`,
        badgeClass:
          "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold",
      };
    }
    if (diffDays <= 45) {
      return {
        label: `Lệch ${diffDays} ngày`,
        badgeClass:
          "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 font-semibold",
      };
    }
    return {
      label: `Lệch ${monthDiff} tháng`,
      badgeClass:
        "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 font-medium",
    };
  })();

  // Dynamic Description Keywords Check (chỉ tính từ khóa thực sự xuất hiện trong txn.description)
  const descMatchedKeywords = (() => {
    const txnDesc = (txn.description || "").toLowerCase();
    if (!txnDesc) return [];

    const explicitCodes = [
      invoice.invoiceNo,
      invoice.serialNo,
      invoice.licensePlate,
      invoice.settlementOrder,
    ].filter(Boolean) as string[];

    const matchedCodes = explicitCodes.filter(
      (c) => c && txnDesc.includes(c.toLowerCase()),
    );

    const invWords = (invoice.description || "")
      .split(/[\s,._/-]+/)
      .filter((w) => w.length >= 4);
    const fromInvDesc = invWords.filter((w) =>
      txnDesc.includes(w.toLowerCase()),
    );

    return Array.from(new Set([...matchedCodes, ...fromInvDesc]));
  })();

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
    <div className="w-[780px] max-w-[95vw] max-h-[88vh] p-4 flex flex-col gap-3 text-xs bg-popover/98 backdrop-blur-md rounded-xl border border-border/80 shadow-2xl text-foreground">
      {/* ─── HEADER: TIÊU ĐỀ & CONFIDENCE SCORE ─── */}
      <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm tracking-tight text-foreground">
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
          <SuggestionBadgePill badgeType={score.badge} showShortLabel={true} />
          {score.score !== undefined && (
            <span className="text-[10px] font-mono text-muted-foreground">
              Điểm tin cậy:{" "}
              <strong className="text-foreground font-bold">
                {score.score}
              </strong>
              /100
            </span>
          )}
        </div>
      </div>

      {/* ─── TABLE: SO SÁNH 5 CHIỀU CHUẨN STANDARDIZE-TABLE SPREADSHEET (TABLE-FIXED, OVERFLOW-SCROLL & FULL TEXT) ─── */}
      <div className="rounded-lg border border-border/80 bg-background shadow-xs overflow-auto max-h-[55vh] select-text">
        <Table className="w-full text-left border-collapse table-fixed select-text">
          <colgroup>
            <col className="w-[170px]" />
            <col className="w-[220px]" />
            <col className="w-[240px]" />
            <col className="w-[150px]" />
          </colgroup>
          <TableHeader className="bg-muted/95 backdrop-blur-md sticky top-0 z-10 border-b border-border/80 shadow-xs">
            <TableRow className="hover:bg-transparent border-b border-border/80">
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-r border-border/80">
                Tiêu chí đối soát
              </TableHead>
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-r border-border/80">
                Hóa đơn đang xét
              </TableHead>
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-r border-border/80">
                Giao dịch sao kê
              </TableHead>
              <TableHead className="py-2.5 px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                Đánh giá & Kết quả
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[11px]">
            {/* 1. Số HĐ / Số Tham Chiếu */}
            <TableRow className="hover:bg-muted/30 transition-colors border-b border-border/70">
              <TableCell className="py-2.5 px-3 font-semibold text-foreground border-r border-border/70 align-top">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">Số HĐ / Tham chiếu</span>
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 font-mono border-r border-border/70 align-top">
                <div className="font-bold text-foreground truncate">
                  Số: {invoice.invoiceNo || "—"}
                </div>
                {invoice.serialNo && (
                  <div className="text-[10px] text-muted-foreground truncate">
                    Mẫu: {invoice.serialNo}
                  </div>
                )}
              </TableCell>
              <TableCell className="py-2.5 px-3 font-mono border-r border-border/70 align-top">
                <div
                  className="font-bold text-foreground break-words"
                  title={txn.referenceNumber || txn.seqNo || "—"}
                >
                  Ref: {txn.referenceNumber || txn.seqNo || "—"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 break-words">
                  Số HĐ trong ND:{" "}
                  {score.invoiceNoMatch ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Có ({invoice.invoiceNo})
                    </span>
                  ) : (
                    "Không"
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 text-center align-middle">
                {score.invoiceNoMatch ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] py-0.5 px-2 font-semibold"
                  >
                    ✓ Khớp số HĐ
                  </Badge>
                ) : (
                  <span className="text-muted-foreground font-mono text-[10.5px]">
                    —
                  </span>
                )}
              </TableCell>
            </TableRow>

            {/* 2. Đối tác & MST */}
            <TableRow className="hover:bg-muted/30 transition-colors border-b border-border/70">
              <TableCell className="py-2.5 px-3 font-semibold text-foreground border-r border-border/70 align-top">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">Đối tác & MST</span>
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 border-r border-border/70 align-top">
                <div
                  className="font-semibold text-foreground text-[11px] leading-snug break-words whitespace-normal"
                  title={partnerName || ""}
                >
                  {partnerName || "—"}
                </div>
                {partnerTaxCode && (
                  <div className="font-mono text-[10px] text-muted-foreground mt-0.5 break-words">
                    MST: {partnerTaxCode}
                  </div>
                )}
              </TableCell>
              <TableCell className="py-2.5 px-3 border-r border-border/70 align-top">
                <div
                  className="font-medium text-[11px] leading-snug break-words whitespace-normal"
                  title={txn.correspondentName || "—"}
                >
                  {txn.correspondentName ? (
                    highlightText(txn.correspondentName, matchedKeywords)
                  ) : (
                    <span className="text-muted-foreground font-mono">—</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5 break-words">
                  {txn.bankAccount?.bankName || "Ngân hàng"}:{" "}
                  {txn.bankAccount?.accountNumber || "—"}
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 text-center align-middle">
                {score.correspondentMatch ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] py-0.5 px-2 font-semibold"
                  >
                    ✓ Khớp đối tác
                  </Badge>
                ) : (
                  <span className="text-muted-foreground font-mono text-[10.5px]">
                    —
                  </span>
                )}
              </TableCell>
            </TableRow>

            {/* 3. Số tiền & Cấn trừ */}
            <TableRow className="hover:bg-muted/30 transition-colors border-b border-border/70">
              <TableCell className="py-2.5 px-3 font-semibold text-foreground border-r border-border/70 align-top">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Wallet className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">Số tiền & Công nợ</span>
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 font-mono border-r border-border/70 align-top">
                <div className="truncate">
                  Tổng:{" "}
                  <strong className="text-foreground">
                    {money(invoiceTotal)}
                  </strong>
                </div>
                <div className="text-rose-600 dark:text-rose-400 text-[10.5px] font-semibold truncate">
                  Còn nợ: {money(invoiceRemaining)}
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 font-mono border-r border-border/70 align-top">
                <div className="truncate">
                  GD gốc:{" "}
                  <strong className="text-foreground">
                    {money(txnAmount)}
                  </strong>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 text-[10.5px] font-semibold truncate">
                  Khả dụng: {money(txnRemaining)}
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 text-center align-middle">
                {score.amountMatch ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] py-0.5 px-2 font-semibold"
                  >
                    ✓ Khớp 100% tiền
                  </Badge>
                ) : (
                  <div className="flex flex-col items-center gap-0.5">
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] py-0.5 px-2 font-semibold"
                    >
                      Cấn: {money(amtToApply)}
                    </Badge>
                    <span className="text-[9.5px] text-muted-foreground">
                      Theo còn nợ HĐ
                    </span>
                  </div>
                )}
              </TableCell>
            </TableRow>

            {/* 4. Ngày phát sinh */}
            <TableRow className="hover:bg-muted/30 transition-colors border-b border-border/70">
              <TableCell className="py-2.5 px-3 font-semibold text-foreground border-r border-border/70 align-top">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">Ngày phát sinh</span>
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 font-mono text-foreground border-r border-border/70 align-top">
                {invoice.invoiceDate?.substring(0, 10) || "—"}
              </TableCell>
              <TableCell className="py-2.5 px-3 font-mono text-foreground border-r border-border/70 align-top">
                {formatGMT7(txn.transDate, "date")}
              </TableCell>
              <TableCell className="py-2.5 px-3 text-center align-middle">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] py-0.5 px-2",
                    dateComparison.badgeClass,
                  )}
                >
                  {dateComparison.label}
                </Badge>
              </TableCell>
            </TableRow>

            {/* 5. Nội dung giao dịch & Highlight từ khóa */}
            <TableRow className="hover:bg-muted/30 transition-colors">
              <TableCell className="py-2.5 px-3 font-semibold text-foreground border-r border-border/70 align-top">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Receipt className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">Nội dung GD</span>
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 text-muted-foreground italic break-words whitespace-normal text-[11px] leading-relaxed border-r border-border/70 align-top">
                {invoice.description || "—"}
              </TableCell>
              <TableCell className="py-2.5 px-3 border-r border-border/70 align-top">
                <div className="break-words whitespace-normal text-[11px] leading-relaxed">
                  {highlightText(txn.description, matchedKeywords)}
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-3 text-center align-middle">
                {descMatchedKeywords.length > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] py-0.5 px-2 font-semibold"
                  >
                    Khớp: {descMatchedKeywords.slice(0, 2).join(", ")}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground font-mono text-[10.5px]">
                    —
                  </span>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* ─── FOOTER ACTIONS ─── */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/80 shrink-0">
        <div className="flex items-center gap-2">
          {onManualSelect && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleManualSelectClick}
              className="h-7 text-xs px-2.5 text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1.5"
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
              className="h-7 text-xs px-2.5 text-foreground cursor-pointer flex items-center gap-1.5"
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
