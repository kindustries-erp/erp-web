import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { type SettlementType, type ManualSettlementCategory } from "../types";

interface OffSystemManualSectionProps {
  settlementType: SettlementType;
  currentRemaining: number;
  manualAmount: number;
  setManualAmount: (val: number) => void;
  manualDate: string;
  setManualDate: (val: string) => void;
  manualCategory: ManualSettlementCategory;
  setManualCategory: (val: ManualSettlementCategory) => void;
  manualPartner: string;
  setManualPartner: (val: string) => void;
  manualNote: string;
  setManualNote: (val: string) => void;
}

export function OffSystemManualSection({
  settlementType,
  currentRemaining,
  manualAmount,
  setManualAmount,
  manualDate,
  setManualDate,
  manualCategory,
  setManualCategory,
  manualPartner,
  setManualPartner,
  manualNote,
  setManualNote,
}: OffSystemManualSectionProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  return (
    <DrawerSection
      title={t("manualFormTitle", "Nhập liệu Dòng tiền Ngoài sổ sách")}
      collapsible={true}
      defaultCollapsed={false}
      className="p-3 mb-0 overflow-y-auto scrollbar-thin border border-slate-200/80 dark:border-slate-800"
      bodyClassName="p-0 space-y-3.5"
    >
      {/* Nút Chọn Số Tiền Nhanh */}
      {currentRemaining > 0 && (
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {settlementType === "RECEIPT"
                ? t("quickAmountReceipt", "Gợi ý số tiền thu nhanh")
                : t("quickAmountPayment", "Gợi ý số tiền chi nhanh")}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setManualAmount(currentRemaining)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-800 dark:text-slate-200 hover:text-primary transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>
                {settlementType === "RECEIPT"
                  ? t("fullRemainingReceipt", "Toàn bộ thu còn lại:")
                  : t("fullRemainingPayment", "Toàn bộ chi còn lại:")}
              </span>
              <span className="font-mono font-bold text-primary">
                {money(currentRemaining)}
              </span>
            </button>
            {[0.5, 0.3, 0.2].map((ratio) => {
              const partialVal = Math.round(currentRemaining * ratio);
              if (partialVal <= 0) return null;
              return (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setManualAmount(partialVal)}
                  className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                >
                  {ratio * 100}%: {money(partialVal)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Thẻ Chọn Kênh Tiền Ngoài (Visual Radio Cards) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("manualMethodLabel", "Phương thức Dòng tiền Ngoài sổ sách *")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div
            onClick={() => setManualCategory("TIEN_MAT_NGOAI")}
            className={cn(
              "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
              manualCategory === "TIEN_MAT_NGOAI"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">💵</span>
              {manualCategory === "TIEN_MAT_NGOAI" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t("cashAtCounter", "Tiền mặt tại Quầy")}
              </div>
              <div className="text-[10px] text-slate-500 leading-snug">
                {settlementType === "RECEIPT"
                  ? t(
                      "cashAtCounterDescReceipt",
                      "Thu tiền mặt khi giao nhận xe",
                    )
                  : t(
                      "cashAtCounterDescPayment",
                      "Chi tiền mặt tại quầy/xưởng",
                    )}
              </div>
            </div>
          </div>

          <div
            onClick={() => setManualCategory("CHUYEN_KHOAN_CA_NHAN")}
            className={cn(
              "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
              manualCategory === "CHUYEN_KHOAN_CA_NHAN"
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">📱</span>
              {manualCategory === "CHUYEN_KHOAN_CA_NHAN" && (
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t("bankTransferPersonal", "CK Tài khoản Cá nhân")}
              </div>
              <div className="text-[10px] text-slate-500 leading-snug">
                {t(
                  "bankTransferPersonalDesc",
                  "QR / STK cá nhân không qua cty",
                )}
              </div>
            </div>
          </div>

          <div
            onClick={() => setManualCategory("CHI_PHI_KHAC")}
            className={cn(
              "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
              manualCategory === "CHI_PHI_KHAC"
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-base">🏷️</span>
              {manualCategory === "CHI_PHI_KHAC" && (
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t("otherOffset", "Cấn trừ / Khác")}
              </div>
              <div className="text-[10px] text-slate-500 leading-snug">
                {t("otherOffsetDesc", "Bù trừ công nợ hoặc chi phí phát sinh")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields Card */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>
                {settlementType === "RECEIPT"
                  ? t("manualAmountReceipt", "Số tiền thu (VNĐ) *")
                  : t("manualAmountPayment", "Số tiền chi (VNĐ) *")}
              </span>
              {manualAmount > 0 && (
                <span className="text-[10px] font-mono font-bold text-primary">
                  {money(manualAmount)}
                </span>
              )}
            </label>
            <Input
              type="number"
              min={0}
              value={manualAmount || ""}
              onChange={(e) => setManualAmount(Number(e.target.value))}
              placeholder="Nhập số tiền..."
              className="h-10 text-sm font-bold font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t("manualDate", "Ngày giao dịch *")}
            </label>
            <Input
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="h-10 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {settlementType === "RECEIPT"
              ? t("manualPartnerReceipt", "Đối tác / Người nộp tiền")
              : t("manualPartnerPayment", "Đối tác / Người nhận tiền")}
          </label>
          <Input
            value={manualPartner}
            onChange={(e) => setManualPartner(e.target.value)}
            placeholder={
              settlementType === "RECEIPT"
                ? t(
                    "manualPartnerPlaceholderReceipt",
                    "Tên khách hàng hoặc người nộp...",
                  )
                : t(
                    "manualPartnerPlaceholderPayment",
                    "Tên nhà cung cấp, thợ, người nhận...",
                  )
            }
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t("manualNoteLabel", "Ghi chú & Diễn giải giao dịch")}
          </label>
          <Textarea
            rows={2}
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            placeholder={
              settlementType === "RECEIPT"
                ? t(
                    "manualNotePlaceholderReceipt",
                    "Lý do thu tiền, nội dung chứng từ...",
                  )
                : t(
                    "manualNotePlaceholderPayment",
                    "Nội dung chi phí, tiền phụ tùng, công thợ...",
                  )
            }
            className="text-xs resize-none"
          />
        </div>
      </div>
    </DrawerSection>
  );
}
