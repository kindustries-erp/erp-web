import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type {
  V2FetchOptionsParams,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type {
  InvoiceDebt,
  InvoiceDebtFormValue,
} from "../domain/entities/invoiceDebt";
import type {
  InvoiceDebtEnvelopeDto,
  InvoiceDebtListResultDto,
  InvoiceDebtPayloadDto,
  ColumnOptionsResultDto,
} from "./dtos/invoiceDebt.dto";

const BASE = "/api/v1/erp-invoices/debts";
const OPTIONS_PAGE_SIZE = 20;

export const toInvoiceDebtsListParams = (query: V2TableQuery) => ({
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

export const toInvoiceDebtPayload = (
  form: InvoiceDebtFormValue,
): InvoiceDebtPayloadDto => ({
  search: form.search.trim(),

  partnerType: form.partnerType,
});

export const invoiceDebtsV2Api = {
  list: async (query: V2TableQuery) => {
    const { data } = await v2HttpClient.get<InvoiceDebtListResultDto>(BASE, {
      params: toInvoiceDebtsListParams(query),
    });
    return data;
  },
  options: async (params: V2FetchOptionsParams) => {
    const { data } = await v2HttpClient.get<ColumnOptionsResultDto>(
      `${BASE}/column-options`,
      {
        params: {
          column: params.columnKey,
          search: params.search,
          page: params.pageParam,
          pageSize: OPTIONS_PAGE_SIZE,
          filters: params.filtersStr,
        },
      },
    );
    return data;
  },
  get: async (id: string): Promise<InvoiceDebt> => {
    const { data } = await v2HttpClient.get<InvoiceDebtEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data as InvoiceDebt;
  },
  create: async (form: InvoiceDebtFormValue) => {
    const { data } = await v2HttpClient.post<InvoiceDebtEnvelopeDto>(
      BASE,
      toInvoiceDebtPayload(form),
    );
    return data.data as InvoiceDebt;
  },
  update: async (id: string, form: InvoiceDebtFormValue) => {
    const { data } = await v2HttpClient.patch<InvoiceDebtEnvelopeDto>(
      `${BASE}/${id}`,
      toInvoiceDebtPayload(form),
    );
    return data.data as InvoiceDebt;
  },
  remove: async (id: string) => {
    const { data } = await v2HttpClient.delete<InvoiceDebtEnvelopeDto>(
      `${BASE}/${id}`,
    );
    return data.data as InvoiceDebt;
  },
};
