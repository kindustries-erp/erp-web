import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import { Calendar, RefreshCw, Layers, CheckCircle2 } from "lucide-react";

export type RecurringApplyScope = "this" | "this_and_future";

interface OpexRecurringConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (scope: RecurringApplyScope) => Promise<void> | void;
  loading?: boolean;
  currentPeriod: { month: number; year: number };
  untilPeriod?: { month: number; year: number };
  amount: number;
  categoryName: string;
}

export function OpexRecurringConfirmModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  currentPeriod,
  untilPeriod,
  amount,
  categoryName,
}: OpexRecurringConfirmModalProps) {
  const { t } = useTranslation("garage");
  const [scope, setScope] = useState<RecurringApplyScope>("this_and_future");

  const curMonthStr = `${String(currentPeriod.month).padStart(2, "0")}/${currentPeriod.year}`;

  // Compute number of periods affected for "this_and_future"
  const untilMonth = untilPeriod?.month || currentPeriod.month;
  const untilYear = untilPeriod?.year || currentPeriod.year + 1;
  const untilStr = `${String(untilMonth).padStart(2, "0")}/${untilYear}`;

  let totalPeriods = 1;
  let curY = currentPeriod.year;
  let curM = currentPeriod.month;
  while (curY < untilYear || (curY === untilYear && curM <= untilMonth)) {
    totalPeriods++;
    curM++;
    if (curM > 12) {
      curM = 1;
      curY++;
    }
  }
  // Subtract 1 because loop starts at currentPeriod
  const periodCount = Math.max(totalPeriods - 1, 1);

  const handleConfirm = () => {
    void onConfirm(scope);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent className="max-w-[460px] p-6 bg-card border border-border shadow-xl rounded-xl">
        <DialogHeader className="text-left space-y-2 mb-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-base">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <RefreshCw className="w-4 h-4 text-primary animate-spin-slow" />
            </div>
            <DialogTitle className="text-sm font-bold text-foreground">
              {t("opex.recurringModal.title", "Áp dụng thay đổi định kỳ")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {t(
              "opex.recurringModal.desc",
              "Khoản chi phí này thuộc chuỗi định kỳ lặp lại hàng tháng. Vui lòng chọn phạm vi áp dụng thay đổi:",
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Scope Options */}
        <div className="flex flex-col gap-2.5 my-3">
          {/* Option 1: Chỉ phiếu này */}
          <label
            onClick={() => setScope("this")}
            className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
              scope === "this"
                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                : "border-border/70 hover:border-border hover:bg-muted/30 text-muted-foreground"
            }`}
          >
            <input
              type="radio"
              name="recurringScope"
              checked={scope === "this"}
              onChange={() => setScope("this")}
              className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
            />
            <div className="flex flex-col gap-0.5 text-xs flex-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {t(
                    "opex.recurringModal.scopeThis",
                    "Chỉ áp dụng cho phiếu tháng này",
                  )}{" "}
                  ({curMonthStr})
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {t(
                  "opex.recurringModal.scopeThisDesc",
                  "Chỉ thay đổi số tiền / thông tin của kỳ hiện tại. Các tháng khác giữ nguyên.",
                )}
              </p>
            </div>
          </label>

          {/* Option 2: Phiếu này và tất cả về sau */}
          <label
            onClick={() => setScope("this_and_future")}
            className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
              scope === "this_and_future"
                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                : "border-border/70 hover:border-border hover:bg-muted/30 text-muted-foreground"
            }`}
          >
            <input
              type="radio"
              name="recurringScope"
              checked={scope === "this_and_future"}
              onChange={() => setScope("this_and_future")}
              className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
            />
            <div className="flex flex-col gap-0.5 text-xs flex-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>
                  {t(
                    "opex.recurringModal.scopeThisAndFuture",
                    "Phiếu này và tất cả các phiếu về sau",
                  )}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {t(
                  "opex.recurringModal.scopeThisAndFutureDesc",
                  "Cập nhật từ {{from}} đến {{to}} (tổng cộng {{count}} kỳ định kỳ).",
                  {
                    from: curMonthStr,
                    to: untilStr,
                    count: periodCount,
                  },
                )}
              </p>
            </div>
          </label>
        </div>

        {/* Summary Details Info Box */}
        <div className="p-3 bg-muted/40 rounded-lg border border-border/60 text-xs flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>{t("opex.recurringModal.category", "Khoản chi")}:</span>
            <span className="font-semibold text-foreground">
              {categoryName || "—"}
            </span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>
              {t("opex.recurringModal.newAmount", "Số tiền áp dụng")}:
            </span>
            <span className="font-bold text-foreground font-mono">
              {amount.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 mt-4 sm:space-x-0">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            {t("common.cancel", "Hủy")}
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            disabled={loading}
            className="text-xs min-w-[120px] gap-1.5"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>
              {loading
                ? t("common.saving", "Đang xử lý...")
                : t("opex.recurringModal.confirmApply", "Xác nhận áp dụng")}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
