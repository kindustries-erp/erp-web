import React from "react";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Landmark, Wallet, FileText } from "lucide-react";
import { formatNumber } from "@/modules/garage/components/organisms/garage-case-preview/GarageCasePreview.helper";
import type {
  GarageCashflowFormData,
  CaseOptionItem,
  BankTxnOptionItem,
} from "../GarageCashflowFormDrawer.type";

export interface GarageCashflowLeftFormProps {
  formData: GarageCashflowFormData;
  onChange: (field: keyof GarageCashflowFormData, val: any) => void;
  caseOptions: CaseOptionItem[];
  bankTxnOptions: BankTxnOptionItem[];
  fixedCaseCode?: string;
  isReadOnly?: boolean;
  t: (key: string, fallback?: string) => string;
}

export function GarageCashflowLeftForm({
  formData,
  onChange,
  caseOptions,
  bankTxnOptions,
  fixedCaseCode,
  isReadOnly,
  t,
}: GarageCashflowLeftFormProps) {
  const isReceipt = formData.settlementType === "RECEIPT";

  return (
    <div className="space-y-4">
      {/* ── THÔNG TIN THU CHI ── */}
      <DrawerSection
        title={t(
          "cases.cashflow.sectionGeneral",
          "Thông tin Giao dịch Thu/Chi",
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DrawerField
            label={t("cases.cashflow.typeLabel", "Loại giao dịch")}
            required
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => onChange("settlementType", "RECEIPT")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  isReceipt
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                {t("cases.cashflow.receipt", "Thu tiền (Khách / BH)")}
              </button>
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => onChange("settlementType", "PAYMENT")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  !isReceipt
                    ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                {t("cases.cashflow.payment", "Chi tiền (Gia công / Vật tư)")}
              </button>
            </div>
          </DrawerField>

          <DrawerField
            label={t("cases.cashflow.amountLabel", "Số tiền (VNĐ)")}
            required
          >
            <input
              type="number"
              min="0"
              step="1000"
              disabled={isReadOnly}
              value={formData.amount || ""}
              onChange={(e) => onChange("amount", Number(e.target.value))}
              className={`${inputCls} font-semibold tabular-nums`}
              placeholder="0"
            />
            {Number(formData.amount || 0) > 0 && (
              <div className="text-[11px] text-muted-foreground font-mono text-right mt-1">
                {formatNumber(formData.amount)} ₫
              </div>
            )}
          </DrawerField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DrawerField
            label={t("cases.cashflow.methodLabel", "Phương thức")}
            required
          >
            <select
              disabled={isReadOnly}
              value={formData.paymentMethod || "BANK_TRANSFER"}
              onChange={(e) => onChange("paymentMethod", e.target.value)}
              className={inputCls}
            >
              <option value="BANK_TRANSFER">🏦 Chuyển khoản ngân hàng</option>
              <option value="CASH">💵 Tiền mặt tại xưởng</option>
              <option value="POS">💳 Quẹt thẻ POS</option>
              <option value="OTHER">⚪ Khác</option>
            </select>
          </DrawerField>

          <DrawerField
            label={t("cases.cashflow.dateLabel", "Ngày phát sinh")}
            required
          >
            <input
              type="date"
              disabled={isReadOnly}
              value={formData.transDate || ""}
              onChange={(e) => onChange("transDate", e.target.value)}
              className={inputCls}
            />
          </DrawerField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DrawerField
            label={t("cases.cashflow.partnerLabel", "Người nộp / nhận")}
          >
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.partnerName || ""}
              onChange={(e) => onChange("partnerName", e.target.value)}
              className={inputCls}
              placeholder="Ví dụ: Anh Hùng, Tiệm Tiện Đĩa..."
            />
          </DrawerField>

          <DrawerField
            label={t(
              "cases.cashflow.receiptNumberLabel",
              "Mã biên lai / Số HĐ",
            )}
          >
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.receiptNumber || ""}
              onChange={(e) => onChange("receiptNumber", e.target.value)}
              className={inputCls}
              placeholder="PT-001, UNC-..."
            />
          </DrawerField>
        </div>
      </DrawerSection>

      {/* ── CẤN TRỪ VÀ THAM CHIẾU ── */}
      <DrawerSection
        title={t("cases.cashflow.sectionLink", "Cấn trừ Số phiếu & Tham chiếu")}
      >
        <DrawerField
          label={t(
            "cases.cashflow.caseLink",
            "Cấn trừ Phiếu Dịch Vụ (Báo giá)",
          )}
        >
          {fixedCaseCode ? (
            <div className="flex items-center gap-2 p-2 bg-muted/40 rounded border border-border/60 text-xs font-semibold">
              <FileText className="w-4 h-4 text-primary" />
              <span>{fixedCaseCode}</span>
              <span className="text-muted-foreground text-[11px]">
                (Đang mở trong báo giá)
              </span>
            </div>
          ) : (
            <select
              disabled={isReadOnly}
              value={formData.caseId || ""}
              onChange={(e) => onChange("caseId", e.target.value || undefined)}
              className={inputCls}
            >
              <option value="">-- Không cấn trừ (Chi phí chung) --</option>
              {caseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.soChungTu} {c.bienSoXe ? `• ${c.bienSoXe}` : ""}{" "}
                  {c.tenKhachHang ? `• ${c.tenKhachHang}` : ""} (Còn nợ:{" "}
                  {formatNumber(c.tienConPhaiThanhToan)} ₫)
                </option>
              ))}
            </select>
          )}
        </DrawerField>

        <DrawerField
          label={t(
            "cases.cashflow.bankTxnLink",
            "Sao kê Ngân hàng (Tham chiếu)",
          )}
        >
          <select
            disabled={isReadOnly}
            value={formData.bankTransactionId || ""}
            onChange={(e) =>
              onChange("bankTransactionId", e.target.value || undefined)
            }
            className={inputCls}
          >
            <option value="">-- Không gắn sao kê --</option>
            {bankTxnOptions.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.transDate} • {formatNumber(bt.amount)} ₫ •{" "}
                {bt.description?.slice(0, 50)}
              </option>
            ))}
          </select>
        </DrawerField>

        <DrawerField label={t("cases.cashflow.noteLabel", "Ghi chú")}>
          <textarea
            rows={2}
            disabled={isReadOnly}
            value={formData.note || ""}
            onChange={(e) => onChange("note", e.target.value)}
            className={inputCls}
            placeholder="Nội dung chi tiết thu/chi..."
          />
        </DrawerField>
      </DrawerSection>
    </div>
  );
}
