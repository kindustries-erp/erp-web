import { useBusinessPartnerListController } from "@/v2/core/business-partners";
import { businessPartnersSuppliersConfig } from "../businessPartnersSuppliers.config";

/** Trạng thái màn Nhà cung cấp: toàn bộ logic nằm ở lõi business-partners, module chỉ truyền cấu hình */
export function useBusinessPartnersSuppliersPage() {
  return useBusinessPartnerListController(businessPartnersSuppliersConfig);
}

export type BusinessPartnersSuppliersPageState = ReturnType<
  typeof useBusinessPartnersSuppliersPage
>;
