import {
  createBusinessPartnerKeys,
  businessPartnerViewVisibility,
} from "@/v2/core/business-partners";
import type { BusinessPartnerModuleConfig } from "@/v2/core/business-partners";
import { businessPartnersSuppliersApi } from "./api/businessPartnersSuppliersApi";

/** Cấu hình ghép lõi họ business-partners cho module business-partners-suppliers */
export const businessPartnersSuppliersConfig: BusinessPartnerModuleConfig = {
  api: businessPartnersSuppliersApi,
  keys: createBusinessPartnerKeys(["v2-business-partners-suppliers"]),
  tableId: "business-partners-suppliers-table",
  partnerType: "VENDOR",
  permissionCollection: "business_partners",
  requiredFields: ["name"],
  viewVisibility: businessPartnerViewVisibility,
};
