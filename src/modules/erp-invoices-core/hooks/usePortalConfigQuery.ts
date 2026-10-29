import { useQuery } from "@tanstack/react-query";
import {
  erpInvoicesCoreApi,
  type PortalConfigResponse,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

/** Khóa cache cấu hình Cổng Thuế, dùng chung cho mọi nơi đọc và invalidate */
export const portalConfigKey = ["erp-invoices", "portal-config"] as const;

/** Trạng thái cấu hình đã chuẩn hóa: không bao giờ chứa token/cookies thô */
export interface PortalConfigView {
  hasToken: boolean;
  hasPassword: boolean;
  username: string;
}

/** Chuẩn hóa response: ưu tiên `hasToken`, rơi về `token` khi API cũ chưa che */
export function toPortalConfigView(
  res: PortalConfigResponse,
): PortalConfigView {
  return {
    hasToken: res.hasToken ?? Boolean(res.token),
    hasPassword: Boolean(res.hasPassword),
    username: res.username ?? "",
  };
}

/** Cấu hình Cổng Thuế của công ty; cache 60 giây như trước khi chuyển sang query */
export function usePortalConfigQuery(enabled = true) {
  return useQuery({
    queryKey: portalConfigKey,
    queryFn: async () =>
      toPortalConfigView(await erpInvoicesCoreApi.getPortalConfig()),
    enabled,
    staleTime: 60_000,
  });
}
