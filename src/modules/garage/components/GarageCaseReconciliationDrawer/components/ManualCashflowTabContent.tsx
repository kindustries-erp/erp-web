import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { readVietnameseCurrency } from "../utils";
import type { ManualCashflowTabContentProps } from "../types";

export function ManualCashflowTabContent({
  settlementType,
  baseRemaining,
  manualAmount,
  manualCategory,
  manualDate,
  manualPartner,
  manualNote,
  onSetManualAmount,
  onSetManualCategory,
  onSetManualDate,
  onSetManualPartner,
  onSetManualNote,
}: ManualCashflowTabContentProps) {
  const { t } = useTranslation(["garage", "common"]);

  return (
    <div className="space-y-3 pb-2">
      <DrawerSection
        title={t(
          "cases.reconciliation.manualTitle",
          "Thông tin chi tiết Dòng tiền Ngoài sổ sách",
        )}
        collapsible={true}
        defaultCollapsed={false}
        className="mb-0 p-3"
        bodyClassName="p-0 space-y-4"
      >
        {/* Quick % Selection Buttons */}
        {baseRemaining > 0 && (
          <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {t(
                  "cases.reconciliation.quickPick",
                  "Gợi ý chọn nhanh số tiền",
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSetManualAmount(baseRemaining)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-800 dark:text-slate-200 hover:text-primary transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>
                  {settlementType === "RECEIPT"
                    ? t(
                        "cases.reconciliation.allReceiptRemaining",
                        "Toàn bộ thu còn lại:",
                      )
                    : t(
                        "cases.reconciliation.allPaymentRemaining",
                        "Toàn bộ chi còn lại:",
                      )}
                </span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    settlementType === "RECEIPT"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {money(baseRemaining)}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onSetManualAmount(Math.round(baseRemaining * 0.5))
                }
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-2xs cursor-pointer"
              >
                50% ({money(Math.round(baseRemaining * 0.5))})
              </button>
              <button
                type="button"
                onClick={() =>
                  onSetManualAmount(Math.round(baseRemaining * 0.3))
                }
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-2xs cursor-pointer"
              >
                30% ({money(Math.round(baseRemaining * 0.3))})
              </button>
            </div>
          </div>
        )}

        {/* Visual Radio Cards for Channel */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t(
              "cases.reconciliation.channel",
              "Phương thức Dòng tiền Ngoài sổ sách *",
            )}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div
              onClick={() => onSetManualCategory("TIEN_MAT_NGOAI")}
              className={cn(
                "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                manualCategory === "TIEN_MAT_NGOAI"
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {t("cases.reconciliation.channelCash", "💵 Tiền mặt ngoài")}
                </span>
                {manualCategory === "TIEN_MAT_NGOAI" && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {t(
                  "cases.reconciliation.channelCashDesc",
                  "Thu/chi tiền mặt trực tiếp không qua sổ quỹ công ty",
                )}
              </span>
            </div>

            <div
              onClick={() => onSetManualCategory("CHUYEN_KHOAN_CA_NHAN")}
              className={cn(
                "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                manualCategory === "CHUYEN_KHOAN_CA_NHAN"
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {t(
                    "cases.reconciliation.channelBankPersonal",
                    "🏦 CK Cá nhân",
                  )}
                </span>
                {manualCategory === "CHUYEN_KHOAN_CA_NHAN" && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {t(
                  "cases.reconciliation.channelBankPersonalDesc",
                  "Tài khoản ngân hàng cá nhân ngoài hệ thống ERP",
                )}
              </span>
            </div>

            <div
              onClick={() => onSetManualCategory("KHAC")}
              className={cn(
                "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                manualCategory === "KHAC"
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {t("cases.reconciliation.channelOther", "✨ Hình thức khác")}
                </span>
                {manualCategory === "KHAC" && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {t(
                  "cases.reconciliation.channelOtherDesc",
                  "Cấn trừ nợ đối ứng, bù trừ dịch vụ đặc thù",
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>
                {t("cases.reconciliation.amount", "Số tiền ghi nhận (VNĐ) *")}
              </span>
              {Number(manualAmount) > 0 && (
                <span className="text-[11px] text-primary font-medium italic">
                  {readVietnameseCurrency(Number(manualAmount))}
                </span>
              )}
            </label>
            <Input
              type="number"
              value={manualAmount}
              onChange={(e) => onSetManualAmount(e.target.value)}
              placeholder="0"
              min={0}
              className="font-mono text-base font-bold text-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t(
                "cases.reconciliation.transDate",
                "Ngày phát sinh giao dịch *",
              )}
            </label>
            <Input
              type="date"
              value={manualDate}
              onChange={(e) => onSetManualDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t(
                "cases.reconciliation.payerOrReceiver",
                "Người nộp / Người nhận / Đối tác liên quan",
              )}
            </label>
            <Input
              value={manualPartner}
              onChange={(e) => onSetManualPartner(e.target.value)}
              placeholder={t(
                "cases.reconciliation.payerOrReceiverPlaceholder",
                "Ví dụ: Anh Nam (Tài xế), Chị Hương...",
              )}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t(
                "cases.reconciliation.manualNote",
                "Ghi chú & Diễn giải chi tiết",
              )}
            </label>
            <Textarea
              value={manualNote}
              onChange={(e) => onSetManualNote(e.target.value)}
              placeholder={t(
                "cases.reconciliation.manualNotePlaceholder",
                "Nhập lý do thu/chi ngoài sổ sách...",
              )}
              rows={3}
            />
          </div>
        </div>
      </DrawerSection>
    </div>
  );
}
