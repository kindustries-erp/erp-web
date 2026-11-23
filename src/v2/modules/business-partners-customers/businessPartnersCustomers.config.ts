import {
  createBusinessPartnerKeys,
  businessPartnerViewVisibility,
} from "@/v2/core/business-partners";
import type { BusinessPartnerModuleConfig } from "@/v2/core/business-partners";
import { businessPartnersCustomersApi } from "./api/businessPartnersCustomersApi";

/** Cấu hình ghép lõi họ business-partners cho module business-partners-customers */
export const businessPartnersCustomersConfig: BusinessPartnerModuleConfig = {
  api: businessPartnersCustomersApi,
  keys: createBusinessPartnerKeys(["v2-business-partners-customers"]),
  tableId: "business-partners-customers-table",
  partnerType: "CUSTOMER",
  permissionCollection: "business_partners",
  requiredFields: ["name"],
  viewVisibility: businessPartnerViewVisibility,
};
