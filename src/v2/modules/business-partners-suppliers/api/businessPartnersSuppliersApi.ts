import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import {
  businessPartnersV2Api,
  type BusinessPartnerApi,
  type BusinessPartnerFormValue,
} from "@/v2/core/business-partners";

/** API client cho module Nhà cung cấp, uỷ quyền đến core API với partnerType = 'VENDOR' */
export const businessPartnersSuppliersApi: BusinessPartnerApi = {
  list: (query: V2TableQuery) => businessPartnersV2Api.list("VENDOR", query),
  options: (params: V2FetchOptionsParams) =>
    businessPartnersV2Api.options("VENDOR", params),
  get: (id: string) => businessPartnersV2Api.get(id),
  create: (form: BusinessPartnerFormValue) =>
    businessPartnersV2Api.create("VENDOR", form),
  update: (id: string, form: BusinessPartnerFormValue) =>
    businessPartnersV2Api.update(id, "VENDOR", form),
  remove: (id: string) => businessPartnersV2Api.remove(id),
  nextCode: () => businessPartnersV2Api.nextCode("VENDOR"),
  syncFromInvoices: (dryRun: boolean) =>
    businessPartnersV2Api.syncFromInvoices(dryRun),
};
