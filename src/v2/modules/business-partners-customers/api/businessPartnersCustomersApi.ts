import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import {
  businessPartnersV2Api,
  type BusinessPartnerApi,
  type BusinessPartnerFormValue,
} from "@/v2/core/business-partners";

/** API client cho module Khách hàng, uỷ quyền đến core API với partnerType = 'CUSTOMER' */
export const businessPartnersCustomersApi: BusinessPartnerApi = {
  list: (query: V2TableQuery) => businessPartnersV2Api.list("CUSTOMER", query),
  options: (params: V2FetchOptionsParams) =>
    businessPartnersV2Api.options("CUSTOMER", params),
  get: (id: string) => businessPartnersV2Api.get(id),
  create: (form: BusinessPartnerFormValue) =>
    businessPartnersV2Api.create("CUSTOMER", form),
  update: (id: string, form: BusinessPartnerFormValue) =>
    businessPartnersV2Api.update(id, "CUSTOMER", form),
  remove: (id: string) => businessPartnersV2Api.remove(id),
  nextCode: () => businessPartnersV2Api.nextCode("CUSTOMER"),
};
