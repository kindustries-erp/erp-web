import React from "react";
import { DrawerField } from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { useT } from "@/core/i18n";
import type { CreateGarageCashflowVoucherDto } from "../../../api/garageCashflowApi";

interface GarageCashflowDrawerStatusFieldProps {
  voucherType?: "RECEIPT" | "PAYMENT" | string;
  paymentStatus?: string;
  isPaymentLocked?: boolean;
  paymentStatusOptions: Array<{ label: string; value: string }>;
  receiptStatusOptions: Array<{ label: string; value: string }>;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<CreateGarageCashflowVoucherDto>>
  >;
}

export const GarageCashflowDrawerStatusField: React.FC<
  GarageCashflowDrawerStatusFieldProps
> = ({
  voucherType,
  paymentStatus,
  isPaymentLocked,
  paymentStatusOptions,
  receiptStatusOptions,
  setFormData,
}) => {
  const t = useT();

  return (
    <DrawerField
      label={t("garage:cashflowDrawer.paymentStatus", "Trạng thái thanh toán")}
      required
    >
      {voucherType === "PAYMENT" ? (
        <>
          <Combobox
            value={paymentStatus || "PENDING"}
            disabled={isPaymentLocked}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, paymentStatus: val as any }))
            }
            options={paymentStatusOptions}
            placeholder={t(
              "garage:cashflowDrawer.selectPlaceholder",
              "— Chọn —",
            )}
          />
          {isPaymentLocked && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "garage:cashflowDrawer.paymentStatusLocked",
                "Phiếu đã chi, không thể cập nhật lại trạng thái thanh toán.",
              )}
            </p>
          )}
        </>
      ) : (
        <Combobox
          value={paymentStatus || "PAID"}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, paymentStatus: val as any }))
          }
          options={receiptStatusOptions}
          placeholder={t("garage:cashflowDrawer.selectPlaceholder", "— Chọn —")}
        />
      )}
    </DrawerField>
  );
};
