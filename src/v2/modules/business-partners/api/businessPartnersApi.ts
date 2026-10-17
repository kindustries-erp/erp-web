import { businessPartnersCoreApi } from "@/modules/business-partners-core/api/businessPartnersCoreApi";
import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  BusinessPartner,
  BusinessPartnerFormValue,
  BusinessPartnerType,
} from "../domain/entities/businessPartner";

export const toBusinessPartnerListParams = (
  partnerType: BusinessPartnerType,
  query: V2TableQuery,
) => ({
  partnerType,
  page: query.page,
  pageSize: query.pageSize,
  search: query.search?.trim() || undefined,
  sort: query.sorts.length
    ? query.sorts
        .map((sort) =>
          sort.direction === "desc" ? `-${sort.columnKey}` : sort.columnKey,
        )
        .join(",")
    : undefined,
  column_filters: Object.keys(query.columnFilters).length
    ? JSON.stringify(query.columnFilters)
    : undefined,
  column_search: Object.keys(query.columnSearch).length
    ? JSON.stringify(query.columnSearch)
    : undefined,
  column_operators: Object.keys(query.columnOperators).length
    ? JSON.stringify(query.columnOperators)
    : undefined,
  date_ranges: Object.keys(query.dateRanges).length
    ? JSON.stringify(query.dateRanges)
    : undefined,
});

export const toBusinessPartnerPayload = (
  partnerType: BusinessPartnerType,
  form: BusinessPartnerFormValue,
) => ({
  code: form.code.trim(),
  name: form.name.trim(),
  partnerType,
  displayName: form.displayName.trim() || undefined,
  taxCode: form.taxCode.trim() || undefined,
  phone: form.phone.trim() || undefined,
  email: form.email.trim() || undefined,
  address: form.address.trim() || undefined,
  contactName: form.contactName.trim() || undefined,
  status: form.status,
  notes: form.notes.trim() || undefined,
});

export const businessPartnersV2Api = {
  list: async (partnerType: BusinessPartnerType, query: V2TableQuery) =>
    businessPartnersCoreApi.list(
      toBusinessPartnerListParams(partnerType, query),
    ),
  options: (partnerType: BusinessPartnerType, params: V2FetchOptionsParams) =>
    businessPartnersCoreApi.getColumnOptions({
      column: params.columnKey,
      search: params.search,
      page: params.pageParam,
      pageSize: 20,
      filters: params.filtersStr,
      partnerType,
    }),
  get: (id: string) => businessPartnersCoreApi.get(id),
  nextCode: (partnerType: BusinessPartnerType) =>
    businessPartnersCoreApi.getNextCode(partnerType),
  create: (partnerType: BusinessPartnerType, form: BusinessPartnerFormValue) =>
    businessPartnersCoreApi.create(toBusinessPartnerPayload(partnerType, form)),
  update: (
    id: string,
    partnerType: BusinessPartnerType,
    form: BusinessPartnerFormValue,
  ) =>
    businessPartnersCoreApi.update(
      id,
      toBusinessPartnerPayload(partnerType, form),
    ),
  remove: (id: string): Promise<BusinessPartner> =>
    businessPartnersCoreApi.remove(id) as Promise<BusinessPartner>,
};
