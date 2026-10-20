import React from "react";
import { inputCls } from "@/shared/components/DrawerModal";
import { readVietnameseCurrency } from "@/shared/utils/format";
import type { useGarageOpexDrawer } from "./garage-opex-drawer.hook";

interface GarageOpexAmountFieldsProps {
  form: ReturnType<typeof useGarageOpexDrawer>;
  isView: boolean;
}

export function GarageOpexAmountFields({
  form,
  isView,
}: GarageOpexAmountFieldsProps) {
  const {
    categoryKey,
    amount,
    setAmount,
    ojAmount,
    setOjAmount,
    loading,
    isReadOnlyRecord,
    t,
  } = form;

  const numAmount = Number(amount.replace(/[^0-9.-]+/g, "")) || 0;
  const numOjAmount = Number(ojAmount.replace(/[^0-9.-]+/g, "")) || 0;

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            {t("opex.drawer.amountLabel", "Số tiền (VND) (*)")}
          </span>
          {categoryKey === "HOA_HONG_KHAC" && !isView && (
            <span className="text-[11px] text-muted-foreground italic">
              {t(
                "opex.amountPositiveNegativeHint",
                "Số âm (-) giảm, số dương (+) tăng",
              )}
            </span>
          )}
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isView || loading || isReadOnlyRecord}
          className={`${inputCls} tabular-nums text-right font-semibold`}
          step="1000"
        />
        {numAmount !== 0 && (
          <div className="mt-1.5 px-2.5 py-1.5 rounded-md bg-muted/40 border border-border/60 flex flex-col gap-0.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Định dạng số:</span>
              <span
                className={`font-mono font-bold ${numAmount < 0 ? "text-red-500" : "text-foreground"}`}
              >
                {numAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <p className="text-muted-foreground italic font-medium leading-tight pt-0.5">
              Bằng chữ:{" "}
              <span className="text-foreground font-semibold">
                {numAmount < 0
                  ? `(Giảm trừ) ${readVietnameseCurrency(Math.abs(numAmount))}`
                  : readVietnameseCurrency(numAmount)}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="my-1 p-3 rounded-lg border border-border/80 bg-muted/30 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            {t("opex.drawer.ojAmountLabel", "Số tiền tính cho OJ (VND)")}
          </span>
          {!isView && !loading && numAmount > 0 && (
            <button
              type="button"
              onClick={() => setOjAmount(String(numAmount))}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              {t("opex.drawer.set100Oj", "100% tính cho OJ")}
            </button>
          )}
        </div>
        <input
          type="number"
          value={ojAmount}
          onChange={(e) => setOjAmount(e.target.value)}
          disabled={isView || loading}
          className={`${inputCls} tabular-nums text-right font-semibold`}
          min="0"
          step="1000"
        />
        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
          <span>{t("opex.drawer.ojAmountHint", "Ghi nhận riêng cho OJ")}</span>
          {numOjAmount > 0 && numAmount > 0 && (
            <span className="font-semibold font-mono text-foreground">
              {((numOjAmount / numAmount) * 100).toFixed(1)}% khoản chi
            </span>
          )}
        </div>
      </div>
    </>
  );
}
