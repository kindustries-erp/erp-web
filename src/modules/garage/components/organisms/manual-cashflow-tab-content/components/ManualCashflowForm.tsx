import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/Button";
import { DatePicker } from "@/shared/components/DatePicker";
import { readVietnameseCurrency } from "@/modules/garage/components/GarageCaseReconciliationDrawer/utils";
import type { ManualCashflowFormProps } from "../ManualCashflowTabContent.type";

export function ManualCashflowForm({
  editMode = false,
  settlementType,
  manualAmount,
  manualDate,
  manualPartner,
  manualNote,
  onSetManualAmount,
  onSetManualDate,
  onSetManualPartner,
  onSetManualNote,
  onAddManualSettlement,
  manualDraftPending,
}: ManualCashflowFormProps) {
  const { t } = useTranslation(["garage", "common"]);

  if (!editMode) return null;

  return (
    <div className="space-y-3.5">
      {/* Hàng 1: Người nộp/nhận - Số tiền - Ngày phát sinh (3 Cột trên cùng 1 hàng) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t("cases.reconciliation.payerOrReceiver", "Người nộp / nhận")}
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

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>{t("cases.reconciliation.amount", "Số tiền (VNĐ) *")}</span>
            {Number(manualAmount) > 0 && (
              <span className="text-[10px] text-primary font-medium italic truncate max-w-[140px]">
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
            className="font-mono text-sm font-bold text-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t("cases.reconciliation.transDate", "Ngày phát sinh *")}
          </label>
          <DatePicker
            value={manualDate}
            onChange={onSetManualDate}
            className="w-full"
            placeholder={t("common.chooseDate", "Chọn ngày")}
          />
        </div>
      </div>

      {/* Hàng 2: Ghi chú & Diễn giải chi tiết */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {t("cases.reconciliation.manualNote", "Ghi chú & Diễn giải chi tiết")}
        </label>
        <Textarea
          value={manualNote}
          onChange={(e) => onSetManualNote(e.target.value)}
          placeholder={t(
            "cases.reconciliation.manualNotePlaceholder",
            "Nhập lý do thu/chi ngoài sổ sách...",
          )}
          rows={2}
        />
      </div>

      {/* Hàng 3: Hướng dẫn & Nút Thêm vào danh sách */}
      {onAddManualSettlement && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800">
          <div className="text-xs text-muted-foreground w-full sm:w-auto">
            {Number(manualAmount) > 0 || manualDraftPending ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                {t(
                  "cases.reconciliation.manualDraftHint",
                  'Đang có số tiền chưa thêm. Bấm "Thêm vào danh sách" để đưa vào danh sách chờ trước khi Lưu thay đổi.',
                )}
              </span>
            ) : (
              <span>
                {settlementType === "RECEIPT"
                  ? t(
                      "cases.reconciliation.manualReceiptGuidance",
                      "Nhập thông tin khoản thu ngoài sổ rồi bấm Thêm vào danh sách.",
                    )
                  : t(
                      "cases.reconciliation.manualPaymentGuidance",
                      "Nhập thông tin khoản chi ngoài sổ rồi bấm Thêm vào danh sách.",
                    )}
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAddManualSettlement}
            disabled={!manualAmount || Number(manualAmount) <= 0}
            className="w-full sm:w-auto font-medium cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>
              {t("cases.reconciliation.addManualToList", "Thêm vào danh sách")}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
