import { useQuery } from "@tanstack/react-query";
import type { NetOffPartnerType } from "../../domain/rules/debtNetOffRules";
import { debtNetOffV2Api } from "../debtNetOffApi";
import { invoiceDebtsKeys } from "./invoiceDebtsKeys";

interface Params {
  taxCode: string;
  partnerType: NetOffPartnerType;
  enabled: boolean;
}

/** Hóa đơn của đối tác cho drawer cấn trừ; chỉ tải khi drawer đang mở */
export function useDebtNetOffInvoicesQuery({
  taxCode,
  partnerType,
  enabled,
}: Params) {
  return useQuery({
    queryKey: [
      ...invoiceDebtsKeys.all,
      "net-off-invoices",
      partnerType,
      taxCode,
    ],
    queryFn: () => debtNetOffV2Api.listPartnerInvoices(taxCode, partnerType),
    enabled: enabled && Boolean(taxCode),
  });
}
