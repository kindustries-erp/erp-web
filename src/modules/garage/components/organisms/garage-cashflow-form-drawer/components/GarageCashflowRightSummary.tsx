import React from "react";
import { FileText, Landmark, Clock, CheckCircle } from "lucide-react";
import { formatNumber } from "@/modules/garage/components/organisms/garage-case-preview/GarageCasePreview.helper";
import type {
  CaseOptionItem,
  BankTxnOptionItem,
} from "../GarageCashflowFormDrawer.type";

export interface GarageCashflowRightSummaryProps {
  selectedCase?: CaseOptionItem;
  selectedBankTxn?: BankTxnOptionItem;
  currentAmount: number;
  settlementType: "RECEIPT" | "PAYMENT";
  t: (key: string, fallback?: string) => string;
}

export function GarageCashflowRightSummary({
  selectedCase,
  selectedBankTxn,
  currentAmount,
  settlementType,
  t,
}: GarageCashflowRightSummaryProps) {
  const isReceipt = settlementType === "RECEIPT";

  // Tính số nợ dự kiến sau khi cấn trừ dòng tiền này
  const remainingAfter = selectedCase
    ? Math.max(
        0,
        Number(selectedCase.tienConPhaiThanhToan || 0) -
          (isReceipt ? Number(currentAmount || 0) : 0),
      )
    : 0;

  return (
    <div className="space-y-4 text-xs">
      {/* ── CARD 1: TÓM TẮT PHIẾU DỊCH VỤ ── */}
      <div className="p-3 bg-card rounded-lg border border-border/70 space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border/50 pb-2">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>
            {t("cases.cashflow.summaryCaseTitle", "Phiếu Dịch Vụ Cấn Trừ")}
          </span>
        </div>

        {selectedCase ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số chứng từ:</span>
              <span className="font-semibold text-primary">
                {selectedCase.soChungTu}
              </span>
            </div>
            {selectedCase.bienSoXe && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biển số xe:</span>
                <span className="font-mono font-medium">
                  {selectedCase.bienSoXe}
                </span>
              </div>
            )}
            {selectedCase.tenKhachHang && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khách hàng:</span>
                <span className="truncate max-w-[130px] font-medium">
                  {selectedCase.tenKhachHang}
                </span>
              </div>
            )}
            <div className="border-t border-dashed border-border/60 pt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền phiếu:</span>
                <span className="tabular-nums font-semibold">
                  {formatNumber(selectedCase.tienCoThue)} ₫
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <span className="tabular-nums text-emerald-600 font-medium">
                  {formatNumber(selectedCase.tienDaThanhToan)} ₫
                </span>
              </div>
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>Còn nợ hiện tại:</span>
                <span className="tabular-nums">
                  {formatNumber(selectedCase.tienConPhaiThanhToan)} ₫
                </span>
              </div>
            </div>

            {Number(currentAmount || 0) > 0 && isReceipt && (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-0.5">
                <div className="flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle className="w-3 h-3" />
                  <span>Dự kiến sau khi thu:</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>Còn nợ mới:</span>
                  <span className="font-bold tabular-nums">
                    {formatNumber(remainingAfter)} ₫
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground/70 italic text-center py-3">
            {t(
              "cases.cashflow.noCaseSelected",
              "Chưa chọn phiếu dịch vụ cấn trừ.",
            )}
          </div>
        )}
      </div>

      {/* ── CARD 2: SAO KÊ THAM CHIẾU ── */}
      <div className="p-3 bg-card rounded-lg border border-border/70 space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-foreground border-b border-border/50 pb-2">
          <Landmark className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {t("cases.cashflow.summaryBankTitle", "Sao Kê Tham Chiếu")}
          </span>
        </div>

        {selectedBankTxn ? (
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày GD:</span>
              <span className="font-mono">
                {selectedBankTxn.transDate || "---"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số tiền:</span>
              <span className="font-semibold text-emerald-600 tabular-nums">
                {formatNumber(selectedBankTxn.amount)} ₫
              </span>
            </div>
            {selectedBankTxn.description && (
              <div className="text-[11px] text-muted-foreground bg-muted/30 p-1.5 rounded font-mono truncate">
                {selectedBankTxn.description}
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground/70 italic text-center py-2">
            {t("cases.cashflow.noBankSelected", "Không gắn giao dịch sao kê.")}
          </div>
        )}
      </div>

      {/* ── CARD 3: AUDIT & GHI CHÚ QUY TRÌNH ── */}
      <div className="p-2.5 bg-muted/20 rounded border border-border/40 text-[11px] text-muted-foreground space-y-1">
        <div className="flex items-center gap-1 font-semibold text-foreground">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span>Lưu ý nghiệp vụ</span>
        </div>
        <p>
          • Số tiền thu sẽ được cấn trừ tức thì vào công nợ của phiếu dịch vụ.
        </p>
        <p>• Dòng sao kê chỉ mang tính chất tham chiếu đối chiếu sổ quỹ.</p>
      </div>
    </div>
  );
}
