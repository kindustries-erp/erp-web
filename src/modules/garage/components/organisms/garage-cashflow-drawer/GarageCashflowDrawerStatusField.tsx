import React from "react";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
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

  if (voucherType === "PAYMENT") {
    return (
      <div className="w-full">
        <V2Combobox
          value={paymentStatus || "PENDING"}
          disabled={isPaymentLocked}
          onValueChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              paymentStatus: (val || "PENDING") as any,
            }))
          }
          options={paymentStatusOptions}
          placeholder={t("garage:cashflowDrawer.selectPlaceholder", "— Chọn —")}
          searchable={false}
        />
        {isPaymentLocked && (
          <V2Text
            color="muted"
            variant="body-sm"
            className="mt-1 leading-tight"
          >
            {t(
              "garage:cashflowDrawer.paymentStatusLocked",
              "Phiếu đã chi, không thể cập nhật lại trạng thái thanh toán.",
            )}
          </V2Text>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <V2Combobox
        value={paymentStatus || "PAID"}
        onValueChange={(val) =>
          setFormData((prev) => ({
            ...prev,
            paymentStatus: (val || "PAID") as any,
          }))
        }
        options={receiptStatusOptions}
        placeholder={t("garage:cashflowDrawer.selectPlaceholder", "— Chọn —")}
        searchable={false}
      />
    </div>
  );
};
