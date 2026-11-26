import * as React from "react";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { voucherNameIfDiffers } from "./garageCustomerName.helper";

export interface GarageVoucherNameTextProps {
  customerName: string | null | undefined;
  voucherName: string | null | undefined;
  className?: string;
}

/** Dòng phụ "Trên phiếu: …", chỉ hiện khi tên trên phiếu khác tên khách danh mục. */
export function GarageVoucherNameText({
  customerName,
  voucherName,
  className,
}: GarageVoucherNameTextProps) {
  const { t } = useV2Translation();
  const voucher = voucherNameIfDiffers(customerName, voucherName);
  if (!voucher) return null;
  const label = t("v2.garageCases.customer.onVoucher", "Trên phiếu");
  return (
    <V2Text
      variant="caption"
      color="muted"
      truncate
      data-testid="garage-voucher-name"
      title={`${label}: ${voucher}`}
      className={cn("italic", className)}
    >
      {label}: {voucher}
    </V2Text>
  );
}
