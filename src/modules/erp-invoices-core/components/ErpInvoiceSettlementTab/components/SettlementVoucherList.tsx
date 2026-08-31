import { useTranslation } from "react-i18next";
import { Landmark, Plus, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { type ActiveVoucherItem } from "../types";

interface SettlementVoucherListProps {
  direction?: "IN" | "OUT";
  editMode: boolean;
  activeVouchers: ActiveVoucherItem[];
  saving: boolean;
  onOpenModal: () => void;
  onOpenBankVoucher: (id: string) => void;
  onUnlinkVoucher: (item: ActiveVoucherItem) => void;
}

export function SettlementVoucherList({
  direction = "OUT",
  editMode,
  activeVouchers,
  saving,
  onOpenModal,
  onOpenBankVoucher,
  onUnlinkVoucher,
}: SettlementVoucherListProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  return (
    <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-3.5 h-3.5 text-slate-500" />
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            {direction === "IN"
              ? t(
                  "paymentVouchersIn",
                  "Chứng từ thanh toán (Ủy nhiệm chi / Phiếu chi)",
                )
              : t(
                  "paymentVouchersOut",
                  "Chứng từ thu tiền (Giấy báo có / Phiếu thu)",
                )}
          </h5>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {activeVouchers.length}
          </span>
        </div>

        {editMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenModal}
            className="h-6 text-[11px] px-2 gap-1 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            {t("btnReconcileCashflow", "Đối soát Dòng tiền")}
          </Button>
        )}
      </div>

      {activeVouchers.length > 0 ? (
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {activeVouchers.map((v) => (
            <div
              key={v.id}
              className="px-3 py-2 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-all"
            >
              <div className="space-y-0.5 max-w-[65%]">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {v.bankName}
                  </span>

                  {v.isPending && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                      {t("pendingSaveBadge", "Chờ lưu")}
                    </span>
                  )}

                  <span
                    className="font-mono text-xs cursor-pointer text-primary hover:underline flex items-center gap-1"
                    onClick={() => onOpenBankVoucher(v.bankTransactionId)}
                  >
                    {v.refNo}
                    <ExternalLink className="w-3 h-3 text-slate-400 inline" />
                  </span>

                  {v.transDate && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(v.transDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>

                <div className="text-slate-500 text-[11px] truncate">
                  {v.partnerName ? `${v.partnerName} - ` : ""}
                  {v.description}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-right font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums text-xs">
                  {money(v.amount)}
                </div>

                {editMode && (
                  <button
                    type="button"
                    onClick={() => onUnlinkVoucher(v)}
                    disabled={saving}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title={t("common:delete", "Xóa")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          {direction === "IN"
            ? t(
                "noSettlementDocsIn",
                "Chưa có chứng từ thanh toán nào được cấn trừ cho hóa đơn này.",
              )
            : t(
                "noSettlementDocsOut",
                "Chưa có chứng từ thu tiền nào được cấn trừ cho hóa đơn này.",
              )}
        </div>
      )}
    </div>
  );
}
