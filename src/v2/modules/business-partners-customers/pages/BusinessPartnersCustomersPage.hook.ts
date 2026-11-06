import { useBusinessPartnerListController } from "@/v2/core/business-partners";
import { businessPartnersCustomersConfig } from "../businessPartnersCustomers.config";

/** Trạng thái màn Khách hàng: toàn bộ logic nằm ở lõi business-partners, module chỉ truyền cấu hình */
export function useBusinessPartnersCustomersPage() {
  return useBusinessPartnerListController(businessPartnersCustomersConfig);
}

export type BusinessPartnersCustomersPageState = ReturnType<
  typeof useBusinessPartnersCustomersPage
>;
