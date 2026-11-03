import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  BusinessPartner,
  BusinessPartnerFormValue,
  BusinessPartnerType,
} from "../domain/entities/businessPartner";
import type {
  BusinessPartnerEnvelopeDto,
  BusinessPartnerListResultDto,
  BusinessPartnerPayloadDto,
  ColumnOptionsResultDto,
  NextCodeDto,
  PartnerSelectOptionsDto,
  SyncFromInvoicesDto,
} from "./dtos/businessPartner.dto";

const BASE = "/api/v2/business-partners";
const OPTIONS_PAGE_SIZE = 20;

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
): BusinessPartnerPayloadDto => ({
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
  /** Danh sách chọn đối tượng cho sao kê: danh mục + người mua/bán từ hóa đơn. direction: OUT = khách hàng, IN = NCC */
  listSelectOptions: async (
    direction: "IN" | "OUT",
    search: string | undefined,
    page: number,
  ) => {
    const { data } = await v2HttpClient.get<PartnerSelectOptionsDto>(
      `${BASE}/options`,
      {
        params: {
          direction,
          search: search?.trim() || undefined,
          page,
          pageSize: OPTIONS_PAGE_SIZE,
        },
      },
    );
    return data;
  },
  /** Đồng bộ đối tác từ hóa đơn. dryRun = true chỉ xem trước. */
  syncFromInvoices: async (dryRun: boolean) => {
    const { data } = await v2HttpClient.post<SyncFromInvoicesDto>(
      `${BASE}/sync-from-invoices`,
      { dryRun },
    );
    return data;
  },
  list: async (partnerType: BusinessPartnerType, query: V2TableQuery) => {
    const { data } = await v2HttpClient.get<BusinessPartnerListResultDto>(
      BASE,
      { params: toBusinessPartnerListParams(partnerType, query) },
    );
    return data;
  },
  options: async (
    partnerType: BusinessPartnerType,
    params: V2FetchOptionsParams,
  ) => {
    const { data } = await v2HttpClient.get<ColumnOptionsResultDto>(
      `${BASE}/column-options`,
      {
        params: {
          column: params.columnKey,
          search: params.search,
          page: params.pageParam,
          pageSize: OPTIONS_PAGE_SIZE,
          filters: params.filtersStr,
          partnerType,
        },
      },
    );
    return data;
  },
  get: async (id: string): Promise<BusinessPartner> => {
    const { data } = await v2HttpClient.get<BusinessPartnerEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data as BusinessPartner;
  },
  nextCode: async (partnerType: BusinessPartnerType) => {
    const { data } = await v2HttpClient.get<NextCodeDto>(`${BASE}/next-code`, {
      params: { partnerType },
    });
    return data;
  },
  create: async (
    partnerType: BusinessPartnerType,
    form: BusinessPartnerFormValue,
  ) => {
    const { data } = await v2HttpClient.post<BusinessPartnerEnvelopeDto>(
      BASE,
      toBusinessPartnerPayload(partnerType, form),
    );
    return data.data as BusinessPartner;
  },
  update: async (
    id: string,
    partnerType: BusinessPartnerType,
    form: BusinessPartnerFormValue,
  ) => {
    const { data } = await v2HttpClient.patch<BusinessPartnerEnvelopeDto>(
      `${BASE}/${id}`,
      toBusinessPartnerPayload(partnerType, form),
    );
    return data.data as BusinessPartner;
  },
  remove: async (id: string) => {
    const { data } = await v2HttpClient.delete<BusinessPartnerEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data as BusinessPartner;
  },
};
